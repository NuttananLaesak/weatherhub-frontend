import type { LatestWeather } from "../types/weather";

interface Props {
  latest: LatestWeather;
}

export default function WeatherCard({ latest }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold">Latest Weather</h2>
      <p>Temp: {latest.temp_c} °C</p>
      <p>Humidity: {latest.humidity} %</p>
      <p>Wind: {latest.wind_ms} m/s</p>
      <p>Rain: {latest.rain_mm} mm</p>
    </div>
  );
}
