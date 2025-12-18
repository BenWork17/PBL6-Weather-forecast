"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Zap, Thermometer, Droplets, Wind, Cloud, Gauge, Eye, TrendingUp, Satellite, Globe } from "lucide-react"
import { SolarRadiationChart } from "@/components/solar-radiation-chart"
import { TemperatureChart } from "@/components/temperature-chart"
import { WindChart } from "@/components/wind-chart"
import { PrecipitationChart } from "@/components/precipitation-chart"
import { HumidityChart } from "@/components/humidity-chart"
import { PressureChart } from "@/components/pressure-chart"
import { EvapotranspirationChart } from "@/components/evapotranspiration-chart"
import { SoilTemperatureChart } from "@/components/soil-temperature-chart"
import { CloudCoverChart } from "@/components/cloud-cover-chart"
import { UVIndexChart } from "@/components/uv-index-chart"
import { DataExport } from "@/components/data-export"
import { ParameterSelector } from "@/components/parameter-selector"
import { DateRangeSelector } from "@/components/date-range-selector"
import { LocationCoordinates } from "@/components/location-coordinates"
import { fetchNASAPowerData } from "@/lib/nasa-power-service"
import type { Location, NASAPowerData } from "@/lib/types"

interface NASAPowerDashboardProps {
  location: Location
  isLoading: boolean
}

