"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"

interface ParameterSelectorProps {
  selectedParameters: string[]
  onParametersChange: (parameters: string[]) => void
  parameterInfo: Record<string, any>
}

export function ParameterSelector({ selectedParameters, onParametersChange, parameterInfo }: ParameterSelectorProps) {
  const handleToggle = (paramId: string) => {
    const newParams = selectedParameters.includes(paramId)
      ? selectedParameters.filter((p) => p !== paramId)
      : [...selectedParameters, paramId]
    onParametersChange(newParams)
  }

  const parameterGroups = {
    temperature: ["T2M", "T2M_MAX", "T2M_MIN", "T2MDEW", "T2MWET", "T10M", "TS"],
    humidity: ["RH2M", "QV2M"],
    wind: ["WS2M", "WD2M", "U2M", "V2M", "WS10M", "WS50M"],
    precipitation: ["PRECTOTCORR"],
    pressure: ["PS"],
    radiation: ["ALLSKY_SFC_SW_DWN", "CLRSKY_SFC_SW_DWN", "ALLSKY_SFC_LW_DWN", "ALLSKY_TOA_SW_DWN"],
    other: ["ALLSKY_SFC_UV_INDEX", "FROST_DAYS"],
  }

  const groupNames = {
    temperature: "Nhiệt độ",
    humidity: "Độ ẩm",
    wind: "Gió",
    precipitation: "Mưa",
    pressure: "Áp suất",
    radiation: "Bức xạ",
    other: "Khác",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Thông số</span>
          </div>
          <Badge variant="secondary">{selectedParameters.length} đã chọn</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {Object.entries(parameterGroups).map(([groupKey, params]) => (
            <div key={groupKey} className="space-y-2">
              <h4 className="font-medium text-sm">{groupNames[groupKey as keyof typeof groupNames]}</h4>
              <div className="space-y-1">
                {params.map((paramId) => {
                  const info = parameterInfo[paramId]
                  if (!info) return null

                  const Icon = info.icon
                  return (
                    <div key={paramId} className="flex items-center space-x-2">
                      <Checkbox
                        id={paramId}
                        checked={selectedParameters.includes(paramId)}
                        onCheckedChange={() => handleToggle(paramId)}
                      />
                      <Icon className={`h-4 w-4 ${info.color}`} />
                      <label htmlFor={paramId} className="text-sm cursor-pointer flex-1">
                        {info.name}
                      </label>
                      <span className="text-xs text-muted-foreground">{info.unit}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
