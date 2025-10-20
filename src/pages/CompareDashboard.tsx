import { useEffect, useState } from "react";
import api from "../api/axios";
import { Line } from "react-chartjs-2";
import type { Location } from "../types/location";
import type { DailyWeather } from "../types/weather";

export default function CompareDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [city1, setCity1] = useState<Location | null>(null);
  const [city2, setCity2] = useState<Location | null>(null);

  const [daily1, setDaily1] = useState<DailyWeather[]>([]);
  const [daily2, setDaily2] = useState<DailyWeather[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await api.get<Location[]>("/locations");
      setLocations(res.data);
      if (res.data.length >= 2) {
        setCity1(res.data[0]);
        setCity2(res.data[1]);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!city1 || !city2) return;
    const fetchDaily = async () => {
      const d1 = await api.get<DailyWeather[]>(
        `/weather/daily?location_id=${city1.id}&from=2025-10-10&to=2025-10-16`
      );
      const d2 = await api.get<DailyWeather[]>(
        `/weather/daily?location_id=${city2.id}&from=2025-10-10&to=2025-10-16`
      );
      setDaily1(d1.data);
      setDaily2(d2.data);
    };
    fetchDaily();
  }, [city1, city2]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Compare Mode</h1>

      <div className="mb-4">
        <label>City 1:</label>
        <select
          className="border p-2 mx-2"
          value={city1?.id || ""}
          onChange={(e) =>
            setCity1(
              locations.find((l) => l.id === Number(e.target.value)) || null
            )
          }
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <label>City 2:</label>
        <select
          className="border p-2 mx-2"
          value={city2?.id || ""}
          onChange={(e) =>
            setCity2(
              locations.find((l) => l.id === Number(e.target.value)) || null
            )
          }
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {daily1.length > 0 && daily2.length > 0 && (
        <Line
          data={{
            labels: daily1.map((d) => d.date),
            datasets: [
              {
                label: `Temp Max ${city1?.name}`,
                data: daily1.map((d) => d.temp_max),
                borderColor: "red",
                fill: false,
              },
              {
                label: `Temp Max ${city2?.name}`,
                data: daily2.map((d) => d.temp_max),
                borderColor: "blue",
                fill: false,
              },
              {
                label: `Rain ${city1?.name}`,
                data: daily1.map((d) => d.rain_total_mm),
                borderColor: "green",
                fill: false,
              },
              {
                label: `Rain ${city2?.name}`,
                data: daily2.map((d) => d.rain_total_mm),
                borderColor: "orange",
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: { x: { type: "category" }, y: { beginAtZero: true } },
          }}
        />
      )}
    </div>
  );
}
