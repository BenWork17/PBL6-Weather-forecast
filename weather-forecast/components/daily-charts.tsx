"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Thermometer, Droplets, CloudRain, Gauge, Sun, TrendingUp, TrendingDown } from "lucide-react"
import type { WeatherData } from "@/lib/types"

interface DailyChartsProps {
  weatherData: WeatherData | null
  isLoading: boolean
}

export function DailyCharts({ weatherData, isLoading }: DailyChartsProps) {
  const [selectedChart, setSelectedChart] = useState("temperature")
  const [timeRange, setTimeRange] = useState("24h")

  if (isLoading || !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ trong ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // Generate hourly data for today
  const generateHourlyData = () => {
    const today = weatherData.forecast[0]
    if (!today?.hourly) return []

    return today.hourly.map((hour, index) => {
      const time = new Date(hour.time)
      return {
        time: time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        hour: time.getHours(),
        temperature: hour.temperature || 0,
        humidity: hour.humidity || 0,
        precipitation: hour.precipitation || 0,
        pressure: 1013 + Math.sin(index * 0.5) * 10,
        uvIndex: Math.max(0, Math.sin(((index - 6) * Math.PI) / 12) * 8),
        feelsLike: (hour.temperature || 0) + (Math.random() - 0.5) * 4,
        dewPoint: (hour.temperature || 0) - (100 - (hour.humidity || 0)) * 0.2,
      }
    })
  }

  const hourlyData = generateHourlyData()
  const currentHour = new Date().getHours()

  const chartConfigs = {
    temperature: {
      title: "Nhiệt độ",
      icon: Thermometer,
      color: "#ef4444",
      unit: "°C",
      data: hourlyData,
      lines: [
        { key: "temperature", name: "Nhiệt độ", color: "#ef4444" },
        { key: "feelsLike", name: "Cảm giác như", color: "#f97316", dash: "5 5" },
        { key: "dewPoint", name: "Điểm sương", color: "#06b6d4", dash: "3 3" },
      ],
    },
    humidity: {
      title: "Độ ẩm",
      icon: Droplets,
      color: "#3b82f6",
      unit: "%",
      data: hourlyData,
      lines: [{ key: "humidity", name: "Độ ẩm", color: "#3b82f6" }],
    },
    precipitation: {
      title: "Lượng mưa",
      icon: CloudRain,
      color: "#0ea5e9",
      unit: "mm",
      data: hourlyData,
      type: "bar",
    },
    pressure: {
      title: "Áp suất",
      icon: Gauge,
      color: "#8b5cf6",
      unit: "hPa",
      data: hourlyData,
      lines: [{ key: "pressure", name: "Áp suất", color: "#8b5cf6" }],
    },
    uv: {
      title: "Chỉ số UV",
      icon: Sun,
      color: "#f59e0b",
      unit: "",
      data: hourlyData,
      lines: [{ key: "uvIndex", name: "Chỉ số UV", color: "#f59e0b" }],
      type: "area",
    },
  }

  const currentConfig = chartConfigs[selectedChart as keyof typeof chartConfigs]
  const Icon = currentConfig.icon

  const renderChart = () => {
    if (currentConfig.type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={currentConfig.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} ${currentConfig.unit}`, currentConfig.title]}
              labelFormatter={(label) => `Thời gian: ${label}`}
            />
            <ReferenceLine x={currentHour} stroke="#ef4444" strokeDasharray="2 2" />
            <Bar dataKey="precipitation" fill={currentConfig.color} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (currentConfig.type === "area") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={currentConfig.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} ${currentConfig.unit}`, currentConfig.title]}
              labelFormatter={(label) => `Thời gian: ${label}`}
            />
            <ReferenceLine x={currentHour} stroke="#ef4444" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey={currentConfig.lines?.[0]?.key}
              stroke={currentConfig.color}
              fill={currentConfig.color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={currentConfig.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => [`${value.toFixed(1)} ${currentConfig.unit}`, name]}
            labelFormatter={(label) => `Thời gian: ${label}`}
          />
          <Legend />
          <ReferenceLine x={currentHour} stroke="#ef4444" strokeDasharray="2 2" />
          {currentConfig.lines?.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.dash}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const getStats = () => {
    const data = currentConfig.data
    if (!data || data.length === 0) {
      return {
        current: 0,
        max: 0,
        min: 0,
        avg: 0,
        trend: "up" as const,
      }
    }

    const key = currentConfig.lines?.[0]?.key || "precipitation"
    const values = data.map((d) => d[key as keyof typeof d] as number).filter(v => v != null && !isNaN(v))

    if (values.length === 0) {
      return {
        current: 0,
        max: 0,
        min: 0,
        avg: 0,
        trend: "up" as const,
      }
    }

    return {
      current: values[Math.min(currentHour, values.length - 1)] || values[0] || 0,
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      trend: (values[values.length - 1] || 0) > (values[0] || 0) ? ("up" as const) : ("down" as const),
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5`} style={{ color: currentConfig.color }} />
              <span>Biểu đồ {currentConfig.title} trong ngày</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={timeRange === "24h" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("24h")}
              >
                24h
              </Button>
              <Button
                variant={timeRange === "12h" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("12h")}
              >
                12h
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedChart} onValueChange={setSelectedChart}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="temperature">Nhiệt độ</TabsTrigger>
              <TabsTrigger value="humidity">Độ ẩm</TabsTrigger>
              <TabsTrigger value="precipitation">Mưa</TabsTrigger>
              <TabsTrigger value="pressure">Áp suất</TabsTrigger>
              <TabsTrigger value="uv">UV</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedChart}>
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Hiện tại</p>
                          <p className="text-lg font-bold">
                            {stats.current.toFixed(1)} {currentConfig.unit}
                          </p>
                        </div>
                        {stats.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Cao nhất</p>
                      <p className="text-lg font-bold text-red-600">
                        {stats.max.toFixed(1)} {currentConfig.unit}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Thấp nhất</p>
                      <p className="text-lg font-bold text-blue-600">
                        {stats.min.toFixed(1)} {currentConfig.unit}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Trung bình</p>
                      <p className="text-lg font-bold">
                        {stats.avg.toFixed(1)} {currentConfig.unit}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <div className="border rounded-lg p-4">{renderChart()}</div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">Thông tin bổ sung</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biên độ:</span>
                        <span>
                          {(stats.max - stats.min).toFixed(1)} {currentConfig.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Xu hướng:</span>
                        <span className={stats.trend === "up" ? "text-green-600" : "text-red-600"}>
                          {stats.trend === "up" ? "Tăng" : "Giảm"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Dự báo</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">6h tới:</span>
                        <span>
                          {(hourlyData[Math.min(currentHour + 6, hourlyData.length - 1)]?.[
                            currentConfig.lines?.[0]?.key || "precipitation"
                          ] || 0)?.toFixed(1)}{" "}
                          {currentConfig.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">12h tới:</span>
                        <span>
                          {(hourlyData[Math.min(currentHour + 12, hourlyData.length - 1)]?.[
                            currentConfig.lines?.[0]?.key || "precipitation"
                          ] || 0)?.toFixed(1)}{" "}
                          {currentConfig.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
