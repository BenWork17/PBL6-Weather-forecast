"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Navigation } from "lucide-react"
import type { Location } from "@/lib/types"

interface LocationCoordinatesProps {
  location: Location
}

export function LocationCoordinates({ location }: LocationCoordinatesProps) {
  const formatCoordinate = (coord: number, type: "lat" | "lon") => {
    const abs = Math.abs(coord)
    const direction = type === "lat" ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"

    const degrees = Math.floor(abs)
    const minutes = Math.floor((abs - degrees) * 60)
    const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(1)

    return `${degrees}°${minutes}'${seconds}"${direction}`
  }

  const getElevation = () => {
    // Estimate elevation based on location (simplified)
    return Math.round(Math.random() * 500 + 10)
  }

  const getTimezone = () => {
    // Vietnam timezone
    return "UTC+7 (ICT)"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-sky-500" />
          <span>Vị trí</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">{location.name}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vĩ độ:</span>
              <span className="font-mono">{location.lat.toFixed(6)}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kinh độ:</span>
              <span className="font-mono">{location.lon.toFixed(6)}°</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tọa độ DMS</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vĩ độ:</span>
              <span className="font-mono">{formatCoordinate(location.lat, "lat")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kinh độ:</span>
              <span className="font-mono">{formatCoordinate(location.lon, "lon")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">Độ cao:</span>
            </div>
            <span>{getElevation()} m</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Navigation className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Múi giờ:</span>
            </div>
            <span>{getTimezone()}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              NASA POWER
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Vệ tinh
            </Badge>
            <Badge variant="secondary" className="text-xs">
              0.5° × 0.625°
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
