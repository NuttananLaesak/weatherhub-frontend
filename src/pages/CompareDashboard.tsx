import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import Navbar from "./Navbar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { Location } from "../types/location";
import type { DailyWeather } from "../types/weather";

import type { RootState, AppDispatch } from "../store";
import { setCity1, setCity2 } from "../store/compareSelected";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { LuScale } from "react-icons/lu";

export default function CompareDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { city1, city2 } = useSelector((state: RootState) => state.compare);
  const [daily1, setDaily1] = useState<DailyWeather[]>([]);
  const [daily2, setDaily2] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(false);

  const getTodayThaiDate = (): string => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    return local.toISOString().split("T")[0];
  };

  const today = getTodayThaiDate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get<Location[]>("/locations");
        setLocations(res.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, [dispatch, city1, city2]);

  useEffect(() => {
    const fetchDaily = async () => {
      if (!city1 || !city2) return;
      setLoading(true);

      try {
        const [d1, d2] = await Promise.all([
          api.get<DailyWeather[]>(
            `/weather/daily?location_id=${city1.id}&from=${today}&to=${today}`
          ),
          api.get<DailyWeather[]>(
            `/weather/daily?location_id=${city2.id}&from=${today}&to=${today}`
          ),
        ]);
        setDaily1(d1.data);
        setDaily2(d2.data);
      } catch (err) {
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [city1, city2, today]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Compare Mode</h1>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div>
            <label className="block font-semibold mb-1">City 1:</label>
            <select
              className="border dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-48"
              value={city1?.id || ""}
              onChange={(e) =>
                dispatch(
                  setCity1(
                    locations.find((l) => l.id === Number(e.target.value)) ||
                      null
                  )
                )
              }
            >
              {city1 ? null : (
                <option value="" disabled>
                  Select City
                </option>
              )}
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">City 2:</label>
            <select
              className="border dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-48"
              value={city2?.id || ""}
              onChange={(e) =>
                dispatch(
                  setCity2(
                    locations.find((l) => l.id === Number(e.target.value)) ||
                      null
                  )
                )
              }
            >
              {city2 ? null : (
                <option value="" disabled>
                  Select City
                </option>
              )}

              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* เช็คเงื่อนไขหากยังไม่ได้เลือกทั้ง City 1 และ City 2 */}
        {(!city1 || !city2) && (
          <div className="relative overflow-hidden rounded-lg p-8 bg-white dark:bg-gray-800 shadow-xl text-center">
            <div className="absolute inset-0 opacity-5 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none" />
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-bounce">
                <LuScale className="text-6xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              No city selected
            </h2>
            <p className="text-md text-gray-600 dark:text-gray-400">
              Please choose a city from the dropdown above to view the compare
              weather data.
            </p>
          </div>
        )}

        {/* แสดงกราฟเมื่อทั้ง City 1 และ City 2 ถูกเลือกแล้ว */}
        {!loading &&
          city1 &&
          city2 &&
          daily1.length > 0 &&
          daily2.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-5">
                Weather Comparison for {today}
              </h2>
              <Bar
                data={{
                  labels: ["Temp Max (°C)", "Temp Min (°C)", "Rain (mm)"],
                  datasets: [
                    {
                      label: `${city1?.name}`,
                      data: [
                        daily1[0]?.temp_max || 0,
                        daily1[0]?.temp_min || 0,
                        daily1[0]?.rain_total_mm || 0,
                      ],
                      backgroundColor: "rgba(255, 99, 132, 0.6)",
                    },
                    {
                      label: `${city2?.name}`,
                      data: [
                        daily2[0]?.temp_max || 0,
                        daily2[0]?.temp_min || 0,
                        daily2[0]?.rain_total_mm || 0,
                      ],
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
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
                      title: {
                        display: true,
                        color: "#ccc",
                      },
                      ticks: {
                        color: "#ccc",
                      },
                    },
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        color: "#ccc",
                      },
                      ticks: {
                        color: "#ccc",
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
