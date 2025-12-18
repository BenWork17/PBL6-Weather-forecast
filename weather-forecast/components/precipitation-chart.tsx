"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { CloudRain, Droplets } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface PrecipitationChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function PrecipitationChart({ data, detailed = false }: PrecipitationChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    precipitation: item.PRECTOTCORR || 0,
    humidity: item.RH2M || 0,
    specificHumidity: item.QV2M || 0,
  }))

  // Calculate monthly totals
  const monthlyData = chartData.reduce((acc: any[], item) => {
    const month = item.date.split(" ")[1]
    const existing = acc.find((m) => m.month === month)
    if (existing) {
      existing.total += item.precipitation
      existing.days += item.precipitation > 0 ? 1 : 0
    } else {
      acc.push({
        month,
        total: item.precipitation,
        days: item.precipitation > 0 ? 1 : 0,
      })
    }
    return acc
  }, [])

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <CloudRain className="h-4 w-4 text-blue-500" />
                <span>Lượng mưa hôm nay</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.PRECTOTCORR?.current.toFixed(1)} mm</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.PRECTOTCORR?.average.toFixed(1)} mm
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span>Độ ẩm tương đối</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.RH2M?.current.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Trung bình: {data.parameters.RH2M?.average.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <span>Độ ẩm riêng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.QV2M?.current.toFixed(1)} g/kg</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.QV2M?.average.toFixed(1)} g/kg
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lượng mưa hàng ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} mm`, "Lượng mưa"]} />
                  <Bar dataKey="precipitation" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng lượng mưa theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "total" ? `${value.toFixed(1)} mm` : `${value} ngày`,
                      name === "total" ? "Tổng lượng mưa" : "Số ngày mưa",
                    ]}
                  />
                  <Bar dataKey="total" fill="#0ea5e9" name="Tổng lượng mưa" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Độ ẩm tương đối</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Độ ẩm"]} />
                <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudRain className="h-5 w-5 text-blue-500" />
          <span>Lượng mưa</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)} mm`, "Lượng mưa"]} />
            <Bar dataKey="precipitation" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
