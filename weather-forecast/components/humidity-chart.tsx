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
import { Droplets, Cloud } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface HumidityChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function HumidityChart({ data, detailed = false }: HumidityChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    relativeHumidity: item.RH2M || 0,
    specificHumidity: item.QV2M || 0,
    dewPoint: item.T2MDEW || 0,
    wetBulb: item.T2MWET || 0,
  }))

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
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
                <Cloud className="h-4 w-4 text-cyan-500" />
                <span>Độ ẩm riêng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.QV2M?.current.toFixed(2)} g/kg</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.QV2M?.average.toFixed(2)} g/kg
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ độ ẩm chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "relativeHumidity"
                      ? `${value.toFixed(1)}%`
                      : name === "specificHumidity"
                        ? `${value.toFixed(2)} g/kg`
                        : `${value.toFixed(1)}°C`,
                    name === "relativeHumidity"
                      ? "Độ ẩm tương đối"
                      : name === "specificHumidity"
                        ? "Độ ẩm riêng"
                        : name === "dewPoint"
                          ? "Điểm sương"
                          : "Nhiệt độ ướt",
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="relativeHumidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Độ ẩm tương đối (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="specificHumidity"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Độ ẩm riêng (g/kg)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="dewPoint"
                  stroke="#0891b2"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Điểm sương (°C)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="wetBulb"
                  stroke="#0e7490"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name="Nhiệt độ ướt (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố độ ẩm tương đối</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Độ ẩm"]} />
                  <Area type="monotone" dataKey="relativeHumidity" stroke="#3b82f6" fill="#93c5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mối quan hệ nhiệt độ - độ ẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Điểm sương trung bình</p>
                    <p className="text-lg font-bold">{data.parameters.T2MDEW?.average.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nhiệt độ ướt trung bình</p>
                    <p className="text-lg font-bold">{data.parameters.T2MWET?.average.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Độ ẩm tối đa</p>
                    <p className="text-lg font-bold">
                      {Math.max(...chartData.map((d) => d.relativeHumidity)).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Độ ẩm tối thiểu</p>
                    <p className="text-lg font-bold">
                      {Math.min(...chartData.map((d) => d.relativeHumidity)).toFixed(1)}%
                    </p>
                  </div>
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
          <span>Độ ẩm</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Độ ẩm"]} />
            <Line type="monotone" dataKey="relativeHumidity" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
