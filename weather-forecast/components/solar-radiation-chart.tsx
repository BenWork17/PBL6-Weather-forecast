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
  AreaChart,
  Area,
} from "recharts"
import { Sun, Zap, Satellite } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface SolarRadiationChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function SolarRadiationChart({ data, detailed = false }: SolarRadiationChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    allSky: item.ALLSKY_SFC_SW_DWN || 0,
    clearSky: item.CLRSKY_SFC_SW_DWN || 0,
    longWave: item.ALLSKY_SFC_LW_DWN || 0,
    toa: item.ALLSKY_TOA_SW_DWN || 0,
  }))

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span>Bức xạ mặt trời</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.parameters.ALLSKY_SFC_SW_DWN?.current.toFixed(2)} kWh/m²/day
              </div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.ALLSKY_SFC_SW_DWN?.average.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Bức xạ sóng dài</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.parameters.ALLSKY_SFC_LW_DWN?.current.toFixed(2)} kWh/m²/day
              </div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.ALLSKY_SFC_LW_DWN?.average.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Satellite className="h-4 w-4 text-pink-500" />
                <span>Bức xạ TOA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.parameters.ALLSKY_TOA_SW_DWN?.current.toFixed(2)} kWh/m²/day
              </div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.ALLSKY_TOA_SW_DWN?.average.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ bức xạ mặt trời chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} kWh/m²/day`,
                    name === "allSky"
                      ? "Bức xạ tổng"
                      : name === "clearSky"
                        ? "Bức xạ trời quang"
                        : name === "longWave"
                          ? "Bức xạ sóng dài"
                          : "Bức xạ TOA",
                  ]}
                />
                <Legend />
                <Area type="monotone" dataKey="allSky" stackId="1" stroke="#f59e0b" fill="#fbbf24" name="Bức xạ tổng" />
                <Area
                  type="monotone"
                  dataKey="clearSky"
                  stackId="2"
                  stroke="#f97316"
                  fill="#fb923c"
                  name="Bức xạ trời quang"
                />
                <Area
                  type="monotone"
                  dataKey="longWave"
                  stackId="3"
                  stroke="#6366f1"
                  fill="#818cf8"
                  name="Bức xạ sóng dài"
                />
                <Line type="monotone" dataKey="toa" stroke="#ec4899" strokeWidth={2} name="Bức xạ TOA" />
              </AreaChart>
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
          <Sun className="h-5 w-5 text-yellow-500" />
          <span>Bức xạ mặt trời</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(2)} kWh/m²/day`, "Bức xạ"]} />
            <Line type="monotone" dataKey="allSky" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
