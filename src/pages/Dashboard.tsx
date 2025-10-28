import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import Navbar from "../components/Navbar";
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

import type { RootState, AppDispatch } from "../store";
import { setSelectedLocation } from "../store/locationSelected";
// ChartJS register
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
import { HiOutlineMapPin } from "react-icons/hi2";

export default function Dashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const selectedLocation = useSelector(
    (state: RootState) => state.location.selectedLocation
  );
  const [latest, setLatest] = useState<LatestWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyWeather[]>([]);
  const [daily, setDaily] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(false); // 🔄 loading state

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get<Location[]>("/locations");
        setLocations(res.data);
      } catch (err) {
        console.error("Error fetching locations", err);
      }
    };
    fetchLocations();
  }, [dispatch, selectedLocation]);

  // Load weather when location changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedLocation) return;

      setLoading(true); // ⏳ Start loading

      try {
        const latestRes = await api.get<LatestWeather>(
          `/weather/latest?location_id=${selectedLocation.id}`
        );
        setLatest(latestRes.data);

        const today = new Date();

        const formatDate = (date: Date) => {
          const y = date.getFullYear();
          const m = `${date.getMonth() + 1}`.padStart(2, "0");
          const d = `${date.getDate()}`.padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfTomorrow = new Date(today);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        startOfTomorrow.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const hourlyRes = await api.get<HourlyWeather[]>(
          `/weather/hourly?location_id=${selectedLocation.id}&from=${formatDate(
            startOfToday
          )}&to=${formatDate(startOfTomorrow)}`
        );
        setHourly(hourlyRes.data);

        const dailyRes = await api.get<DailyWeather[]>(
          `/weather/daily?location_id=${selectedLocation.id}&from=${formatDate(
            sevenDaysAgo
          )}&to=${formatDate(today)}`
        );
        setDaily(dailyRes.data.reverse());
      } catch (err) {
        console.error("Error fetching weather", err);
      } finally {
        setLoading(false); // ✅ Done loading
      }
    };

    fetchWeather();
  }, [selectedLocation]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {/* 🔄 Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* City Selector */}
        <div className="mb-6">
          <label className="mr-2 font-semibold">Select City :</label>
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded"
            value={selectedLocation?.id || ""}
            onChange={(e) => {
              const loc =
                locations.find((loc) => loc.id === Number(e.target.value)) ||
                null;
              dispatch(setSelectedLocation(loc));
            }}
          >
            <option value="" disabled>
              -- Select City --
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* แสดงข้อมูลเฉพาะเมื่อเลือกเมืองแล้ว */}
        {selectedLocation ? (
          <>
            {/* Latest Weather */}
            {latest && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Latest Weather - {selectedLocation.name}
                </h2>
                <p>🌡️ Temp: {latest.temp_c} °C</p>
                <p>💧 Humidity: {latest.humidity} %</p>
                <p>💨 Wind: {latest.wind_ms} m/s</p>
                <p>🌧️ Rain: {latest.rain_mm} mm</p>
              </div>
            )}

            {/* Hourly Chart */}
            {hourly.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Hourly Chart</h2>
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
                        borderColor: "rgba(255, 99, 132, 1)",
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        tension: 0.3,
                      },
                      {
                        label: "Humidity %",
                        data: hourly.map((h) => h.humidity),
                        borderColor: "rgba(54, 162, 235, 1)",
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#fff",
                        },
                      },
                    },
                    scales: {
                      x: {
                        type: "category",
                        ticks: { color: "#ccc" },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: { color: "#ccc" },
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* Daily Chart */}
            {daily.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Daily Summary</h2>
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
                        labels: { color: "#fff" },
                      },
                    },
                    scales: {
                      x: {
                        type: "category",
                        ticks: { color: "#ccc" },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: { color: "#ccc" },
                      },
                    },
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="relative overflow-hidden rounded-lg p-8 bg-white dark:bg-gray-800 shadow-xl text-center">
            <div className="absolute inset-0 opacity-5 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none" />
            <div className="flex justify-center mb-4">
              <HiOutlineMapPin className="text-6xl text-green-600 dark:text-green-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              No city selected
            </h2>
            <p className="text-md text-gray-600 dark:text-gray-400">
              Please choose a city from the dropdown above to view the latest
              weather data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
