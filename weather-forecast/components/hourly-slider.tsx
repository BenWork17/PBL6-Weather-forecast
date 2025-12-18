"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Droplets, Gauge } from "lucide-react"
import type { ForecastDay } from "@/lib/types"
import { formatTime } from "@/lib/utils"

interface HourlySliderProps {
  forecast: ForecastDay | undefined
  isLoading: boolean
}

export function HourlySlider({ forecast, isLoading }: HourlySliderProps) {
  const [selectedHourIndex, setSelectedHourIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial selected hour to current hour
    if (forecast?.hourly) {
      const currentHour = new Date().getHours()
      const hourIndex = forecast.hourly.findIndex((h) => new Date(h.time).getHours() === currentHour)
      if (hourIndex !== -1) {
        setSelectedHourIndex(hourIndex)
      }
    }
  }, [forecast])

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

  const selectedHour = forecast?.hourly?.[selectedHourIndex]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dự báo theo giờ hôm nay</h2>

      {isLoading ? (
        <Skeleton className="h-[180px] w-full" />
      ) : (
        <>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex p-4" ref={scrollRef}>
              {forecast?.hourly?.map((hour, index) => {
                const hourTime = new Date(hour.time)
                const isCurrentHour = new Date().getHours() === hourTime.getHours()

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-between p-2 min-w-[80px] cursor-pointer transition-all
                      ${selectedHourIndex === index ? "bg-sky-100 dark:bg-sky-900/30 rounded-md" : ""}
                      ${isCurrentHour ? "border-b-2 border-sky-500" : ""}`}
                    onClick={() => setSelectedHourIndex(index)}
                  >
                    <span className="text-sm font-medium">{hourTime.getHours()}:00</span>
                    {getWeatherIcon(hour.condition)}
                    <span className="text-lg font-bold mt-1">{Math.round(hour.temperature)}°</span>
                    <div className="flex items-center mt-1">
                      <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                      <span className="text-xs">{Math.round(hour.humidity)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {selectedHour && (
            <Card className="bg-white/50 dark:bg-slate-800/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Thời gian</h3>
                    <p className="text-lg font-medium">{formatTime(new Date(selectedHour.time))}</p>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Nhiệt độ</h3>
                    <div className="flex items-center">
                      <p className="text-lg font-medium">{Math.round(selectedHour.temperature)}°C</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Lượng mưa</h3>
                    <div className="flex items-center">
                      <CloudRain className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-lg font-medium">{selectedHour.precipitation.toFixed(1)} mm</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Tốc độ gió</h3>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 text-blue-400 mr-1" />
                      <p className="text-lg font-medium">{Math.round(selectedHour.windSpeed)} km/h</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Độ ẩm</h3>
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-lg font-medium">{Math.round(selectedHour.humidity)}%</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Áp suất</h3>
                    <div className="flex items-center">
                      <Gauge className="h-4 w-4 text-purple-500 mr-1" />
                      <p className="text-lg font-medium">1013 hPa</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Tầm nhìn</h3>
                    <p className="text-lg font-medium">10 km</p>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <h3 className="text-sm text-muted-foreground">Chỉ số UV</h3>
                    <p className="text-lg font-medium">{Math.round(Math.random() * 10)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
