import type { NASAPowerData, Location } from "./types"

export async function fetchNASAPowerData(
  location: Location,
  startDate: Date,
  endDate: Date,
  parameters: string[],
): Promise<NASAPowerData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate mock NASA POWER data
  const timeSeries = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Seasonal variations based on location
    const latFactor = Math.cos((location.lat * Math.PI) / 180)
    const seasonalTemp = 25 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2) * latFactor
    const seasonalRH = 70 + 20 * Math.sin((dayOfYear / 365) * 2 * Math.PI)
    const seasonalSolar = 5 + 3 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2) * latFactor

    // Daily variations with some randomness
    const dataPoint: any = {
      date: currentDate.toISOString().split("T")[0],
      T2M: seasonalTemp + (Math.random() - 0.5) * 6,
      T2M_MAX: seasonalTemp + 5 + (Math.random() - 0.5) * 4,
      T2M_MIN: seasonalTemp - 5 + (Math.random() - 0.5) * 4,
      RH2M: Math.max(20, Math.min(95, seasonalRH + (Math.random() - 0.5) * 30)),
      WS2M: 2 + Math.random() * 8,
      WD2M: Math.random() * 360,
      PRECTOTCORR: Math.random() < 0.3 ? Math.random() * 15 : Math.random() * 2,
      PS: 101.3 + (Math.random() - 0.5) * 2,
      ALLSKY_SFC_SW_DWN: Math.max(0, seasonalSolar + (Math.random() - 0.5) * 2),
      CLRSKY_SFC_SW_DWN: Math.max(0, seasonalSolar + 1 + (Math.random() - 0.5) * 1),
      ALLSKY_SFC_LW_DWN: 15 + (Math.random() - 0.5) * 3,
      ALLSKY_TOA_SW_DWN: seasonalSolar + 2 + (Math.random() - 0.5) * 1,
      T2MDEW: seasonalTemp - 10 + (Math.random() - 0.5) * 8,
      T2MWET: seasonalTemp - 3 + (Math.random() - 0.5) * 4,
      TS: seasonalTemp + (Math.random() - 0.5) * 4,
      T10M: seasonalTemp + 1 + (Math.random() - 0.5) * 3,
      QV2M: 8 + (Math.random() - 0.5) * 6,
      U2M: (Math.random() - 0.5) * 10,
      V2M: (Math.random() - 0.5) * 10,
      WS10M: 2.5 + Math.random() * 9,
      WS50M: 3 + Math.random() * 12,
      ALLSKY_SFC_UV_INDEX: Math.max(0, Math.min(11, seasonalSolar * 1.5 + (Math.random() - 0.5) * 2)),
      FROST_DAYS: seasonalTemp < 5 ? (Math.random() < 0.3 ? 1 : 0) : 0,
    }

    timeSeries.push(dataPoint)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Calculate parameter statistics
  const parameterStats: Record<string, any> = {}

  parameters.forEach((param) => {
    const values = timeSeries.map((item) => item[param]).filter((val) => val !== undefined)
    if (values.length > 0) {
      parameterStats[param] = {
        current: values[values.length - 1],
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        unit: getParameterUnit(param),
      }
    }
  })

  return {
    parameters: parameterStats,
    timeSeries,
    location,
    dateRange: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
    metadata: {
      source: "NASA POWER",
      version: "2.0",
      lastUpdated: new Date().toISOString(),
    },
  }
}

function getParameterUnit(param: string): string {
  const units: Record<string, string> = {
    T2M: "°C",
    T2M_MAX: "°C",
    T2M_MIN: "°C",
    RH2M: "%",
    WS2M: "m/s",
    WD2M: "°",
    PRECTOTCORR: "mm/day",
    PS: "kPa",
    ALLSKY_SFC_SW_DWN: "kWh/m²/day",
    CLRSKY_SFC_SW_DWN: "kWh/m²/day",
    ALLSKY_SFC_LW_DWN: "kWh/m²/day",
    ALLSKY_TOA_SW_DWN: "kWh/m²/day",
    T2MDEW: "°C",
    T2MWET: "°C",
    TS: "°C",
    T10M: "°C",
    QV2M: "g/kg",
    U2M: "m/s",
    V2M: "m/s",
    WS10M: "m/s",
    WS50M: "m/s",
    ALLSKY_SFC_UV_INDEX: "",
    FROST_DAYS: "days",
  }

  return units[param] || ""
}
