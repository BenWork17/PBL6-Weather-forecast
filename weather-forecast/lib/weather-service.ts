import type { WeatherData, Location, AirQualityData, WeatherAlert, WeatherNews, HourlyForecast, ForecastDay } from "./types"

// Enhanced weather service with all features

function calculateUVIndex(solarRadiation: number, hour: number): number {
  // Ban đêm UV = 0
  if (hour < 6 || hour > 18) {
    return 0;
  }
  
  // Công thức chuyển đổi: UV Index ≈ Solar Radiation (W/m²) / 25
  // Solar radiation từ NASA POWER thường từ 0-1000 W/m²
  // UV Index scale: 0-11+
  const uvIndex = Math.max(0, Math.min(11, Math.round(solarRadiation / 25)));
  
  return uvIndex;
}

export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  try {
    if (!location || !location.name) {
      throw new Error('Location is required');
    }

    console.log('Fetching weather for:', location.name);
    const response = await fetch(`http://localhost:8000/api/weather/forecast/${encodeURIComponent(location.name)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API raw response:', data);

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    // Xử lý location data
    const locationData = data.location || {
      name: location.name,
      latitude: location.lat,
      longitude: location.lon
    };

    // Kiểm tra forecast data
    if (!data.forecast || !Array.isArray(data.forecast) || data.forecast.length === 0) {
      throw new Error('No forecast data available');
    }

    if (!data.forecast[0].hourly || !Array.isArray(data.forecast[0].hourly) || data.forecast[0].hourly.length === 0) {
      throw new Error('No hourly forecast data available');
    }

    // Lấy dữ liệu giờ hiện tại
    const currentHourData = data.forecast[0].hourly[0];
    console.log('Current hour raw data:', currentHourData);
    
    // Lấy hour từ datetime
    const currentHour = currentHourData.datetime 
      ? new Date(currentHourData.datetime).getHours() 
      : new Date().getHours();
    
    // Tính UV Index từ Solar Radiation
    const solarRadiation = Number(currentHourData.solar_radiation ?? currentHourData.CLRSKY_SFC_SW_DWN ?? 0);
    const calculatedUV = calculateUVIndex(solarRadiation, currentHour);
    
    console.log('UV Calculation:', { solarRadiation, currentHour, calculatedUV });
    
    // Xử lý current weather
    const currentWeather = {
      temperature: Number(currentHourData.temperature ?? currentHourData.temp ?? 0),
      condition: currentHourData.condition || determineWeatherCondition(currentHourData),
      icon: currentHourData.icon || getIconForCondition(currentHourData.condition || determineWeatherCondition(currentHourData)),
      timestamp: currentHourData.datetime || new Date().toISOString(),
    };

    // Tính feels like
    const feelsLike = calculateFeelsLike(
      Number(currentHourData.temperature ?? currentHourData.temp ?? 0),
      Number(currentHourData.humidity ?? 0),
      Number(currentHourData.wind_speed ?? currentHourData.windSpeed ?? 0)
    );

    // Xử lý details
    const details = {
      humidity: Number(currentHourData.humidity ?? 0),
      windSpeed: Number(currentHourData.wind_speed ?? currentHourData.windSpeed ?? 0),
      windDirection: Number(currentHourData.wind_direction ?? currentHourData.windDirection ?? 0),
      pressure: Number(currentHourData.pressure ?? 1013),
      feelsLike: feelsLike,
      uvIndex: Number(currentHourData.uv_index ?? currentHourData.uvIndex ?? calculatedUV),
      visibility: Number(currentHourData.visibility ?? 10),
      precipitation: Number(currentHourData.precipitation ?? 0)
    };

    console.log('Processed details:', details);

    // Xử lý forecast data
    const forecast: ForecastDay[] = data.forecast.map((day: any) => {
      const hourlyData: HourlyForecast[] = (day.hourly || []).map((hour: any) => {
        // Parse datetime để lấy hour
        let hourNumber = hour.hour;
        if (hourNumber === undefined && hour.datetime) {
          const timePart = hour.datetime.split('T')[1];
          if (timePart) {
            hourNumber = parseInt(timePart.split(':')[0]);
          }
        }

        // Tính UV cho hourly forecast
        const hourlySolar = Number(hour.solar_radiation ?? hour.CLRSKY_SFC_SW_DWN ?? 0);
        const hourlyUV = calculateUVIndex(hourlySolar, Number(hourNumber ?? 0));

        return {
          datetime: hour.datetime || '',
          hour: Number(hourNumber ?? 0),
          temperature: Number(hour.temperature ?? hour.temp ?? 0),
          condition: hour.condition || determineWeatherCondition(hour),
          precipitation: Number(hour.precipitation ?? 0),
          wind_speed: Number(hour.wind_speed ?? hour.windSpeed ?? 0),
          humidity: Number(hour.humidity ?? 0),
          pressure: Number(hour.pressure ?? 1013),
          description: hour.description || '',
          icon: hour.icon || getIconForCondition(hour.condition || determineWeatherCondition(hour)),
          source: hour.source || 'api',
          uv_index: hourlyUV
        };
      });

      return {
        date: day.date,
        hourly: hourlyData
      };
    });

    const weatherData: WeatherData = {
      location: {
        name: locationData.name,
        latitude: Number(locationData.latitude ?? location.lat),
        longitude: Number(locationData.longitude ?? location.lon)
      },
      current: currentWeather,
      details: details,
      forecast: forecast
    };

    console.log('Final processed weather data:', {
      location: weatherData.location,
      current: weatherData.current,
      details: weatherData.details,
      forecastDays: weatherData.forecast.length,
      firstDayHours: weatherData.forecast[0]?.hourly.length,
      sampleHourly: weatherData.forecast[0]?.hourly[0]
    });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function calculateFeelsLike(temperature: number, humidity: number, windSpeed: number): number {
  // Heat index calculation for high temperatures (≥27°C)
  if (temperature >= 27) {
    // Simplified heat index formula
    const T = temperature;
    const RH = humidity;
    const HI = -8.78469475556 + 
               1.61139411 * T + 
               2.33854883889 * RH + 
               -0.14611605 * T * RH + 
               -0.012308094 * T * T + 
               -0.0164248277778 * RH * RH;
    return Math.round(HI * 10) / 10;
  }
  // Wind chill calculation for low temperatures (≤10°C)
  else if (temperature <= 10 && windSpeed > 0) {
    const T = temperature;
    const V = windSpeed * 3.6; // Convert m/s to km/h
    const WC = 13.12 + 0.6215 * T - 11.37 * Math.pow(V, 0.16) + 0.3965 * T * Math.pow(V, 0.16);
    return Math.round(WC * 10) / 10;
  }
  else {
    return temperature;
  }
}

function determineWeatherCondition(hour: any): string {
  const precipitation = Number(hour.precipitation ?? 0);
  const humidity = Number(hour.humidity ?? 0);
  const description = (hour.description || '').toLowerCase();

  // Kiểm tra từ description trước
  if (description.includes('rain') || description.includes('mưa')) return "Rainy";
  if (description.includes('snow') || description.includes('tuyết')) return "Snowy";
  if (description.includes('thunder') || description.includes('dông')) return "Thunderstorm";
  if (description.includes('cloud') || description.includes('mây')) return "Cloudy";

  // Kiểm tra theo precipitation
  if (precipitation > 5) return "Rainy";
  else if (precipitation > 0.5) return "Light Rain";
  else if (humidity > 80) return "Cloudy";
  else if (humidity < 40) return "Clear";
  else return "Partly Cloudy";
}

function getIconForCondition(condition: string): string {
  const cond = condition.toLowerCase();
  
  if (cond.includes("rain") || cond.includes("mưa")) return "cloud-rain";
  if (cond.includes("snow") || cond.includes("tuyết")) return "cloud-snow";
  if (cond.includes("thunder") || cond.includes("dông")) return "cloud-lightning";
  if (cond.includes("cloud") || cond.includes("mây")) return "cloud";
  if (cond.includes("clear") || cond.includes("nắng")) return "sun";
  if (cond.includes("partly") || cond.includes("một phần")) return "cloud-sun";
  
  return "sun";
}

export async function fetchAirQuality(location: Location): Promise<AirQualityData> {
  // Thử gọi API thực nếu có, nếu không thì dùng mock data
  try {
    // Implement API call here
  } catch (error) {
    console.log('Using mock air quality data');
  }

  // Mock data nếu API không có
  await new Promise((resolve) => setTimeout(resolve, 300))

  const aqi = Math.round(30 + Math.random() * 120)

  return {
    aqi,
    pm25: Math.round(10 + Math.random() * 40),
    pm10: Math.round(20 + Math.random() * 60),
    o3: Math.round(50 + Math.random() * 100),
    no2: Math.round(20 + Math.random() * 80),
    so2: Math.round(5 + Math.random() * 30),
    co: Math.round((0.5 + Math.random() * 2) * 10) / 10,
    category: aqi <= 50 ? "good" : aqi <= 100 ? "moderate" : aqi <= 150 ? "unhealthy_sensitive" : "unhealthy",
    healthAdvice: aqi <= 50 ? "Chất lượng không khí tốt" : "Nên hạn chế hoạt động ngoài trời",
  }
}

export async function fetchWeatherAlerts(location: Location): Promise<WeatherAlert[]> {
  // Thử gọi API thực
  try {
    // Implement API call here
  } catch (error) {
    console.log('Using mock alerts data');
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  const alerts: WeatherAlert[] = []

  // Random alerts để demo
  if (Math.random() > 0.7) {
    alerts.push({
      id: "alert-1",
      type: "warning",
      title: "Cảnh báo mưa lớn",
      description: "Dự báo có mưa lớn trong 3 giờ tới, cần đề phòng ngập úng.",
      severity: "moderate",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    })
  }

  if (Math.random() > 0.8) {
    alerts.push({
      id: "alert-2",
      type: "watch",
      title: "Theo dõi gió mạnh",
      description: "Gió có thể đạt cấp 6-7 vào chiều tối.",
      severity: "minor",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    })
  }

  return alerts
}

export async function fetchWeatherNews(): Promise<WeatherNews[]> {
  // Thử gọi API thực
  try {
    // Implement API call here
  } catch (error) {
    console.log('Using mock news data');
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "news-1",
      title: "Bão số 4 đang tiến vào Biển Đông, dự báo ảnh hưởng đến miền Trung",
      summary:
        "Cơn bão mới hình thành trên Biển Đông với sức gió mạnh cấp 8-9, dự báo sẽ ảnh hưởng đến các tỉnh miền Trung trong tuần tới.",
      content: "Nội dung chi tiết về cơn bão...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Cảnh báo",
      publishedAt: new Date().toISOString(),
      source: "Trung tâm Dự báo Khí tượng",
      url: "#",
    },
    {
      id: "news-2",
      title: "Thời tiết miền Bắc chuyển lạnh, nhiệt độ giảm 5-7 độ C",
      summary: "Không khí lạnh tăng cường khiến nhiệt độ miền Bắc giảm mạnh, có nơi dưới 15 độ C.",
      content: "Chi tiết về đợt lạnh...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Dự báo",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: "VTV",
      url: "#",
    },
    {
      id: "news-3",
      title: "Hạn hán kéo dài ở miền Nam, cần tiết kiệm nước",
      summary: "Tình trạng hạn hán kéo dài tại các tỉnh miền Nam, người dân cần sử dụng nước tiết kiệm.",
      content: "Thông tin về tình hình hạn hán...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Môi trường",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: "Báo Tuổi Trẻ",
      url: "#",
    },
  ]
}
