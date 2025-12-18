"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Layers, Satellite, CloudRain, Thermometer, Wind, Zap } from "lucide-react"
import type { Location } from "@/lib/types"
import {
  getTemperatureMapData,
  getPrecipitationMapData,
  getWindMapData,
  getPressureMapData,
  type TemperatureMapData,
  type PrecipitationMapData,
  type WindMapData,
  type PressureMapData,
} from "@/lib/api/weather-map"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface WeatherMapsProps {
  location: Location
  isLoading: boolean
}

export function WeatherMaps({ location, isLoading }: WeatherMapsProps) {
  const [activeLayer, setActiveLayer] = useState("temperature")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const dataMarkersRef = useRef<mapboxgl.Marker[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  
  const [temperatureData, setTemperatureData] = useState<TemperatureMapData[]>([])
  const [precipitationData, setPrecipitationData] = useState<PrecipitationMapData[]>([])
  const [windData, setWindData] = useState<WindMapData[]>([])
  const [pressureData, setPressureData] = useState<PressureMapData[]>([])

  const mapLayers = [
    {
      id: "temperature",
      label: "Nhiệt độ",
      icon: Thermometer,
      style: "mapbox://styles/mapbox/streets-v12",
      description: "Bản đồ nhiệt độ",
    },
    {
      id: "precipitation",
      label: "Lượng mưa",
      icon: CloudRain,
      style: "mapbox://styles/mapbox/dark-v11",
      description: "Bản đồ lượng mưa",
    },
    {
      id: "wind",
      label: "Gió",
      icon: Wind,
      style: "mapbox://styles/mapbox/light-v11",
      description: "Bản đồ gió",
    },
    {
      id: "pressure",
      label: "Áp suất",
      icon: Layers,
      style: "mapbox://styles/mapbox/outdoors-v12",
      description: "Bản đồ áp suất khí quyển",
    },
    {
      id: "satellite",
      label: "Vệ tinh",
      icon: Satellite,
      style: "mapbox://styles/mapbox/satellite-v9",
      description: "Ảnh vệ tinh",
    },
    {
      id: "lightning",
      label: "Sét",
      icon: Zap,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      description: "Bản đồ hoạt động sét",
    },
  ]

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tempRes, precipRes, windRes, pressureRes] = await Promise.all([
          getTemperatureMapData(),
          getPrecipitationMapData(),
          getWindMapData(),
          getPressureMapData(),
        ])

        if (tempRes.success) setTemperatureData(tempRes.data)
        if (precipRes.success) setPrecipitationData(precipRes.data)
        if (windRes.success) setWindData(windRes.data)
        if (pressureRes.success) setPressureData(pressureRes.data)
      } catch (error) {
        console.error('Error fetching weather data:', error)
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Color functions
  const getTemperatureColor = (temp: number): string => {
    if (temp < 15) return '#3b82f6'
    if (temp < 20) return '#06b6d4'
    if (temp < 25) return '#10b981'
    if (temp < 30) return '#f59e0b'
    if (temp < 35) return '#f97316'
    return '#ef4444'
  }

  const getPrecipitationColor = (precip: number): string => {
    if (precip < 5) return '#bae6fd'
    if (precip < 10) return '#7dd3fc'
    if (precip < 20) return '#38bdf8'
    if (precip < 30) return '#0ea5e9'
    if (precip < 40) return '#0284c7'
    return '#0369a1'
  }

  const getWindColor = (speed: number): string => {
    if (speed < 10) return '#10b981' // green - nhẹ
    if (speed < 20) return '#f59e0b' // amber - vừa
    if (speed < 30) return '#f97316' // orange - mạnh
    if (speed < 40) return '#ef4444' // red - rất mạnh
    return '#dc2626' // dark red - cực mạnh
  }

  const getPressureColor = (pressure: number): string => {
    if (pressure < 1000) return '#a78bfa'
    if (pressure < 1005) return '#8b5cf6'
    if (pressure < 1010) return '#7c3aed'
    if (pressure < 1015) return '#6d28d9'
    return '#5b21b6'
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || isLoading || !mapboxgl.accessToken) return

    if (mapRef.current) {
      markerRef.current?.remove()
      dataMarkersRef.current.forEach(marker => marker.remove())
      dataMarkersRef.current = []
      mapRef.current.remove()
      mapRef.current = null
      setIsMapReady(false)
    }

    const timeoutId = setTimeout(() => {
      if (!mapContainerRef.current) return

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapLayers.find((l) => l.id === activeLayer)?.style || "mapbox://styles/mapbox/streets-v12",
        center: [location.lon, location.lat],
        zoom: 6,
      })

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      mapRef.current.addControl(new mapboxgl.FullscreenControl(), "top-right")
      mapRef.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: "metric" }),
        "bottom-left"
      )

      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([location.lon, location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${location.name}</h3>
              <p class="text-xs text-muted-foreground">Vị trí hiện tại</p>
            </div>
          `)
        )
        .addTo(mapRef.current)

      mapRef.current.on('load', () => {
        setIsMapReady(true)
        setTimeout(() => mapRef.current?.resize(), 100)
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [activeLayer, isLoading])

  // Add markers based on active layer
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return

    // Remove old markers
    dataMarkersRef.current.forEach(marker => marker.remove())
    dataMarkersRef.current = []

    // Add new markers based on active layer
    if (activeLayer === "temperature" && temperatureData.length > 0) {
      temperatureData.forEach((data) => {
        const color = getTemperatureColor(data.temperature)
        const el = createMarkerElement(color, `${Math.round(data.temperature)}°`)
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([data.longitude, data.latitude])
          .setPopup(createTemperaturePopup(data))
          .addTo(mapRef.current!)

        dataMarkersRef.current.push(marker)
      })
    } else if (activeLayer === "precipitation" && precipitationData.length > 0) {
      precipitationData.forEach((data) => {
        const color = getPrecipitationColor(data.precipitation)
        const el = createMarkerElement(color, `${Math.round(data.precipitation)}mm`)
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([data.longitude, data.latitude])
          .setPopup(createPrecipitationPopup(data))
          .addTo(mapRef.current!)

        dataMarkersRef.current.push(marker)
      })
    } else if (activeLayer === "wind" && windData.length > 0) {
      windData.forEach((data) => {
        const color = getWindColor(data.wind_speed)
        // Sử dụng mũi tên cho gió
        const el = createWindArrow(color, data.wind_speed)
        
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([data.longitude, data.latitude])
          .setPopup(createWindPopup(data))
          .addTo(mapRef.current!)

        dataMarkersRef.current.push(marker)
      })
    } else if (activeLayer === "pressure" && pressureData.length > 0) {
      pressureData.forEach((data) => {
        const color = getPressureColor(data.pressure)
        const el = createMarkerElement(color, `${Math.round(data.pressure)}`)
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([data.longitude, data.latitude])
          .setPopup(createPressurePopup(data))
          .addTo(mapRef.current!)

        dataMarkersRef.current.push(marker)
      })
    }
  }, [activeLayer, isMapReady, temperatureData, precipitationData, windData, pressureData])

  // Helper functions
  const createMarkerElement = (color: string, text: string) => {
    const el = document.createElement('div')
    el.style.cssText = `
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      color: white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `
    el.textContent = text
    return el
  }

  // Tạo mũi tên gió với animation
  const createWindArrow = (color: string, speed: number) => {
    const el = document.createElement('div')
    el.style.cssText = `
      position: relative;
      width: 50px;
      height: 50px;
      cursor: pointer;
    `
    
    // Arrow SVG
    el.innerHTML = `
      <svg width="50" height="50" viewBox="0 0 50 50" style="
        animation: windPulse ${Math.max(0.5, 2 - speed / 20)}s ease-in-out infinite;
      ">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Đuôi mũi tên với độ dài tùy theo tốc độ -->
        <line x1="10" y1="25" x2="${Math.min(40, 20 + speed / 2)}" y2="25" 
          stroke="url(#arrowGradient)" 
          stroke-width="${Math.min(4, 2 + speed / 15)}" 
          stroke-linecap="round"
          filter="url(#glow)"/>
        
        <!-- Đầu mũi tên -->
        <path d="M ${Math.min(40, 20 + speed / 2)} 25 L ${Math.min(35, 15 + speed / 2)} 20 M ${Math.min(40, 20 + speed / 2)} 25 L ${Math.min(35, 15 + speed / 2)} 30" 
          stroke="${color}" 
          stroke-width="${Math.min(4, 2 + speed / 15)}" 
          stroke-linecap="round" 
          fill="none"
          filter="url(#glow)"/>
        
        <!-- Tốc độ gió -->
        <text x="25" y="45" 
          font-size="10" 
          font-weight="bold" 
          fill="${color}" 
          text-anchor="middle"
          filter="url(#glow)">
          ${Math.round(speed)} km/h
        </text>
      </svg>
      
      <style>
        @keyframes windPulse {
          0%, 100% { 
            opacity: 1; 
            transform: translateX(0);
          }
          50% { 
            opacity: 0.7; 
            transform: translateX(3px);
          }
        }
      </style>
    `
    
    return el
  }

  const createTemperaturePopup = (data: TemperatureMapData) => {
    return new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-3">
        <h3 class="font-bold text-base mb-2">${data.name}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>Nhiệt độ:</strong> ${data.temperature.toFixed(1)}°C</p>
          <p><strong>Độ ẩm:</strong> ${data.humidity}%</p>
          <p><strong>Gió:</strong> ${data.wind_speed} km/h</p>
        </div>
      </div>
    `)
  }

  const createPrecipitationPopup = (data: PrecipitationMapData) => {
    return new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-3">
        <h3 class="font-bold text-base mb-2">${data.name}</h3>
        <p class="text-sm"><strong>Lượng mưa:</strong> ${data.precipitation.toFixed(1)} mm</p>
      </div>
    `)
  }

  const createWindPopup = (data: WindMapData) => {
    let windLevel = "Gió nhẹ"
    if (data.wind_speed >= 40) windLevel = "Gió cực mạnh"
    else if (data.wind_speed >= 30) windLevel = "Gió rất mạnh"
    else if (data.wind_speed >= 20) windLevel = "Gió mạnh"
    else if (data.wind_speed >= 10) windLevel = "Gió vừa"
    
    return new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-3">
        <h3 class="font-bold text-base mb-2">${data.name}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>Tốc độ gió:</strong> ${data.wind_speed.toFixed(1)} km/h</p>
          <p><strong>Cấp độ:</strong> ${windLevel}</p>
        </div>
      </div>
    `)
  }

  const createPressurePopup = (data: PressureMapData) => {
    return new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-3">
        <h3 class="font-bold text-base mb-2">${data.name}</h3>
        <p class="text-sm"><strong>Áp suất:</strong> ${data.pressure.toFixed(1)} hPa</p>
      </div>
    `)
  }

  // Update location
  useEffect(() => {
    if (!mapRef.current || !isMapReady || isLoading) return

    mapRef.current.flyTo({
      center: [location.lon, location.lat],
      zoom: 6,
      duration: 1000,
    })

    markerRef.current?.setLngLat([location.lon, location.lat])
  }, [location, isMapReady, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!mapboxgl.accessToken) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Bản đồ thời tiết</h2>
        <Card>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bản đồ thời tiết</h2>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-sky-500" />
          <span className="text-sm text-muted-foreground">{location.name}</span>
        </div>
      </div>

      {/* Legend cho Wind */}
      {activeLayer === "wind" && windData.length > 0 && (
        <Card className="bg-white/50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold">Cấp độ gió:</span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                  <span>&lt;10 km/h (Nhẹ)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span>10-20 km/h (Vừa)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                  <span>20-30 km/h (Mạnh)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>30-40 km/h (Rất mạnh)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                  <span>&gt;40 km/h (Cực mạnh)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeLayer} onValueChange={setActiveLayer}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          {mapLayers.map((layer) => {
            const Icon = layer.icon
            return (
              <TabsTrigger key={layer.id} value={layer.id} className="flex items-center space-x-1">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{layer.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={activeLayer}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const layer = mapLayers.find((l) => l.id === activeLayer)
                  const Icon = layer?.icon || Thermometer
                  return (
                    <>
                      <Icon className="h-5 w-5" />
                      <span>{layer?.description}</span>
                    </>
                  )
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={mapContainerRef} className="w-full h-[500px] rounded-lg" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
