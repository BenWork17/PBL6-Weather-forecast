import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Moon, Sunrise, Sunset } from "lucide-react"
import type { Location } from "@/lib/types"

interface SunMoonInfoProps {
  location: Location
  isLoading: boolean
}

export function SunMoonInfo({ location, isLoading }: SunMoonInfoProps) {
  // Mock data - in real app, calculate based on location and date
  const sunriseTime = "06:15"
  const sunsetTime = "18:30"
  const moonPhase = "Trăng tròn"
  const moonrise = "19:45"
  const moonset = "07:20"

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Mặt trời & Mặt trăng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span>Mặt trời & Mặt trăng</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sunrise className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Bình minh</span>
            </div>
            <span className="font-medium">{sunriseTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sunset className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Hoàng hôn</span>
            </div>
            <span className="font-medium">{sunsetTime}</span>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Pha trăng</span>
            </div>
            <span className="font-medium">{moonPhase}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-blue-300" />
              <span className="text-sm">Mọc trăng</span>
            </div>
            <span className="font-medium">{moonrise}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-blue-200" />
              <span className="text-sm">Lặn trăng</span>
            </div>
            <span className="font-medium">{moonset}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