export function NASAPowerDashboard({ location, isLoading }: NASAPowerDashboardProps) {
  const [nasaData, setNasaData] = useState<NASAPowerData | null>(null)
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    "T2M",
    "RH2M",
    "WS2M",
    "PRECTOTCORR",
    "ALLSKY_SFC_SW_DWN",
  ])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    end: new Date(),
  })
  const [activeChart, setActiveChart] = useState("overview")

  useEffect(() => {
    const loadNASAData = async () => {
      try {
        const data = await fetchNASAPowerData(location, dateRange.start, dateRange.end, selectedParameters)
        setNasaData(data)
      } catch (error) {
        console.error("Failed to fetch NASA POWER data:", error)
      }
    }

    if (!isLoading) {
      loadNASAData()
    }
  }, [location, dateRange, selectedParameters, isLoading])

  const parameterInfo = {
    T2M: { name: "Nhiệt độ 2m", unit: "°C", icon: Thermometer, color: "text-red-500" },
    T2M_MAX: { name: "Nhiệt độ tối đa", unit: "°C", icon: Thermometer, color: "text-red-600" },
    T2M_MIN: { name: "Nhiệt độ tối thiểu", unit: "°C", icon: Thermometer, color: "text-blue-600" },
    RH2M: { name: "Độ ẩm tương đối", unit: "%", icon: Droplets, color: "text-blue-500" },
    WS2M: { name: "Tốc độ gió 2m", unit: "m/s", icon: Wind, color: "text-green-500" },
    WD2M: { name: "Hướng gió 2m", unit: "°", icon: Wind, color: "text-green-600" },
    PRECTOTCORR: { name: "Lượng mưa", unit: "mm/day", icon: Cloud, color: "text-sky-500" },
    PS: { name: "Áp suất bề mặt", unit: "kPa", icon: Gauge, color: "text-purple-500" },
    ALLSKY_SFC_SW_DWN: { name: "Bức xạ mặt trời", unit: "kWh/m²/day", icon: Sun, color: "text-yellow-500" },
    CLRSKY_SFC_SW_DWN: { name: "Bức xạ trời quang", unit: "kWh/m²/day", icon: Sun, color: "text-orange-500" },
    ALLSKY_SFC_LW_DWN: { name: "Bức xạ sóng dài", unit: "kWh/m²/day", icon: Zap, color: "text-indigo-500" },
    ALLSKY_TOA_SW_DWN: { name: "Bức xạ TOA", unit: "kWh/m²/day", icon: Satellite, color: "text-pink-500" },
    T2MDEW: { name: "Điểm sương", unit: "°C", icon: Droplets, color: "text-cyan-500" },
    T2MWET: { name: "Nhiệt độ ướt", unit: "°C", icon: Droplets, color: "text-teal-500" },
    TS: { name: "Nhiệt độ đất", unit: "°C", icon: Globe, color: "text-amber-600" },
    T10M: { name: "Nhiệt độ 10m", unit: "°C", icon: Thermometer, color: "text-red-400" },
    QV2M: { name: "Độ ẩm riêng", unit: "g/kg", icon: Droplets, color: "text-blue-400" },
    U2M: { name: "Gió U-component", unit: "m/s", icon: Wind, color: "text-green-400" },
    V2M: { name: "Gió V-component", unit: "m/s", icon: Wind, color: "text-green-600" },
    WS10M: { name: "Tốc độ gió 10m", unit: "m/s", icon: Wind, color: "text-emerald-500" },
    WS50M: { name: "Tốc độ gió 50m", unit: "m/s", icon: Wind, color: "text-emerald-600" },
    ALLSKY_SFC_UV_INDEX: { name: "Chỉ số UV", unit: "", icon: Sun, color: "text-yellow-600" },
    FROST_DAYS: { name: "Ngày băng giá", unit: "days", icon: Eye, color: "text-slate-500" },
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Satellite className="h-8 w-8 text-blue-600" />
            <span>NASA POWER Data</span>
          </h1>
          <p className="text-muted-foreground">Dữ liệu khí tượng vệ tinh cho {location.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Globe className="h-3 w-3 mr-1" />
            {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
          </Badge>
          <DataExport data={nasaData} location={location} />
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
        <ParameterSelector
          selectedParameters={selectedParameters}
          onParametersChange={setSelectedParameters}
          parameterInfo={parameterInfo}
        />
        <LocationCoordinates location={location} />
      </div>

      {/* Key Metrics Overview */}
      {nasaData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {selectedParameters.slice(0, 6).map((param) => {
            const info = parameterInfo[param as keyof typeof parameterInfo]
            const Icon = info.icon
            const currentValue = nasaData.parameters[param]?.current || 0
            const avgValue = nasaData.parameters[param]?.average || 0
            const trend = currentValue > avgValue ? "up" : "down"

            return (
              <Card key={param} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${info.color}`} />
                    <TrendingUp
                      className={`h-4 w-4 ${trend === "up" ? "text-green-500" : "text-red-500 rotate-180"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{currentValue.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{info.unit}</p>
                    <p className="text-xs font-medium">{info.name}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Charts and Analysis */}
      <Tabs value={activeChart} onValueChange={setActiveChart}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="solar">Bức xạ</TabsTrigger>
          <TabsTrigger value="temperature">Nhiệt độ</TabsTrigger>
          <TabsTrigger value="wind">Gió</TabsTrigger>
          <TabsTrigger value="precipitation">Mưa</TabsTrigger>
          <TabsTrigger value="humidity">Độ ẩm</TabsTrigger>
          <TabsTrigger value="pressure">Áp suất</TabsTrigger>
          <TabsTrigger value="evapotranspiration">Bốc hơi</TabsTrigger>
          <TabsTrigger value="soil">Đất</TabsTrigger>
          <TabsTrigger value="uv">UV & Mây</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemperatureChart data={nasaData} />
            <SolarRadiationChart data={nasaData} />
            <WindChart data={nasaData} />
            <PrecipitationChart data={nasaData} />
          </div>
        </TabsContent>

        <TabsContent value="solar">
          <SolarRadiationChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="temperature">
          <TemperatureChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="wind">
          <WindChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="precipitation">
          <PrecipitationChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="humidity">
          <HumidityChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="pressure">
          <PressureChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="evapotranspiration">
          <EvapotranspirationChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="soil">
          <SoilTemperatureChart data={nasaData} detailed={true} />
        </TabsContent>

        <TabsContent value="uv">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UVIndexChart data={nasaData} />
            <CloudCoverChart data={nasaData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
