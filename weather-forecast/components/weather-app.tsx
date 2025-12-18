"use client"

import { useState, useEffect } from "react"
import { WeatherHeader } from "@/components/weather-header"
import { WeatherNavigation } from "@/components/weather-navigation"
import { CurrentWeatherCard } from "@/components/current-weather-card"
import { HourlyForecast } from "@/components/hourly-forecast"
import { DailyForecast } from "@/components/daily-forecast"
import { WeatherMaps } from "@/components/weather-maps"
import { AirQuality } from "@/components/air-quality"
import { WeatherAlerts } from "@/components/weather-alerts"
import { WeatherNews } from "@/components/weather-news"
import { WeatherDetails } from "@/components/weather-details"
import { HistoricalWeather } from "@/components/historical-weather"
import { SunMoonInfo } from "@/components/sun-moon-info"
import { WeatherRadar } from "@/components/weather-radar"
import { LocationManager } from "@/components/location-manager"
import { WeatherWidgets } from "@/components/weather-widgets"
import { DailyCharts } from "@/components/daily-charts"
import { NASAPowerDashboard } from "@/components/nasa-power-dashboard"
import { fetchWeatherData, fetchAirQuality, fetchWeatherAlerts, fetchWeatherNews } from "@/lib/weather-service"
import type { WeatherData, Location, AirQualityData, WeatherAlert, WeatherNews as WeatherNewsType, ForecastDay } from "@/lib/types"
import { vietnamProvinces } from "@/lib/constants"

const DEFAULT_LOCATION: Location = {
  name: "Đà Nẵng",
  lat: 16.0544,
  lon: 108.2022,
}

export function WeatherApp() {
  const [activeTab, setActiveTab] = useState("current")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [news, setNews] = useState<WeatherNewsType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATION)
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([DEFAULT_LOCATION])
  const [selectedDayForecast, setSelectedDayForecast] = useState<ForecastDay | undefined>(undefined)

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('Loading data for location:', selectedLocation)

        // Validate location before fetching
        if (!selectedLocation || !selectedLocation.name) {
          throw new Error('Invalid location selected')
        }

        const [weatherResult, airQualityResult, alertsResult, newsResult] = await Promise.all([
          fetchWeatherData(selectedLocation).catch(err => {
            console.error('Weather data error:', err)
            return null
          }),
          fetchAirQuality(selectedLocation).catch(err => {
            console.error('Air quality error:', err)
            return null
          }),
          fetchWeatherAlerts(selectedLocation).catch(err => {
            console.error('Alerts error:', err)
            return []
          }),
          fetchWeatherNews().catch(err => {
            console.error('News error:', err)
            return []
          }),
        ])

        console.log('Weather result:', weatherResult)

        if (weatherResult) {
          setWeatherData(weatherResult)
          if (weatherResult.forecast && weatherResult.forecast.length > 0) {
            setSelectedDayForecast(weatherResult.forecast[0])
          }
        } else {
          // Set fallback weather data
          setWeatherData({
            current: {
              temperature: 25,
              condition: "Clear",
              timestamp: new Date(),
            },
            details: {
              humidity: 70,
              windSpeed: 10,
              pressure: 1013,
              precipitation: 0,
              uvIndex: 5,
              visibility: 10,
              feelsLike: 25,
            },
            forecast: [],
            lastUpdated: new Date(),
          })
        }

        setAirQuality(airQualityResult)
        setAlerts(alertsResult)
        setNews(newsResult)
        
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu thời tiết')
        
        // Set fallback data on error
        setWeatherData({
          current: {
            temperature: 25,
            condition: "Clear",
            timestamp: new Date(),
          },
          details: {
            humidity: 70,
            windSpeed: 10,
            pressure: 1013,
            precipitation: 0,
            uvIndex: 5,
            visibility: 10,
            feelsLike: 25,
          },
          forecast: [],
          lastUpdated: new Date(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [selectedLocation])

  const handleLocationChange = (location: Location) => {
    console.log('Location changed to:', location)
    
    // Validate location before setting
    if (!location || !location.name) {
      console.error('Invalid location:', location)
      return
    }
    
    setSelectedLocation(location)
  }

  const handleAddFavorite = (location: Location) => {
    if (!location || !location.name) {
      console.error('Invalid location to add:', location)
      return
    }
    
    if (!favoriteLocations.find((loc) => loc.name === location.name)) {
      setFavoriteLocations([...favoriteLocations, location])
    }
  }

  const handleRemoveFavorite = (locationId: string) => {
    setFavoriteLocations(favoriteLocations.filter((loc) => loc.name !== locationId))
  }

  const handleDaySelect = (day: ForecastDay) => {
    setSelectedDayForecast(day)
    setActiveTab('hourly')
  }

  const renderContent = () => {
    // Show error message if there's an error
    if (error && !isLoading) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Không thể tải dữ liệu
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            {error}. Hiển thị dữ liệu mặc định.
          </p>
        </div>
      )
    }

    switch (activeTab) {
      case "current":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CurrentWeatherCard weather={weatherData} location={selectedLocation} isLoading={isLoading} />
                <DailyForecast forecast={weatherData?.forecast} isLoading={isLoading} onDaySelect={handleDaySelect} />
              </div>
              <div className="space-y-6">
                <WeatherAlerts alerts={alerts} isLoading={isLoading} />
                <AirQuality data={airQuality} isLoading={isLoading} />
                <SunMoonInfo location={selectedLocation} isLoading={isLoading} />
                <WeatherWidgets weather={weatherData} isLoading={isLoading} />
              </div>
            </div>
          </div>
        )
      case "hourly":
        return <HourlyForecast forecast={selectedDayForecast} isLoading={isLoading} detailed={true} />
      case "daily":
        return <DailyForecast forecast={weatherData?.forecast} isLoading={isLoading} onDaySelect={handleDaySelect} />
      case "charts":
        return <DailyCharts weatherData={weatherData} isLoading={isLoading} />
      case "maps":
        return <WeatherMaps location={selectedLocation} isLoading={isLoading} />
      case "radar":
        return <WeatherRadar location={selectedLocation} isLoading={isLoading} />
      case "air-quality":
        return <AirQuality data={airQuality} isLoading={isLoading} detailed={true} />
      case "details":
        return <WeatherDetails details={weatherData?.details} location={selectedLocation} isLoading={isLoading} />
      case "historical":
        return <HistoricalWeather location={selectedLocation} isLoading={isLoading} />
      case "nasa-power":
        return <NASAPowerDashboard location={selectedLocation} isLoading={isLoading} />
      case "news":
        return <WeatherNews news={news} isLoading={isLoading} />
      case "locations":
        return (
          <LocationManager
            favoriteLocations={favoriteLocations}
            onLocationSelect={handleLocationChange}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <WeatherHeader
        location={selectedLocation}
        onLocationChange={handleLocationChange}
        favoriteLocations={favoriteLocations}
        onAddFavorite={handleAddFavorite}
      />
      <WeatherNavigation activeTab={activeTab} onTabChange={setActiveTab} alertCount={alerts.length} />
      <div className="container mx-auto px-4 py-6">{renderContent()}</div>
    </div>
  )
}
