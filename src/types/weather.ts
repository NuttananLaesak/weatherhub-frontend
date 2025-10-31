export interface LatestWeather {
  temp_c: number;
  wind_ms: number;
  wind_direction: number;
  weather_code: number;
  timestamp: string;
}

export interface HourlyWeather {
  timestamp: string;
  temp_c: number;
  humidity: number;
  wind_ms: number;
  rain_mm: number;
  weather_code: number;
}

export interface DailyWeather {
  date: string;
  temp_min: number;
  temp_max: number;
  rain_total_mm: number;
  wind_max_ms: number;
}

export type HourlyPerDay = {
  date: string;
  hours: HourlyWeather[];
};

export type WeatherDataResponse = {
  latest: LatestWeather;
  hourlyByDay: HourlyPerDay[];
  daily: DailyWeather[];
};
