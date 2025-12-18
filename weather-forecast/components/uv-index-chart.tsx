"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Sun, Shield, AlertTriangle } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface UVIndexChartProps {
  data: NASAPowerData | null
}

export function UVIndexChart({ data }: UVIndexChartProps) {
  if (!data) return null

  // Calculate UV Index from solar radiation
  const chartData = data.timeSeries.map((item) => {
    const solarRadiation = item.ALLSKY_SFC_SW_DWN || 0
    const uvIndex = Math.max(0, Math.min(11, solarRadiation * 0.4)) // Simplified UV calculation

    return {
      date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      uvIndex: uvIndex,
      solarRadiation: solarRadiation,
    }
  })

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { level: "Thấp", color: "#22c55e", risk: "Ít nguy hiểm" }
    if (uv <= 5) return { level: "Trung bình", color: "#eab308", risk: "Cần bảo vệ" }
    if (uv <= 7) return { level: "Cao", color: "#f97316", risk: "Cần bảo vệ tốt" }
    if (uv <= 10) return { level: "Rất cao", color: "#dc2626", risk: "Nguy hiểm" }
    return { level: "Cực cao", color: "#7c3aed", risk: "Rất nguy hiểm" }
  }

  const currentUV = chartData[chartData.length - 1]?.uvIndex || 0
  const maxUV = Math.max(...chartData.map((d) => d.uvIndex))
  const avgUV = chartData.reduce((sum, d) => sum + d.uvIndex, 0) / chartData.length

  // UV distribution
  const uvDistribution = [
    { range: "0-2", count: chartData.filter((d) => d.uvIndex <= 2).length, color: "#22c55e" },
    { range: "3-5", count: chartData.filter((d) => d.uvIndex > 2 && d.uvIndex <= 5).length, color: "#eab308" },
    { range: "6-7", count: chartData.filter((d) => d.uvIndex > 5 && d.uvIndex <= 7).length, color: "#f97316" },
    { range: "8-10", count: chartData.filter((d) => d.uvIndex > 7 && d.uvIndex <= 10).length, color: "#dc2626" },
    { range: "11+", count: chartData.filter((d) => d.uvIndex > 10).length, color: "#7c3aed" },
  ]

  const currentLevel = getUVLevel(currentUV)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>Chỉ số UV hiện tại</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: currentLevel.color }}>
              {currentUV.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">{currentLevel.level}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>UV tối đa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxUV.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Trong khoảng thời gian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Mức độ rủi ro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{currentLevel.risk}</div>
            <p className="text-xs text-muted-foreground">Dựa trên chỉ số UV</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chỉ số UV theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 11]} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} - ${getUVLevel(value).level}`, "Chỉ số UV"]}
                />
                <Line
                  type="monotone"
                  dataKey="uvIndex"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố chỉ số UV</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uvDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value} ngày`, "Số ngày"]} />
                <Bar dataKey="count" fill="#f59e0b">
                  {uvDistribution.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Khuyến nghị bảo vệ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">UV Thấp (0-2)</h4>
              <p className="text-sm text-muted-foreground">Có thể ở ngoài trời an toàn. Đeo kính râm nếu trời nắng.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-yellow-600 mb-2">UV Trung bình (3-5)</h4>
              <p className="text-sm text-muted-foreground">Đeo kính râm, sử dụng kem chống nắng SPF 30+.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-orange-600 mb-2">UV Cao (6-7)</h4>
              <p className="text-sm text-muted-foreground">Bảo vệ da, đeo mũ, tránh nắng 10h-16h.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-red-600 mb-2">UV Rất cao (8-10)</h4>
              <p className="text-sm text-muted-foreground">Tránh nắng, che chắn kỹ, kem chống nắng SPF 50+.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-purple-600 mb-2">UV Cực cao (11+)</h4>
              <p className="text-sm text-muted-foreground">Tránh hoàn toàn ánh nắng trực tiếp.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
