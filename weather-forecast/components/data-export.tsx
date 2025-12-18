"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Table, BarChart3 } from "lucide-react"
import type { NASAPowerData, Location } from "@/lib/types"

interface DataExportProps {
  data: NASAPowerData | null
  location: Location
}

export function DataExport({ data, location }: DataExportProps) {
  const [selectedParams, setSelectedParams] = useState<string[]>(["T2M", "RH2M", "WS2M"])
  const [exportFormat, setExportFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)

  const parameters = [
    { id: "T2M", name: "Nhiệt độ 2m (°C)" },
    { id: "T2M_MAX", name: "Nhiệt độ tối đa (°C)" },
    { id: "T2M_MIN", name: "Nhiệt độ tối thiểu (°C)" },
    { id: "RH2M", name: "Độ ẩm tương đối (%)" },
    { id: "WS2M", name: "Tốc độ gió 2m (m/s)" },
    { id: "WD2M", name: "Hướng gió 2m (°)" },
    { id: "PRECTOTCORR", name: "Lượng mưa (mm/day)" },
    { id: "PS", name: "Áp suất bề mặt (kPa)" },
    { id: "ALLSKY_SFC_SW_DWN", name: "Bức xạ mặt trời (kWh/m²/day)" },
    { id: "CLRSKY_SFC_SW_DWN", name: "Bức xạ trời quang (kWh/m²/day)" },
    { id: "T2MDEW", name: "Điểm sương (°C)" },
    { id: "QV2M", name: "Độ ẩm riêng (g/kg)" },
  ]

  const handleExport = async () => {
    if (!data) return

    setIsExporting(true)

    try {
      let content = ""
      const filename = `nasa-power-${location.name}-${new Date().toISOString().split("T")[0]}`

      if (exportFormat === "csv") {
        // CSV Export
        const headers = ["Date", ...selectedParams.map((p) => parameters.find((param) => param.id === p)?.name || p)]
        content = headers.join(",") + "\n"

        data.timeSeries.forEach((item) => {
          const row = [item.date, ...selectedParams.map((param) => item[param as keyof typeof item] || "")]
          content += row.join(",") + "\n"
        })

        downloadFile(content, `${filename}.csv`, "text/csv")
      } else if (exportFormat === "json") {
        // JSON Export
        const exportData = {
          location: location,
          parameters: selectedParams,
          data: data.timeSeries.map((item) => {
            const filteredItem: any = { date: item.date }
            selectedParams.forEach((param) => {
              filteredItem[param] = item[param as keyof typeof item]
            })
            return filteredItem
          }),
          metadata: {
            exportDate: new Date().toISOString(),
            source: "NASA POWER",
            coordinates: `${location.lat}, ${location.lon}`,
          },
        }

        content = JSON.stringify(exportData, null, 2)
        downloadFile(content, `${filename}.json`, "application/json")
      } else if (exportFormat === "txt") {
        // Text Export
        content = `NASA POWER Data Export\n`
        content += `Location: ${location.name} (${location.lat}, ${location.lon})\n`
        content += `Export Date: ${new Date().toLocaleDateString("vi-VN")}\n`
        content += `Parameters: ${selectedParams.join(", ")}\n\n`

        data.timeSeries.forEach((item) => {
          content += `Date: ${item.date}\n`
          selectedParams.forEach((param) => {
            const paramName = parameters.find((p) => p.id === param)?.name || param
            content += `  ${paramName}: ${item[param as keyof typeof item] || "N/A"}\n`
          })
          content += "\n"
        })

        downloadFile(content, `${filename}.txt`, "text/plain")
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleParamToggle = (paramId: string) => {
    setSelectedParams((prev) => (prev.includes(paramId) ? prev.filter((p) => p !== paramId) : [...prev, paramId]))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Xuất dữ liệu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Xuất dữ liệu NASA POWER</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Định dạng xuất</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4" />
                    <span>CSV (Excel)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>JSON (Lập trình)</span>
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Text (Đọc)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parameter Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn thông số</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
              {parameters.map((param) => (
                <div key={param.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={param.id}
                    checked={selectedParams.includes(param.id)}
                    onCheckedChange={() => handleParamToggle(param.id)}
                  />
                  <label htmlFor={param.id} className="text-sm cursor-pointer">
                    {param.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Đã chọn {selectedParams.length} thông số</p>
          </div>

          {/* Export Info */}
          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium mb-2">Thông tin xuất</h4>
            <div className="text-sm space-y-1">
              <p>Địa điểm: {location.name}</p>
              <p>
                Tọa độ: {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
              </p>
              <p>Số ngày: {data?.timeSeries.length || 0}</p>
              <p>Thông số: {selectedParams.length}</p>
            </div>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} disabled={selectedParams.length === 0 || isExporting} className="w-full">
            {isExporting ? (
              <>Đang xuất...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Xuất dữ liệu
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
