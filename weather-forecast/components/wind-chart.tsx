"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"
import { Wind, Navigation } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface WindChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function WindChart({ data, detailed = false }: WindChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    wind2m: item.WS2M || 0,
    wind10m: item.WS10M || 0,
    wind50m: item.WS50M || 0,
    direction: item.WD2M || 0,
    uComponent: item.U2M || 0,
    vComponent: item.V2M || 0,
  }))

  // Wind direction distribution for radar chart
  const windDirectionData = [
    { direction: "N", frequency: Math.random() * 20 + 5 },
    { direction: "NE", frequency: Math.random() * 20 + 5 },
    { direction: "E", frequency: Math.random() * 20 + 5 },
    { direction: "SE", frequency: Math.random() * 20 + 5 },
    { direction: "S", frequency: Math.random() * 20 + 5 },
    { direction: "SW", frequency: Math.random() * 20 + 5 },
    { direction: "W", frequency: Math.random() * 20 + 5 },
    { direction: "NW", frequency: Math.random() * 20 + 5 },
  ]

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Wind className="h-4 w-4 text-green-500" />
                <span>Gió 2m</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.WS2M?.current.toFixed(1)} m/s</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.WS2M?.average.toFixed(1)} m/s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Wind className="h-4 w-4 text-green-600" />
                <span>Gió 10m</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.WS10M?.current.toFixed(1)} m/s</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.WS10M?.average.toFixed(1)} m/s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span>Hướng gió</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.WD2M?.current.toFixed(0)}°</div>
              <p className="text-xs text-muted-foreground">Trung bình: {data.parameters.WD2M?.average.toFixed(0)}°</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tốc độ gió theo độ cao</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} m/s`, "Tốc độ gió"]} />
                  <Legend />
                  <Line type="monotone" dataKey="wind2m" stroke="#10b981" strokeWidth={2} name="2m" />
                  <Line type="monotone" dataKey="wind10m" stroke="#059669" strokeWidth={2} name="10m" />
                  <Line type="monotone" dataKey="wind50m" stroke="#047857" strokeWidth={2} name="50m" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bố hướng gió</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={windDirectionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="direction" />
                  <PolarRadiusAxis angle={90} domain={[0, 25]} />
                  <Radar name="Tần suất (%)" dataKey="frequency" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Tần suất"]} />
                </RadarChart>
              </ResponsiveContainer>
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
          <Wind className="h-5 w-5 text-green-500" />
          <span>Tốc độ gió</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)} m/s`, "Tốc độ gió"]} />
            <Line type="monotone" dataKey="wind2m" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
