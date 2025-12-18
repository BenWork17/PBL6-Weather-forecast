export interface WeatherMapData {
  location_id: number
  name: string
  latitude: number
  longitude: number
  timestamp: string | null
}

export interface TemperatureMapData extends WeatherMapData {
  temperature: number
  humidity: number
  wind_speed: number
  condition: string
}

export interface PrecipitationMapData extends WeatherMapData {
  precipitation: number
}

export interface WindMapData extends WeatherMapData {
  wind_speed: number
}

export interface PressureMapData extends WeatherMapData {
  pressure: number
}

export interface WeatherMapResponse<T> {
  success: boolean
  data: T[]
  count: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getTemperatureMapData(): Promise<WeatherMapResponse<TemperatureMapData>> {
  const response = await fetch(`${API_URL}/api/temperature-map`)  // Bỏ /weather
  if (!response.ok) throw new Error('Failed to fetch temperature data')
  return await response.json()
}

export async function getPrecipitationMapData(): Promise<WeatherMapResponse<PrecipitationMapData>> {
  const response = await fetch(`${API_URL}/api/precipitation-map`)  // Bỏ /weather
  if (!response.ok) throw new Error('Failed to fetch precipitation data')
  return await response.json()
}

export async function getWindMapData(): Promise<WeatherMapResponse<WindMapData>> {
  const response = await fetch(`${API_URL}/api/wind-map`)  // Bỏ /weather
  if (!response.ok) throw new Error('Failed to fetch wind data')
  return await response.json()
}

export async function getPressureMapData(): Promise<WeatherMapResponse<PressureMapData>> {
  const response = await fetch(`${API_URL}/api/pressure-map`)  // Bỏ /weather
  if (!response.ok) throw new Error('Failed to fetch pressure data')
  return await response.json()
}