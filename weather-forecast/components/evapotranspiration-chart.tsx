"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Droplets, Zap, Thermometer } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface EvapotranspirationChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function EvapotranspirationChart({ data, detailed = false }: EvapotranspirationChartProps) {
  if (!data) return null

  // Calculate evapotranspiration using Penman-Monteith approximation
  const chartData = data.timeSeries.map((item) => {
    const temp = item.T2M || 20
    const humidity = item.RH2M || 50
    const windSpeed = item.WS2M || 2
    const solarRadiation = item.ALLSKY_SFC_SW_DWN || 5

    // Simplified ET calculation
    const et0 = Math.max(0, ((solarRadiation * 0.8 + windSpeed * 0.5) * (1 - humidity / 100) * (temp + 10)) / 30)
    const etActual = et0 * 0.7 // Crop coefficient approximation

    return {
      date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      et0: et0,
      etActual: etActual,
      temperature: temp,
      humidity: humidity,
      solarRadiation: solarRadiation,
    }
  })

  const totalET = chartData.reduce((sum, d) => sum + d.etActual, 0)
  const avgET = totalET / chartData.length

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>ET0 hôm nay</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.et0.toFixed(2)} mm/day</div>
              <p className="text-xs text-muted-foreground">Bốc hơi tham chiếu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>ET thực tế</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.etActual.toFixed(2)} mm/day</div>
              <p className="text-xs text-muted-foreground">Bốc hơi thực tế</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>Tổng ET tháng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalET.toFixed(1)} mm</div>
              <p className="text-xs text-muted-foreground">Trung bình: {avgET.toFixed(2)} mm/day</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ bốc hơi thoát hơi nước</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} mm/day`,
                    name === "et0" ? "ET0 (Tham chiếu)" : "ET thực tế",
                  ]}
                />
                <Area type="monotone" dataKey="et0" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="ET0" />
                <Area
                  type="monotone"
                  dataKey="etActual"
                  stackId="2"
                  stroke="#10b981"
                  fill="#6ee7b7"
                  name="ET thực tế"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Các yếu tố ảnh hưởng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Nhiệt độ (°C)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Độ ẩm (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="solarRadiation"
                    stroke="#eab308"
                    strokeWidth={2}
                    name="Bức xạ (kWh/m²)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê bốc hơi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ET0 trung bình:</span>
                  <span className="font-medium">
                    {(chartData.reduce((sum, d) => sum + d.et0, 0) / chartData.length).toFixed(2)} mm/day
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ET0 tối đa:</span>
                  <span className="font-medium">{Math.max(...chartData.map((d) => d.et0)).toFixed(2)} mm/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ET0 tối thiểu:</span>
                  <span className="font-medium">{Math.min(...chartData.map((d) => d.et0)).toFixed(2)} mm/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hệ số cây trồng:</span>
                  <span className="font-medium">0.70</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          <span>Bốc hơi thoát hơi nước</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(2)} mm/day`, "ET0"]} />
            <Line type="monotone" dataKey="et0" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
