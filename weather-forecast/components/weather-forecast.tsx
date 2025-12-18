import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind } from "lucide-react"
import type { ForecastDay } from "@/lib/types"

interface WeatherForecastProps {
  forecast: ForecastDay[] | undefined
  isLoading: boolean
}

export function WeatherForecast({ forecast, isLoading }: WeatherForecastProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rain":
      case "showers":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      case "snow":
        return <CloudSnow className="h-8 w-8 text-sky-300" />
      case "fog":
      case "mist":
        return <CloudFog className="h-8 w-8 text-gray-400" />
      case "windy":
        return <Wind className="h-8 w-8 text-blue-400" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">7-Day Forecast</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {isLoading
          ? Array(7)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 flex flex-col items-center justify-between h-full">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-8 rounded-full my-2" />
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))
          : forecast?.map((day, index) => (
              <Card
                key={index}
                className={`bg-white/50 dark:bg-slate-800/50 ${index === 0 ? "border-sky-500 dark:border-sky-400" : ""}`}
              >
                <CardContent className="p-4 flex flex-col items-center justify-between h-full">
                  <p className="font-medium text-center">{index === 0 ? "Today" : getDayName(day.date)}</p>
                  {getWeatherIcon(day.condition)}
                  <div className="flex flex-col items-center gap-1 mt-2">
                    <p className="font-bold">{Math.round(day.maxTemp)}°</p>
                    <p className="text-muted-foreground">{Math.round(day.minTemp)}°</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
