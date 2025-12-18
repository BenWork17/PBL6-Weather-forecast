"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Cloud, Sun, Eye } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface CloudCoverChartProps {
  data: NASAPowerData | null
}

export function CloudCoverChart({ data }: CloudCoverChartProps) {
  if (!data) return null

  // Estimate cloud cover from solar radiation data
  const chartData = data.timeSeries.map((item) => {
    const clearSky = item.CLRSKY_SFC_SW_DWN || 0
    const allSky = item.ALLSKY_SFC_SW_DWN || 0
    const cloudCover = clearSky > 0 ? Math.max(0, Math.min(100, (1 - allSky / clearSky) * 100)) : 0

    return {
      date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      cloudCover: cloudCover,
      clearSky: clearSky,
      allSky: allSky,
      visibility: 10 - (cloudCover / 100) * 3, // Estimated visibility
    }
  })

  // Cloud cover distribution
  const cloudDistribution = [
    { name: "Quang đãng (0-25%)", value: chartData.filter((d) => d.cloudCover <= 25).length, color: "#fbbf24" },
    {
      name: "Ít mây (25-50%)",
      value: chartData.filter((d) => d.cloudCover > 25 && d.cloudCover <= 50).length,
      color: "#94a3b8",
    },
    {
      name: "Nhiều mây (50-75%)",
      value: chartData.filter((d) => d.cloudCover > 50 && d.cloudCover <= 75).length,
      color: "#64748b",
    },
    { name: "U ám (75-100%)", value: chartData.filter((d) => d.cloudCover > 75).length, color: "#475569" },
  ]

  const avgCloudCover = chartData.reduce((sum, d) => sum + d.cloudCover, 0) / chartData.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Cloud className="h-4 w-4 text-gray-500" />
              <span>Độ che phủ mây</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.cloudCover.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Trung bình: {avgCloudCover.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>Bức xạ thực tế</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.allSky.toFixed(2)} kWh/m²</div>
            <p className="text-xs text-muted-foreground">So với trời quang</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>Tầm nhìn ước tính</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.visibility.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">Dựa trên độ che phủ mây</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Độ che phủ mây theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Độ che phủ mây"]} />
                <Area type="monotone" dataKey="cloudCover" stroke="#64748b" fill="#94a3b8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố độ che phủ mây</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cloudDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {cloudDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>So sánh bức xạ trời quang và thực tế</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} kWh/m²`,
                  name === "clearSky" ? "Trời quang" : "Thực tế",
                ]}
              />
              <Area type="monotone" dataKey="clearSky" stackId="1" stroke="#fbbf24" fill="#fde68a" name="Trời quang" />
              <Area type="monotone" dataKey="allSky" stackId="2" stroke="#3b82f6" fill="#93c5fd" name="Thực tế" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
