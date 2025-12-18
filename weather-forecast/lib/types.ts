export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number
  condition: string
  icon: string
  timestamp: string
}

export interface HourlyForecast {
  datetime: string
  hour: number
  temperature: number
  condition: string
  precipitation: number
  wind_speed: number
  humidity: number
  pressure: number
  description: string
  icon: string
  source: string
  uv_index?: number // Thêm field này
}

export interface ForecastDay {
  date: string
  hourly: HourlyForecast[]
}

export interface WeatherDetails {
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  feelsLike: number
  uvIndex: number
  visibility: number
  precipitation: number
}

export interface WeatherData {
  location: Location;
  current: {
    temperature: number;
    condition: string;
    icon: string;
    timestamp: string;
  };
  details: {
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    feelsLike: number;
    uvIndex: number;
    visibility: number;
    precipitation: number;
  };
  forecast: ForecastDay[];
}

export interface AirQualityData {
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
  category: string
  healthAdvice: string
}

export interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: "minor" | "moderate" | "severe"
  type: "storm" | "rain" | "wind" | "heat" | "cold" | "fog"
  startTime: string
  endTime: string
  areas: string[]
}

export interface WeatherNews {
  id: string
  title: string
  summary: string
  content: string
  image: string
  category: string
  publishedAt: string
  source: string
  url: string
}

// NASA POWER Data Types
export interface NASAPowerParameter {
  current: number
  average: number
  min: number
  max: number
  unit: string
}

export interface NASAPowerTimeSeriesItem {
  date: string
  T2M?: number
  T2M_MAX?: number
  T2M_MIN?: number
  RH2M?: number
  WS2M?: number
  WD2M?: number
  PRECTOTCORR?: number
  PS?: number
  ALLSKY_SFC_SW_DWN?: number
  CLRSKY_SFC_SW_DWN?: number
  ALLSKY_SFC_LW_DWN?: number
  ALLSKY_TOA_SW_DWN?: number
  T2MDEW?: number
  T2MWET?: number
  TS?: number
  T10M?: number
  QV2M?: number
  U2M?: number
  V2M?: number
  WS10M?: number
  WS50M?: number
  ALLSKY_SFC_UV_INDEX?: number
  FROST_DAYS?: number
  [key: string]: any
}

export interface NASAPowerData {
  parameters: Record<string, NASAPowerParameter>
  timeSeries: NASAPowerTimeSeriesItem[]
  location: Location
  dateRange: {
    start: string
    end: string
  }
  metadata: {
    source: string
    version: string
    lastUpdated: string
  }
}

// Chart Data Types
export interface ChartDataPoint {
  time: string
  value: number
  label?: string
  color?: string
}

export interface DailyChartData {
  date: string
  temperature: ChartDataPoint[]
  humidity: ChartDataPoint[]
  windSpeed: ChartDataPoint[]
  precipitation: ChartDataPoint[]
  pressure: ChartDataPoint[]
  uvIndex: ChartDataPoint[]
}
