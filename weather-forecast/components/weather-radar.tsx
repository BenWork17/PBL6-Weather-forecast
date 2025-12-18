"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MapPin, Play, Pause, SkipBack, SkipForward, CloudRain, Zap } from "lucide-react"
import type { Location } from "@/lib/types"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface WeatherRadarProps {
  location: Location
  isLoading: boolean
}

export function WeatherRadar({ location, isLoading }: WeatherRadarProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const animationRef = useRef<number | null>(null)
  const radarLayerRef = useRef<string[]>([])
  
  const [isMapReady, setIsMapReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [opacity, setOpacity] = useState(70)
  const [radarType, setRadarType] = useState<"precipitation" | "lightning">("precipitation")
  const [timestamps, setTimestamps] = useState<string[]>([])

  // Generate timestamps for last 2 hours (12 frames, 10 min intervals)
  useEffect(() => {
    const generateTimestamps = () => {
      const times: string[] = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 10 * 60 * 1000)
        times.push(time.toISOString())
      }
      
      setTimestamps(times)
    }

    generateTimestamps()
    const interval = setInterval(generateTimestamps, 10 * 60 * 1000) // Update every 10 min
    return () => clearInterval(interval)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || isLoading || !mapboxgl.accessToken) return

    if (mapRef.current) {
      markerRef.current?.remove()
      mapRef.current.remove()
      mapRef.current = null
      setIsMapReady(false)
    }

    const timeoutId = setTimeout(() => {
      if (!mapContainerRef.current) return

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [location.lon, location.lat],
        zoom: 7,
      })
      
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      mapRef.current.addControl(new mapboxgl.FullscreenControl(), "top-right")
      mapRef.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: "metric" }),
        "bottom-left"
      )

      // Add location marker
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
        addRadarLayers()
        setTimeout(() => mapRef.current?.resize(), 100)
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  // Add radar layers
  const addRadarLayers = () => {
    if (!mapRef.current || !isMapReady) return

    // Remove existing radar layers
    radarLayerRef.current.forEach(layerId => {
      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId)
      }
      if (mapRef.current?.getSource(layerId)) {
        mapRef.current.removeSource(layerId)
      }
    })
    radarLayerRef.current = []

    // Add new radar layers based on type
    if (radarType === "precipitation") {
      addPrecipitationRadar()
    } else {
      addLightningRadar()
    }
  }

  const addPrecipitationRadar = () => {
    if (!mapRef.current) return

    timestamps.forEach((timestamp, index) => {
      const layerId = `radar-precipitation-${index}`
      const time = Math.floor(new Date(timestamp).getTime() / 1000)

      // Using OpenWeatherMap Precipitation layer
      const tileUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo'}`

      if (!mapRef.current?.getSource(layerId)) {
        mapRef.current?.addSource(layerId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
        })

        mapRef.current?.addLayer({
          id: layerId,
          type: 'raster',
          source: layerId,
          paint: {
            'raster-opacity': index === currentFrame ? opacity / 100 : 0,
            'raster-opacity-transition': { duration: 300 },
          },
        })

        radarLayerRef.current.push(layerId)
      }
    })
  }

  const addLightningRadar = () => {
    if (!mapRef.current) return

    // Simulate lightning data with markers
    const lightningData = generateLightningData()

    lightningData.forEach((strike, index) => {
      const el = document.createElement('div')
      el.style.cssText = `
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #fbbf24 0%, #f59e0b 40%, transparent 70%);
        border-radius: 50%;
        animation: lightningPulse 1s ease-in-out infinite;
        box-shadow: 0 0 10px #fbbf24;
      `

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([strike.lon, strike.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="p-2">
              <p class="font-bold text-sm">⚡ Sét đánh</p>
              <p class="text-xs">Thời gian: ${new Date(strike.time).toLocaleTimeString('vi-VN')}</p>
              <p class="text-xs">Cường độ: ${strike.intensity}</p>
            </div>
          `)
        )
        .addTo(mapRef.current!)
    })

    // Add animation style
    const style = document.createElement('style')
    style.textContent = `
      @keyframes lightningPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
    `
    document.head.appendChild(style)
  }

  const generateLightningData = () => {
    // Generate random lightning strikes near location
    const strikes = []
    const count = Math.floor(Math.random() * 10) + 5

    for (let i = 0; i < count; i++) {
      strikes.push({
        lat: location.lat + (Math.random() - 0.5) * 2,
        lon: location.lon + (Math.random() - 0.5) * 2,
        time: Date.now() - Math.random() * 3600000,
        intensity: ['Yếu', 'Trung bình', 'Mạnh'][Math.floor(Math.random() * 3)],
      })
    }

    return strikes
  }

  // Update radar layers when type changes
  useEffect(() => {
    if (isMapReady) {
      addRadarLayers()
    }
  }, [radarType, isMapReady, timestamps])

  // Update frame visibility
  useEffect(() => {
    if (!mapRef.current || radarType !== 'precipitation') return

    radarLayerRef.current.forEach((layerId, index) => {
      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current.setPaintProperty(
          layerId,
          'raster-opacity',
          index === currentFrame ? opacity / 100 : 0
        )
      }
    })
  }, [currentFrame, opacity, radarType])

  // Animation controls
  const playAnimation = () => {
    if (animationRef.current) return

    setIsPlaying(true)
    animationRef.current = window.setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % timestamps.length)
    }, 500)
  }

  const pauseAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)
  }

  const nextFrame = () => {
    pauseAnimation()
    setCurrentFrame(prev => (prev + 1) % timestamps.length)
  }

  const previousFrame = () => {
    pauseAnimation()
    setCurrentFrame(prev => (prev - 1 + timestamps.length) % timestamps.length)
  }

  // Update location
  useEffect(() => {
    if (!mapRef.current || !isMapReady || isLoading) return

    mapRef.current.flyTo({
      center: [location.lon, location.lat],
      zoom: 7,
      duration: 1000,
    })

    markerRef.current?.setLngLat([location.lon, location.lat])
  }, [location, isMapReady, isLoading])

  // Cleanup
  useEffect(() => {
    return () => {
      pauseAnimation()
    }
  }, [])

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
        <h2 className="text-2xl font-bold">Radar thời tiết</h2>
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
        <h2 className="text-2xl font-bold">Radar thời tiết</h2>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-sky-500" />
          <span className="text-sm text-muted-foreground">{location.name}</span>
        </div>
      </div>

      {/* Radar Type Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={radarType === "precipitation" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRadarType("precipitation")
                setCurrentFrame(0)
              }}
            >
              <CloudRain className="h-4 w-4 mr-2" />
              Mưa
            </Button>
            <Button
              variant={radarType === "lightning" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRadarType("lightning")
                pauseAnimation()
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Sét
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {radarType === "precipitation" ? "Radar lượng mưa" : "Hoạt động sét"}
            </span>
            {radarType === "precipitation" && timestamps.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {new Date(timestamps[currentFrame]).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={mapContainerRef} className="w-full h-[500px] rounded-lg" />

          {radarType === "precipitation" && (
            <>
              {/* Animation Controls */}
              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousFrame}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isPlaying ? pauseAnimation : playAnimation}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={nextFrame}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Timeline Slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dòng thời gian</label>
                <Slider
                  value={[currentFrame]}
                  onValueChange={([value]) => {
                    pauseAnimation()
                    setCurrentFrame(value)
                  }}
                  max={timestamps.length - 1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 giờ trước</span>
                  <span>Hiện tại</span>
                </div>
              </div>

              {/* Opacity Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Độ trong suốt: {opacity}%</label>
                <Slider
                  value={[opacity]}
                  onValueChange={([value]) => setOpacity(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Legend */}
          <Card className="bg-white/50 dark:bg-slate-800/50">
            <CardContent className="p-3">
              <div className="text-xs space-y-2">
                <p className="font-semibold">Chú giải:</p>
                {radarType === "precipitation" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4" style={{ background: 'linear-gradient(to right, #bae6fd, #7dd3fc)' }}></div>
                      <span>Mưa nhẹ (5-10mm)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4" style={{ background: 'linear-gradient(to right, #38bdf8, #0ea5e9)' }}></div>
                      <span>Mưa vừa (10-20mm)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4" style={{ background: 'linear-gradient(to right, #0284c7, #0369a1)' }}></div>
                      <span>Mưa to (&gt;20mm)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>⚡ Điểm vàng: Vị trí sét đánh</p>
                    <p>Cường độ: Yếu / Trung bình / Mạnh</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
