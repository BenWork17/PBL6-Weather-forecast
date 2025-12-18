export interface TemperatureMapData {
  location_id: number
  name: string
  latitude: number
  longitude: number
  temperature: number
  humidity: number
  wind_speed: number
  condition: string
  timestamp: string | null
}

export interface TemperatureMapResponse {
  success: boolean
  data: TemperatureMapData[]
  count: number
}

export async function getTemperatureMapData(): Promise<TemperatureMapResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const url = `${apiUrl}/api/weather/temperature-map`
    
    console.log('Fetching temperature data from:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Temperature data received:', data)
    console.log('Data array:', data.data)
    console.log('Data count:', data.count)
    
    return data
  } catch (error) {
    console.error('Error fetching temperature map data:', error)
    throw error
  }
}