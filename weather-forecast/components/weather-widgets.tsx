import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Sun, Droplets, Eye } from "lucide-react"
import type { WeatherData } from "@/lib/types"

interface WeatherWidgetsProps {
  weather: WeatherData | null
  isLoading: boolean
}

export function WeatherWidgets({ weather, isLoading }: WeatherWidgetsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!weather) return null

  const widgets = [
    {
      title: "Chỉ số UV",
      value: weather.details.uvIndex,
      max: 11,
      icon: Sun,
      color: "text-yellow-500",
      unit: "",
      description:
        weather.details.uvIndex <= 2
          ? "Thấp"
          : weather.details.uvIndex <= 5
            ? "Trung bình"
            : weather.details.uvIndex <= 7
              ? "Cao"
              : "Rất cao",
    },
    {
      title: "Độ ẩm",
      value: weather.details.humidity,
      max: 100,
      icon: Droplets,
      color: "text-blue-500",
      unit: "%",
      description: weather.details.humidity < 30 ? "Khô" : weather.details.humidity > 70 ? "Ẩm" : "Bình thường",
    },
    {
      title: "Tầm nhìn",
      value: weather.details.visibility,
      max: 10,
      icon: Eye,
      color: "text-gray-500",
      unit: "km",
      description: weather.details.visibility > 8 ? "Tốt" : weather.details.visibility > 5 ? "Trung bình" : "Kém",
    },
  ]

  return (
    <div className="space-y-4">
      {widgets.map((widget, index) => {
        const Icon = widget.icon
        const percentage = (widget.value / widget.max) * 100

        return (
          <Card key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${widget.color}`} />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <span className="text-lg font-bold">
                  {widget.value}
                  {widget.unit}
                </span>
              </div>
              <Progress value={percentage} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">{widget.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
