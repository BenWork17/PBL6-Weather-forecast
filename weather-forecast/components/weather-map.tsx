"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Location, WeatherData } from "@/lib/types"

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface WeatherMapProps {
  location: Location
  weatherData: WeatherData | null
  isLoading: boolean
}

export function WeatherMap({ location, weatherData, isLoading }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainer.current || isLoading) return
    if (map.current) return // Initialize map only once

    // Check if token is available
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local")
      return
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [location.lon, location.lat],
      zoom: 10,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right")

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    )

    return () => {
      marker.current?.remove()
      map.current?.remove()
    }
  }, [isLoading])

  useEffect(() => {
    if (!map.current || isLoading || !weatherData) return

    // Update map center
    map.current.flyTo({
      center: [location.lon, location.lat],
      zoom: 10,
      duration: 1000,
    })

    // Remove old marker
    marker.current?.remove()

    // Get weather condition color
    const condition = weatherData.current?.condition?.toLowerCase() || "clear"
    let markerColor = "#f59e0b" // amber-500 for clear

    if (condition.includes("rain") || condition.includes("shower")) {
      markerColor = "#3b82f6" // blue-500
    } else if (condition.includes("cloud")) {
      markerColor = "#94a3b8" // slate-400
    } else if (condition.includes("snow")) {
      markerColor = "#cbd5e1" // slate-300
    } else if (condition.includes("storm") || condition.includes("thunder")) {
      markerColor = "#8b5cf6" // violet-500
    }

    // Create popup content
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${location.name}</h3>
        <p class="text-sm mb-1"><strong>Nhiệt độ:</strong> ${weatherData.current.temperature}°C</p>
        <p class="text-sm mb-1"><strong>Điều kiện:</strong> ${weatherData.current.condition}</p>
        <p class="text-sm mb-1"><strong>Độ ẩm:</strong> ${weatherData.current.humidity}%</p>
        <p class="text-sm mb-1"><strong>Gió:</strong> ${weatherData.current.wind_speed} km/h</p>
        <p class="text-sm text-muted-foreground">Lat: ${location.lat.toFixed(4)}, Lon: ${location.lon.toFixed(4)}</p>
      </div>
    `

    // Create new marker
    marker.current = new mapboxgl.Marker({ color: markerColor })
      .setLngLat([location.lon, location.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
      .addTo(map.current)

    // Show popup by default
    marker.current.togglePopup()
  }, [location, weatherData, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-white/50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!mapboxgl.accessToken) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Weather Map</h2>
        <Card className="bg-white/50 dark:bg-slate-800/50">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium mb-2">Mapbox Token Missing</p>
            <p className="text-sm text-muted-foreground">
              Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Weather Map</h2>
      <Card className="bg-white/50 dark:bg-slate-800/50">
        <CardContent className="p-4">
          <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
