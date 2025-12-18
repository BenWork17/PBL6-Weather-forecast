"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingUp, TrendingDown, Thermometer, CloudRain, Droplets } from "lucide-react"
import { format, subDays } from "date-fns"
import { vi } from "date-fns/locale"
import type { Location } from "@/lib/types"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"

interface HistoricalWeatherProps {
  location: Location
  isLoading: boolean
}

export function HistoricalWeather({ location, isLoading }: HistoricalWeatherProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewType, setViewType] = useState<"daily" | "monthly" | "yearly">("daily")
  const [chartData, setChartData] = useState<any[]>([])

  // Generate mock historical data
  useEffect(() => {
    const generateData = () => {
      const data = []
      const days = viewType === "daily" ? 30 : viewType === "monthly" ? 12 : 5

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        data.push({
          date: format(date, viewType === "daily" ? "dd/MM" : viewType === "monthly" ? "MMM" : "yyyy", {
            locale: vi,
          }),
          temperature: Math.round(20 + Math.random() * 15),
          tempHigh: Math.round(28 + Math.random() * 8),
          tempLow: Math.round(18 + Math.random() * 5),
          precipitation: Math.round(Math.random() * 15 * 10) / 10,
          humidity: Math.round(60 + Math.random() * 30),
          windSpeed: Math.round(Math.random() * 20),
        })
      }
      return data
    }

    setChartData(generateData())
  }, [viewType])

  // Mock historical data
  const historicalData = {
    temperature: {
      current: 28,
      average: 26,
      record: { high: 35, low: 18 },
      trend: "up",
    },
    precipitation: {
      current: 2.5,
      average: 3.2,
      record: { high: 15.8, low: 0 },
      trend: "down",
    },
    humidity: {
      current: 75,
      average: 72,
      record: { high: 95, low: 45 },
      trend: "up",
    },
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dữ liệu lịch sử</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Dữ liệu lịch sử - {location.name}</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-1">
            {["daily", "monthly", "yearly"].map((type) => (
              <Button
                key={type}
                variant={viewType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType(type as any)}
              >
                {type === "daily" && "Ngày"}
                {type === "monthly" && "Tháng"}
                {type === "yearly" && "Năm"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(historicalData).map(([key, data]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {key === "temperature" && <Thermometer className="h-5 w-5 text-orange-500" />}
                  {key === "precipitation" && <CloudRain className="h-5 w-5 text-blue-500" />}
                  {key === "humidity" && <Droplets className="h-5 w-5 text-cyan-500" />}
                  <span>
                    {key === "temperature" && "Nhiệt độ"}
                    {key === "precipitation" && "Lượng mưa"}
                    {key === "humidity" && "Độ ẩm"}
                  </span>
                </div>
                {data.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {data.current}
                  {key === "temperature" && "°C"}
                  {key === "precipitation" && "mm"}
                  {key === "humidity" && "%"}
                </div>
                <div className="text-sm text-muted-foreground">Hôm nay</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trung bình:</span>
                  <span className="font-medium">
                    {data.average}
                    {key === "temperature" && "°C"}
                    {key === "precipitation" && "mm"}
                    {key === "humidity" && "%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cao nhất:</span>
                  <span className="text-red-500 font-medium">
                    {data.record.high}
                    {key === "temperature" && "°C"}
                    {key === "precipitation" && "mm"}
                    {key === "humidity" && "%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Thấp nhất:</span>
                  <span className="text-blue-500 font-medium">
                    {data.record.low}
                    {key === "temperature" && "°C"}
                    {key === "precipitation" && "mm"}
                    {key === "humidity" && "%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Temperature Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            <span>Biểu đồ nhiệt độ {viewType === "daily" ? "30 ngày" : viewType === "monthly" ? "12 tháng" : "5 năm"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="tempHigh"
                fill="#fca5a5"
                stroke="#ef4444"
                fillOpacity={0.3}
                name="Nhiệt độ cao"
              />
              <Area
                type="monotone"
                dataKey="tempLow"
                fill="#93c5fd"
                stroke="#3b82f6"
                fillOpacity={0.3}
                name="Nhiệt độ thấp"
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Nhiệt độ TB"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Precipitation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudRain className="h-5 w-5 text-blue-500" />
            <span>Biểu đồ lượng mưa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value} mm`, "Lượng mưa"]}
              />
              <Legend />
              <Bar dataKey="precipitation" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Lượng mưa (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Humidity & Wind Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-cyan-500" />
              <span>Độ ẩm</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Độ ẩm"]}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  fill="#67e8f9"
                  fillOpacity={0.6}
                  name="Độ ẩm (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <span>Tốc độ gió</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} km/h`, "Tốc độ gió"]}
                />
                <Line
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Gió (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
