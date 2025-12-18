"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Droplets } from "lucide-react"
import type { ForecastDay } from "@/lib/types"
import { formatTime } from "@/lib/utils"

interface HourlyForecastProps {
  forecast: ForecastDay | undefined
  isLoading: boolean
  detailed?: boolean
}

export function HourlyForecast({ forecast, isLoading, detailed = false }: HourlyForecastProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "rain":
      case "showers":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case "snow":
        return <CloudSnow className="h-6 w-6 text-sky-300" />
      case "fog":
      case "mist":
        return <CloudFog className="h-6 w-6 text-gray-400" />
      case "windy":
        return <Wind className="h-6 w-6 text-blue-400" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dự báo theo giờ</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!forecast?.hourly) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dự báo theo giờ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu dự báo theo giờ</p>
        </CardContent>
      </Card>
    )
  }

  if (detailed) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dự báo theo giờ chi tiết</h2>
        <div className="grid gap-4">
          {forecast.hourly.map((hour, index) => {
            const hourTime = new Date(hour.datetime)
            const isCurrentHour = new Date().getHours() === hour.hour

            return (
              <Card
                key={index}
                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ${
                  isCurrentHour ? "ring-2 ring-sky-500" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatTime(hourTime)}</span>
                      {isCurrentHour && <span className="text-xs text-sky-500 font-medium">Hiện tại</span>}
                    </div>

                    <div className="flex items-center space-x-2">
                      {getWeatherIcon(hour.condition)}
                      <span className="text-sm capitalize">{hour.description}</span>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold">{Math.round(hour.temperature)}°C</div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{hour.precipitation.toFixed(1)}mm</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Wind className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{Math.round(hour.wind_speed)}km/h</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{Math.round(hour.humidity)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Dự báo theo giờ hôm nay</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {forecast.hourly.slice(0, 12).map((hour, index) => {
              const hourTime = new Date(hour.datetime)
              const isCurrentHour = new Date().getHours() === hour.hour

              return (
                <div
                  key={index}
                  className={`flex flex-col items-center space-y-2 min-w-[80px] p-3 rounded-lg ${
                    isCurrentHour ? "bg-sky-100 dark:bg-sky-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-sm font-medium">{formatTime(hourTime)}</span>
                  {getWeatherIcon(hour.condition)}
                  <span className="text-lg font-bold">{Math.round(hour.temperature)}°</span>
                  <div className="flex items-center space-x-1">
                    <CloudRain className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{hour.precipitation.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="h-3 w-3 text-green-500" />
                    <span className="text-xs">{Math.round(hour.wind_speed)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
