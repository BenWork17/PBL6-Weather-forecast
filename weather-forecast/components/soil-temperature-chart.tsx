"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Globe, Thermometer, Layers } from "lucide-react"
import type { NASAPowerData } from "@/lib/types"

interface SoilTemperatureChartProps {
  data: NASAPowerData | null
  detailed?: boolean
}

export function SoilTemperatureChart({ data, detailed = false }: SoilTemperatureChartProps) {
  if (!data) return null

  const chartData = data.timeSeries.map((item) => {
    const surfaceTemp = item.TS || item.T2M || 20
    // Estimate soil temperatures at different depths
    const soil5cm = surfaceTemp - 2 + Math.sin(Math.random() * Math.PI) * 3
    const soil10cm = surfaceTemp - 3 + Math.sin(Math.random() * Math.PI) * 2
    const soil20cm = surfaceTemp - 4 + Math.sin(Math.random() * Math.PI) * 1.5
    const soil50cm = surfaceTemp - 5 + Math.sin(Math.random() * Math.PI) * 1

    return {
      date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
      surface: surfaceTemp,
      soil5cm: soil5cm,
      soil10cm: soil10cm,
      soil20cm: soil20cm,
      soil50cm: soil50cm,
      airTemp: item.T2M || 20,
    }
  })

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Globe className="h-4 w-4 text-amber-600" />
                <span>Nhiệt độ bề mặt</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.parameters.TS?.current.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Trung bình: {data.parameters.TS?.average.toFixed(1)}°C</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Layers className="h-4 w-4 text-orange-500" />
                <span>Đất 5cm</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.soil5cm.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Độ sâu 5cm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Layers className="h-4 w-4 text-red-500" />
                <span>Đất 20cm</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData[chartData.length - 1]?.soil20cm.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Độ sâu 20cm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <span>Chênh lệch</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(chartData[chartData.length - 1]?.surface - chartData[chartData.length - 1]?.soil50cm).toFixed(1)}°C
              </div>
              <p className="text-xs text-muted-foreground">Bề mặt - 50cm</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nhiệt độ đất theo độ sâu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}°C`,
                    name === "surface"
                      ? "Bề mặt"
                      : name === "soil5cm"
                        ? "Đất 5cm"
                        : name === "soil10cm"
                          ? "Đất 10cm"
                          : name === "soil20cm"
                            ? "Đất 20cm"
                            : name === "soil50cm"
                              ? "Đất 50cm"
                              : "Không khí",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="airTemp"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Không khí"
                />
                <Line type="monotone" dataKey="surface" stroke="#f59e0b" strokeWidth={2} name="Bề mặt" />
                <Line type="monotone" dataKey="soil5cm" stroke="#f97316" strokeWidth={2} name="5cm" />
                <Line type="monotone" dataKey="soil10cm" stroke="#ea580c" strokeWidth={2} name="10cm" />
                <Line type="monotone" dataKey="soil20cm" stroke="#dc2626" strokeWidth={2} name="20cm" />
                <Line type="monotone" dataKey="soil50cm" stroke="#b91c1c" strokeWidth={2} name="50cm" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gradient nhiệt độ đất</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="surface" stackId="1" stroke="#f59e0b" fill="#fed7aa" name="Bề mặt" />
                  <Area type="monotone" dataKey="soil5cm" stackId="2" stroke="#f97316" fill="#fdba74" name="5cm" />
                  <Area type="monotone" dataKey="soil20cm" stackId="3" stroke="#dc2626" fill="#fca5a5" name="20cm" />
                  <Area type="monotone" dataKey="soil50cm" stackId="4" stroke="#b91c1c" fill="#f87171" name="50cm" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê nhiệt độ đất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Nhiệt độ trung bình</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bề mặt:</span>
                      <span>{(chartData.reduce((sum, d) => sum + d.surface, 0) / chartData.length).toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5cm:</span>
                      <span>{(chartData.reduce((sum, d) => sum + d.soil5cm, 0) / chartData.length).toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>20cm:</span>
                      <span>{(chartData.reduce((sum, d) => sum + d.soil20cm, 0) / chartData.length).toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>50cm:</span>
                      <span>{(chartData.reduce((sum, d) => sum + d.soil50cm, 0) / chartData.length).toFixed(1)}°C</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Biên độ nhiệt</h4>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Bề mặt:</span>
                      <span>
                        {(
                          Math.max(...chartData.map((d) => d.surface)) - Math.min(...chartData.map((d) => d.surface))
                        ).toFixed(1)}
                        °C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>50cm:</span>
                      <span>
                        {(
                          Math.max(...chartData.map((d) => d.soil50cm)) - Math.min(...chartData.map((d) => d.soil50cm))
                        ).toFixed(1)}
                        °C
                      </span>
                    </div>
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
          <Globe className="h-5 w-5 text-amber-600" />
          <span>Nhiệt độ đất</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}°C`, "Nhiệt độ đất"]} />
            <Line type="monotone" dataKey="surface" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
