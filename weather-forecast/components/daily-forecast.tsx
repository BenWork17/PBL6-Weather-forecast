import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Droplets, Eye, Gauge } from "lucide-react"
import type { ForecastDay, HourlyForecast } from "@/lib/types"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

interface DailyForecastProps {
  forecast: ForecastDay[] | undefined
  isLoading: boolean
}

export function DailyForecast({ forecast, isLoading }: DailyForecastProps) {
  const [selectedDay, setSelectedDay] = useState<string>("")

  // Get the first day's data if no day is selected
  const selectedDayData = useMemo(() => {
    if (!forecast || forecast.length === 0) return null;
    
    const day = selectedDay ? forecast.find(d => d.date === selectedDay) : forecast[0];
    if (!day) return null;

    // Calculate max and min temperatures from hourly data, filtering out invalid values
    const temperatures = day.hourly
      .map(h => h.temperature)
      .filter(temp => !isNaN(temp) && temp > -50 && temp < 50); // Filter out invalid temperatures
    
    const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
    const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;

    // Normalize hourly data
    const normalizedHourly = day.hourly.map(hour => {
      return {
        ...hour,
        temperature: isNaN(hour.temperature) || hour.temperature < -50 || hour.temperature > 50 
          ? 0 : Math.round(hour.temperature * 10) / 10,
        humidity: isNaN(hour.humidity) ? 0 : Math.round(hour.humidity * 10) / 10,
        wind_speed: isNaN(hour.wind_speed) || hour.wind_speed < 0 || hour.wind_speed > 200
          ? 0 : Math.round(hour.wind_speed * 10) / 10,
        precipitation: isNaN(hour.precipitation) || hour.precipitation < 0
          ? 0 : Math.round(hour.precipitation * 10) / 10,
        pressure: isNaN(hour.pressure) || hour.pressure < 80 || hour.pressure > 110
          ? 101 : Math.round(hour.pressure) // Default to 101 kPa
      };
    });

    return {
      ...day,
      hourly: normalizedHourly,
      maxTemp,
      minTemp,
      condition: day.hourly[0]?.condition || "clear"
    };
  }, [forecast, selectedDay]);

  // Format hourly data for the chart
  const hourlyData = useMemo(() => {
    if (!selectedDayData) return [];
    
    return selectedDayData.hourly
      .filter(hour => {
        const date = new Date(hour.datetime);
        return !isNaN(date.getTime()); // Filter out invalid dates
      })
      .map(hour => ({
        ...hour,
        windSpeed: hour.wind_speed, // Map wind_speed to windSpeed for the chart
        displayTime: new Date(hour.datetime).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }));
  }, [selectedDayData]);

  const getWeatherIcon = (condition: string, className?: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className={cn("h-5 w-5 text-yellow-500", className)} />
      case "cloudy":
      case "partly cloudy":
        return <Cloud className={cn("h-5 w-5 text-gray-500", className)} />
      case "rain":
      case "showers":
        return <CloudRain className={cn("h-5 w-5 text-blue-500", className)} />
      case "snow":
        return <CloudSnow className={cn("h-5 w-5 text-sky-300", className)} />
      case "fog":
      case "mist":
        return <CloudFog className={cn("h-5 w-5 text-gray-400", className)} />
      case "windy":
        return <Wind className={cn("h-5 w-5 text-blue-400", className)} />
      default:
        return <Sun className={cn("h-5 w-5 text-yellow-500", className)} />
    }
  }

  const getDayName = (date: string) => {
    const day = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Reset time for accurate comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    day.setHours(0, 0, 0, 0)

    if (day.getTime() === today.getTime()) {
      return "Hôm nay"
    } else if (day.getTime() === tomorrow.getTime()) {
      return "Ngày mai"
    } else {
      // Display weekday, day, and month for clarity
      return day.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })
    }
  }

  // Custom X-axis tick with icon for hourly chart
  const CustomHourlyXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const hourData = payload.payload;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
          {hourData?.displayTime || payload.value}
        </text>
        {hourData && (
          <foreignObject x={-12} y={-30} width={24} height={24} style={{ overflow: 'visible' }}>
            <div className="flex justify-center">
              {getWeatherIcon(hourData.condition, "h-4 w-4")}
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dự báo thời tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!forecast || forecast.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dự báo thời tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu dự báo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dự báo thời tiết theo ngày</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {forecast.map((day) => {
            const date = new Date(day.date);
            const isSelected = day.date === selectedDay || (!selectedDay && day === forecast[0]);
            
            // Filter out invalid temperatures
            const temperatures = day.hourly
              .map(h => h.temperature)
              .filter(temp => !isNaN(temp) && temp > -50 && temp < 50);
            
            const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
            const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
            const dayCondition = day.hourly[0]?.condition || "clear";
            
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-sm font-medium">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </span>
                <span className="text-xs">
                  {date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                </span>
                {getWeatherIcon(dayCondition)}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-600">
                    {Math.round(maxTemp)}°
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(minTemp)}°
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          {selectedDayData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getWeatherIcon(selectedDayData.condition)}
                <span className="text-lg font-medium capitalize">{selectedDayData.condition}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Cao nhất</span>
                  <p className="text-xl font-bold text-red-600">{Math.round(selectedDayData.maxTemp)}°</p>
                </div>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Thấp nhất</span>
                  <p className="text-xl font-bold text-blue-600">{Math.round(selectedDayData.minTemp)}°</p>
                </div>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}
              margin={{
                top: 10, right: 30, left: 0, bottom: 0,
              }}>
              <defs>
                <linearGradient id="tempGradientTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.8}/>
                </linearGradient>
                 <linearGradient id="tempGradientHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.8}/>
                </linearGradient>
                 <linearGradient id="tempGradientWind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.8}/>
                </linearGradient>
                 <linearGradient id="tempGradientPrecipitation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#38b2ac" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="tempGradientPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayTime" 
                tick={CustomHourlyXAxisTick} 
                height={80}
                interval={2}
                tickMargin={30}
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
                minTickGap={50}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels: { [key: string]: string } = {
                    temperature: 'Nhiệt độ',
                    humidity: 'Độ ẩm',
                    windSpeed: 'Tốc độ gió',
                    precipitation: 'Lượng mưa',
                    pressure: 'Áp suất'
                  }
                  const units: { [key: string]: string } = {
                    temperature: '°C',
                    humidity: ' g/kg',
                    windSpeed: ' km/h',
                    precipitation: ' mm',
                    pressure: ' hPa'
                  }
                  
                  // Special handling for pressure display
                  if (name === 'pressure') {
                    return [`${value * 10}${units[name]}`, labels[name]];
                  }
                  
                  return [`${Math.round(value)}${units[name] || ''}`, labels[name] || name];
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `Thời gian: ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const units: { [key: string]: string } = {
                      temperature: '°C',
                      humidity: ' g/kg',
                      windSpeed: ' km/h',
                      precipitation: ' mm',
                      pressure: ' hPa'
                    };
                    const labels: { [key: string]: string } = {
                      temperature: 'Nhiệt độ',
                      humidity: 'Độ ẩm',
                      windSpeed: 'Tốc độ gió',
                      precipitation: 'Lượng mưa',
                      pressure: 'Áp suất'
                    };

                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          {getWeatherIcon(data.condition, "h-5 w-5")}
                          <span className="font-medium">{data.condition}</span>
                        </div>
                        <div className="space-y-1">
                          {payload.map((entry: any, index: number) => {
                            const name = entry.dataKey;
                            const value = entry.value;
                            const unit = units[name] || '';
                            const label = labels[name] || name;
                            
                            return (
                              <div key={index} className="flex justify-between gap-4">
                                <span className="text-gray-600 dark:text-gray-300">{label}</span>
                                <span className="font-medium">
                                  {`${Math.round(value)}${unit}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" fillOpacity={0.6} fill="url(#tempGradientTemp)" name="Nhiệt độ" unit="°C" />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={0.6} fill="url(#tempGradientHumidity)" name="Độ ẩm" unit=" g/kg" />
              <Area type="monotone" dataKey="windSpeed" stroke="#22c55e" fillOpacity={0.6} fill="url(#tempGradientWind)" name="Tốc độ gió" unit=" km/h" />
              <Area type="monotone" dataKey="precipitation" stroke="#0ea5e9" fillOpacity={0.6} fill="url(#tempGradientPrecipitation)" name="Lượng mưa" unit=" mm" />
              <Area type="monotone" dataKey="pressure" stroke="#8b5cf6" fillOpacity={0.6} fill="url(#tempGradientPressure)" name="Áp suất" unit=" hPa" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
