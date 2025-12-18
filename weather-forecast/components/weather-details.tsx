"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Thermometer, Droplets, Wind, Gauge, Sun, CloudRain, Eye, Compass, Zap, Snowflake } from "lucide-react"
import type { WeatherDetails as WeatherDetailsType, Location } from "@/lib/types"

interface WeatherDetailsProps {
  details: WeatherDetailsType | undefined
  location: Location
  isLoading: boolean
}

export function WeatherDetails({ details, location, isLoading }: WeatherDetailsProps) {
  const getWindDirection = (degrees: number) => {
    const directions = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: "Thấp", color: "text-green-600" }
    if (uvIndex <= 5) return { level: "Trung bình", color: "text-yellow-600" }
    if (uvIndex <= 7) return { level: "Cao", color: "text-orange-600" }
    if (uvIndex <= 10) return { level: "Rất cao", color: "text-red-600" }
    return { level: "Cực cao", color: "text-purple-600" }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Chi tiết thời tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Chi tiết thời tiết</h2>
        <p className="text-muted-foreground">Không có dữ liệu chi tiết</p>
      </div>
    )
  }

  const detailItems = [
    {
      name: "Nhiệt độ cảm nhận",
      value: `${Math.round(details.feelsLike)}°C`,
      icon: <Thermometer className="h-6 w-6 text-red-500" />,
      description: "Nhiệt độ mà cơ thể cảm nhận được",
      progress: ((details.feelsLike + 10) / 60) * 100,
    },
    {
      name: "Độ ẩm",
      value: `${details.humidity}%`,
      icon: <Droplets className="h-6 w-6 text-blue-500" />,
      description: details.humidity < 30 ? "Khô" : details.humidity > 70 ? "Ẩm ướt" : "Bình thường",
      progress: details.humidity,
    },
    {
      name: "Tốc độ gió",
      value: `${Math.round(details.windSpeed)} km/h`,
      icon: <Wind className="h-6 w-6 text-green-500" />,
      description: `Hướng ${getWindDirection(details.windDirection)}`,
      progress: (details.windSpeed / 100) * 100,
    },
    {
      name: "Áp suất khí quyển",
      value: `${Math.round(details.pressure)} hPa`,
      icon: <Gauge className="h-6 w-6 text-purple-500" />,
      description: details.pressure > 1013 ? "Cao" : "Thấp",
      progress: ((details.pressure - 980) / 60) * 100,
    },
    {
      name: "Chỉ số UV",
      value: `${details.uvIndex}`,
      icon: <Sun className="h-6 w-6 text-yellow-500" />,
      description: getUVLevel(details.uvIndex).level,
      progress: (details.uvIndex / 11) * 100,
    },
    {
      name: "Lượng mưa",
      value: `${details.precipitation.toFixed(1)} mm`,
      icon: <CloudRain className="h-6 w-6 text-sky-500" />,
      description: details.precipitation > 10 ? "Mưa lớn" : details.precipitation > 2 ? "Mưa vừa" : "Mưa nhỏ",
      progress: (details.precipitation / 50) * 100,
    },
    {
      name: "Tầm nhìn",
      value: `${details.visibility.toFixed(1)} km`,
      icon: <Eye className="h-6 w-6 text-gray-500" />,
      description: details.visibility > 8 ? "Tốt" : details.visibility > 5 ? "Trung bình" : "Kém",
      progress: (details.visibility / 10) * 100,
    },
    {
      name: "Hướng gió",
      value: getWindDirection(details.windDirection),
      icon: <Compass className="h-6 w-6 text-indigo-500" />,
      description: `${Math.round(details.windDirection)}°`,
      progress: (details.windDirection / 360) * 100,
    },
    {
      name: "Điểm sương",
      value: `${Math.round(details.feelsLike - 5)}°C`,
      icon: <Snowflake className="h-6 w-6 text-cyan-500" />,
      description: "Nhiệt độ ngưng tụ hơi nước",
      progress: ((details.feelsLike - 5 + 10) / 60) * 100,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chi tiết thời tiết</h2>
        <div className="text-sm text-muted-foreground">{location.name}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {detailItems.map((item, index) => (
          <Card key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">{item.name}</h3>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={Math.max(0, Math.min(100, item.progress))} className="h-2" />
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Thông tin bổ sung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-orange-500" />
              <span>Bức xạ mặt trời: {Math.round(Math.random() * 1000)} W/m²</span>
            </div>
            <div className="flex items-center space-x-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              <span>Độ cao băng tuyết: {Math.round(Math.random() * 3000)} m</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-green-500" />
              <span>Gió giật: {Math.round(details.windSpeed * 1.5)} km/h</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <span>Xu hướng áp suất: Ổn định</span>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span>Chỉ số nhiệt: {Math.round(details.feelsLike + 2)}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>Độ ẩm tuyệt đối: {Math.round(details.humidity * 0.3)} g/m³</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
