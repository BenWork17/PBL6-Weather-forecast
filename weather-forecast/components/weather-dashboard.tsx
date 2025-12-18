"use client"

import { useState, useEffect } from "react"
import { WeatherHeader } from "@/components/weather-header"
import { WeatherForecast } from "@/components/weather-forecast"
import { WeatherDetails } from "@/components/weather-details"
import { WeatherMap } from "@/components/weather-map"
import { HourlySlider } from "@/components/hourly-slider"
import { LocationSearch } from "@/components/location-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { fetchWeatherData } from "@/lib/weather-service"
import type { WeatherData, Location } from "@/lib/types"
import { vietnamProvinces } from "@/lib/constants"

export function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location>(vietnamProvinces[0])

  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchWeatherData(selectedLocation)
        setWeatherData(data)
      } catch (error) {
        console.error("Failed to fetch weather data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeatherData()
  }, [selectedLocation])

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-none shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <WeatherHeader location={selectedLocation} currentWeather={weatherData?.current} isLoading={isLoading} />
            <LocationSearch onLocationChange={handleLocationChange} locations={vietnamProvinces} />
          </div>

          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="forecast">Dự báo</TabsTrigger>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="map">Bản đồ</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-6">
              <WeatherForecast forecast={weatherData?.forecast} isLoading={isLoading} />
              <HourlySlider forecast={weatherData?.forecast?.[0]} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="details">
              <WeatherDetails details={weatherData?.details} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="map">
              <WeatherMap location={selectedLocation} weatherData={weatherData} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
