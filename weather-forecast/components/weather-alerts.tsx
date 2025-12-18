import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, AlertCircle, Zap, CloudRain, Wind } from "lucide-react"
import type { WeatherAlert } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
  isLoading: boolean
}

export function WeatherAlerts({ alerts, isLoading }: WeatherAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "storm":
        return <Zap className="h-5 w-5 text-yellow-500" />
      case "rain":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "wind":
        return <Wind className="h-5 w-5 text-gray-500" />
      case "heat":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "destructive"
      case "moderate":
        return "default"
      case "minor":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Cảnh báo thời tiết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Cảnh báo thời tiết</span>
          {alerts.length > 0 && <Badge variant="destructive">{alerts.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có cảnh báo thời tiết nào.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity === "severe" && "Nghiêm trọng"}
                    {alert.severity === "moderate" && "Trung bình"}
                    {alert.severity === "minor" && "Nhẹ"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">
                  Hiệu lực: {formatDate(new Date(alert.startTime))} - {formatDate(new Date(alert.endTime))}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
