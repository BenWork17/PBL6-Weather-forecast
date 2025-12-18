"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Thermometer, TrendingUp, TrendingDown } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface TemperatureChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function TemperatureChart({ data, detailed = false }: TemperatureChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    temp: item.T2M || 0,
    tempMax: item.T2M_MAX || 0,
    tempMin: item.T2M_MIN || 0,
    dewPoint: item.T2MDEW || 0,
    wetBulb: item.T2MWET || 0,
    temp10m: item.T10M || 0,
  }))

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>Nhiệt độ hiện tại</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.T2M?.current.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Trung bình: {data.parameters.T2M?.average.toFixed(1)}°C</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span>Nhiệt độ tối đa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.T2M_MAX?.current.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.T2M_MAX?.average.toFixed(1)}°C
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span>Nhiệt độ tối thiểu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.T2M_MIN?.current.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.T2M_MIN?.average.toFixed(1)}°C
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-cyan-500" />
                <span>Điểm sương</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.T2MDEW?.current.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">
                Trung bình: {data.parameters.T2MDEW?.average.toFixed(1)}°C
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ nhiệt độ chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}°C`,
                    name === "tempMax"
                      ? "Tối đa"
                      : name === "tempMin"
                        ? "Tối thiểu"
                        : name === "temp"
                          ? "Trung bình"
                          : name === "dewPoint"
                            ? "Điểm sương"
                            : name === "wetBulb"
                              ? "Nhiệt độ ướt"
                              : "Nhiệt độ 10m",
                  ]}
                />
                <Legend />
                <Area type="monotone" dataKey="tempMax" stackId="1" stroke="#dc2626" fill="#fca5a5" name="Tối đa" />
                <Area type="monotone" dataKey="tempMin" stackId="1" stroke="#2563eb" fill="#93c5fd" name="Tối thiểu" />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Trung bình" />
                <Line
                  type="monotone"
                  dataKey="dewPoint"
                  stroke="#06b6d4"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Điểm sương"
                />
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
          <Thermometer className="h-5 w-5 text-red-500" />
          <span>Nhiệt độ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}°C`, "Nhiệt độ"]} />
            <Area type="monotone" dataKey="tempMax" stackId="1" stroke="#dc2626" fill="#fca5a5" />
            <Area type="monotone" dataKey="tempMin" stackId="1" stroke="#2563eb" fill="#93c5fd" />
            <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
