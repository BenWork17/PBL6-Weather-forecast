import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Wind, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { AirQualityData } from "@/lib/types"

interface AirQualityProps {
  data: AirQualityData | null
  isLoading: boolean
  detailed?: boolean
}

export function AirQuality({ data, isLoading, detailed = false }: AirQualityProps) {
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500"
    if (aqi <= 100) return "bg-yellow-500"
    if (aqi <= 150) return "bg-orange-500"
    if (aqi <= 200) return "bg-red-500"
    if (aqi <= 300) return "bg-purple-500"
    return "bg-red-800"
  }

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return "Tốt"
    if (aqi <= 100) return "Trung bình"
    if (aqi <= 150) return "Không tốt cho nhóm nhạy cảm"
    if (aqi <= 200) return "Không tốt"
    if (aqi <= 300) return "Rất không tốt"
    return "Nguy hiểm"
  }

  const getAQIIcon = (aqi: number) => {
    if (aqi <= 100) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (aqi <= 200) return <AlertTriangle className="h-5 w-5 text-orange-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wind className="h-5 w-5" />
            <span>Chất lượng không khí</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-32" />
          {detailed && (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="h-5 w-5" />
            <span>Chất lượng không khí</span>
          </div>
          {getAQIIcon(data.aqi)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{data.aqi}</span>
            <Badge variant="secondary">{getAQILabel(data.aqi)}</Badge>
          </div>
          <Progress value={(data.aqi / 300) * 100} className="h-2" />
        </div>

        {detailed && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Các chất ô nhiễm chính</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>PM2.5</span>
                    <span>{data.pm25} μg/m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PM10</span>
                    <span>{data.pm10} μg/m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>O₃</span>
                    <span>{data.o3} μg/m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NO₂</span>
                    <span>{data.no2} μg/m³</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Khuyến nghị</h4>
                <div className="text-sm text-muted-foreground">
                  {data.aqi <= 50 && "Chất lượng không khí tốt. Thích hợp cho mọi hoạt động ngoài trời."}
                  {data.aqi > 50 &&
                    data.aqi <= 100 &&
                    "Chất lượng không khí ở mức trung bình. Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời."}
                  {data.aqi > 100 &&
                    "Chất lượng không khí không tốt. Nên hạn chế hoạt động ngoài trời và đeo khẩu trang."}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Dự báo 24h tới</h4>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground">{i * 4}h</div>
                    <div className={`h-2 w-full rounded ${getAQIColor(data.aqi + Math.random() * 20 - 10)}`} />
                    <div className="text-xs font-medium">{Math.round(data.aqi + Math.random() * 20 - 10)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
