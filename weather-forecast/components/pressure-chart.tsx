"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Gauge, TrendingUp, TrendingDown } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface PressureChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function PressureChart({ data, detailed = false }: PressureChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    pressure: item.PS || 0,
  }))

  // Calculate pressure trends
  const pressureTrend =
    chartData.length > 1 ? chartData[chartData.length - 1].pressure - chartData[chartData.length - 2].pressure : 0

  const maxPressure = Math.max(...chartData.map((d) => d.pressure))
  const minPressure = Math.min(...chartData.map((d) => d.pressure))
  const avgPressure = chartData.reduce((sum, d) => sum + d.pressure, 0) / chartData.length

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-purple-500" />
                <span>Áp suất hiện tại</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.PS?.current.toFixed(2)} kPa</div>
              <p className="text-xs text-muted-foreground">{(data.parameters.PS?.current * 10).toFixed(0)} hPa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Áp suất tối đa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maxPressure.toFixed(2)} kPa</div>
              <p className="text-xs text-muted-foreground">{(maxPressure * 10).toFixed(0)} hPa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Áp suất tối thiểu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minPressure.toFixed(2)} kPa</div>
              <p className="text-xs text-muted-foreground">{(minPressure * 10).toFixed(0)} hPa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-blue-500" />
                <span>Xu hướng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pressureTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                {pressureTrend > 0 ? "+" : ""}
                {pressureTrend.toFixed(3)} kPa
              </div>
              <p className="text-xs text-muted-foreground">{pressureTrend > 0 ? "Tăng" : "Giảm"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ áp suất khí quyển</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} kPa (${(value * 10).toFixed(0)} hPa)`, "Áp suất"]}
                />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê áp suất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trung bình:</span>
                  <span className="font-medium">{avgPressure.toFixed(2)} kPa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Biên độ:</span>
                  <span className="font-medium">{(maxPressure - minPressure).toFixed(2)} kPa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Độ lệch chuẩn:</span>
                  <span className="font-medium">
                    {Math.sqrt(
                      chartData.reduce((sum, d) => sum + Math.pow(d.pressure - avgPressure, 2), 0) / chartData.length,
                    ).toFixed(3)}{" "}
                    kPa
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân loại áp suất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Áp suất cao &gt; 102.0 kPa:</span>
                  <span className="font-medium">{chartData.filter((d) => d.pressure > 102.0).length} ngày</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Áp suất bình thường 100.0-102.0 kPa:</span>
                  <span className="font-medium">
                    {chartData.filter((d) => d.pressure >= 100.0 && d.pressure <= 102.0).length} ngày
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Áp suất thấp &lt; 100.0 kPa:</span>
                  <span className="font-medium">{chartData.filter((d) => d.pressure < 100.0).length} ngày</span>
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
          <Gauge className="h-5 w-5 text-purple-500" />
          <span>Áp suất khí quyển</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(2)} kPa`, "Áp suất"]} />
            <Line type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
