import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type {
  LatestWeather,
  HourlyWeather,
  DailyWeather,
} from "../types/weather";
import type { Location } from "../types/location";

// register components ของ ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const [latest, setLatest] = useState<LatestWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyWeather[]>([]);
  const [daily, setDaily] = useState<DailyWeather[]>([]);

  // ดึงรายชื่อเมือง
  useEffect(() => {
    const fetchLocations = async () => {
      const res = await api.get<Location[]>("/locations");
      setLocations(res.data);
      if (res.data.length > 0) setSelectedLocation(res.data[0]);
    };
    fetchLocations();
  }, []);

  // ดึง weather เมื่อเปลี่ยนเมือง
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchWeather = async () => {
      const latestRes = await api.get<LatestWeather>(
        `/weather/latest?location_id=${selectedLocation.id}`
      );
      setLatest(latestRes.data);

      const today = new Date();

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // ✅ กำหนดจากวันนี้ถึงพรุ่งนี้
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(today);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const fromDate = formatLocalDate(sevenDaysAgo);
      const toDate = formatLocalDate(today);

      // ⏰ ดึง hourly: วันนี้ตั้งแต่ 00:00 ถึง ก่อน 00:00 ของพรุ่งนี้
      const hourlyRes = await api.get<HourlyWeather[]>(
        `/weather/hourly?location_id=${
          selectedLocation.id
        }&from=${formatLocalDate(startOfToday)}&to=${formatLocalDate(
          startOfTomorrow
        )}`
      );
      setHourly(hourlyRes.data);

      // 📆 ดึง daily 7 วันย้อนหลัง
      const dailyRes = await api.get<DailyWeather[]>(
        `/weather/daily?location_id=${selectedLocation.id}&from=${fromDate}&to=${toDate}`
      );
      setDaily(dailyRes.data.reverse());
    };

    fetchWeather();
  }, [selectedLocation]);

  return (
    <div>
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Dropdown เลือกเมือง */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select City:</label>
          <select
            className="border p-2 rounded"
            value={selectedLocation?.id || ""}
            onChange={(e) =>
              setSelectedLocation(
                locations.find((loc) => loc.id === Number(e.target.value)) ||
                  null
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

        {/* Latest Weather Card */}
        {latest && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-bold">
              Latest Weather - {selectedLocation?.name}
            </h2>
            <p>Temp: {latest.temp_c} °C</p>
            <p>Humidity: {latest.humidity} %</p>
            <p>Wind: {latest.wind_ms} m/s</p>
            <p>Rain: {latest.rain_mm} mm</p>
          </div>
        )}

        {/* Hourly Chart */}
        {hourly.length > 0 && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-bold mb-2">Hourly Chart</h2>
            <Line
              key={hourly.length}
              data={{
                labels: hourly.map((h) => {
                  const date = new Date(h.timestamp);
                  return date.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                }),
                datasets: [
                  {
                    label: "Temp °C",
                    data: hourly.map((h) => h.temp_c),
                    borderColor: "red",
                    fill: false,
                  },
                  {
                    label: "Humidity %",
                    data: hourly.map((h) => h.humidity),
                    borderColor: "blue",
                    fill: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: { x: { type: "category" }, y: { beginAtZero: true } },
              }}
            />
          </div>
        )}

        {/* Daily Chart */}
        {daily.length > 0 && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Daily Summary</h2>
            <Bar
              key={daily.length}
              data={{
                labels: daily.map((d) => d.date),
                datasets: [
                  {
                    label: "Temp Max (°C)",
                    data: daily.map((d) => d.temp_max),
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                  },
                  {
                    label: "Temp Min (°C)",
                    data: daily.map((d) => d.temp_min),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                  },
                  {
                    label: "Rain (mm)",
                    data: daily.map((d) => d.rain_total_mm),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  x: {
                    type: "category",
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Value",
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
