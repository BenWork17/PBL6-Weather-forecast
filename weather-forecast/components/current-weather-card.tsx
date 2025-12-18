import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, Wind, Droplets, Eye, Gauge } from "lucide-react"
import type { WeatherData, Location } from "@/lib/types"
import { formatDate, formatTime } from "@/lib/utils"

interface CurrentWeatherCardProps {
  weather: WeatherData | null
  location: Location
  isLoading: boolean
}

export function CurrentWeatherCard({ weather, location, isLoading }: CurrentWeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-20 w-20 text-yellow-500" />
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="h-20 w-20 text-gray-500" />
      case "rain":
      case "showers":
        return <CloudRain className="h-20 w-20 text-blue-500" />
      case "snow":
        return <CloudSnow className="h-20 w-20 text-sky-300" />
      case "fog":
      case "mist":
        return <CloudFog className="h-20 w-20 text-gray-400" />
      default:
        return <Sun className="h-20 w-20 text-yellow-500" />
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-32" />
            </div>
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <Card className="bg-gradient-to-br from-sky-400 to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">{location.name}</h2>
            <p className="text-sky-100">{formatDate(new Date())}</p>
            <p className="text-sky-100">{formatTime(new Date())}</p>
          </div>
          {getWeatherIcon(weather.current.condition)}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-6xl font-bold">{Math.round(weather.current.temperature)}°</div>
            <p className="text-xl text-sky-100 capitalize">{weather.current.condition}</p>
            <p className="text-sky-100">Cảm giác như {Math.round(weather.details.feelsLike)}°</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4" />
              <span>{Math.round(weather.details.windSpeed)} km/h</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4" />
              <span>{weather.details.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>{weather.details.visibility} km</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4" />
              <span>{Math.round(weather.details.pressure)} hPa</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
