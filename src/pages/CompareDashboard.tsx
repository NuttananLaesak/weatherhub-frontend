import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar";
import { LuScale } from "react-icons/lu";
import Select, { type SingleValue, type GroupBase } from "react-select";
import { customSelectStyles } from "../styles/customSelectStyles";
import { CompareChart } from "../components/chart/CompareChart";
import { NoCitySelected } from "../components/form/NoCitySelected";
import { Spinner } from "../components/loading/Spinner";
import { getLocations, getDailyWeather } from "../api/weatherApi";
import { setCity1, setCity2 } from "../store/compareSelected";
import type { Location } from "../types/location";
import type { DailyWeather } from "../types/weather";
import type { RootState, AppDispatch } from "../store";
import type { OptionType } from "../types/selectOption";

export default function CompareDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { city1, city2 } = useSelector((state: RootState) => state.compare);
  const [daily1, setDaily1] = useState<DailyWeather[]>([]);
  const [daily2, setDaily2] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to get today's date in Thai format
  const getTodayThaiDate = (): string => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    return local.toISOString().split("T")[0];
  };

  const today = getTodayThaiDate();

  // Fetch locations when component mounts or city1/city2 change
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getLocations();
        setLocations(
          res.data
            .filter((location: Location) => location.active === 1)
            .reverse()
        );
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, [dispatch, city1, city2]);

  // Fetch daily weather data for both cities
  useEffect(() => {
    const fetchDaily = async () => {
      if (!city1 || !city2) return;
      setLoading(true);

      const cachedData1 = localStorage.getItem(
        `dailyWeather-${city1.id}-${today}`
      );
      const cachedData2 = localStorage.getItem(
        `dailyWeather-${city2.id}-${today}`
      );
      const cachedTime1 = localStorage.getItem(
        `dailyWeatherTime-${city1.id}-${today}`
      );
      const cachedTime2 = localStorage.getItem(
        `dailyWeatherTime-${city2.id}-${today}`
      );

      const currentTime = Date.now();
      const cacheExpired =
        (cachedTime1 && (currentTime - parseInt(cachedTime1)) / 1000 > 60) ||
        (cachedTime2 && (currentTime - parseInt(cachedTime2)) / 1000 > 60);

      // Use cached data if not expired
      if (cachedData1 && cachedData2 && !cacheExpired) {
        const { daily: cachedDaily1 }: { daily: DailyWeather[] } =
          JSON.parse(cachedData1);
        const { daily: cachedDaily2 }: { daily: DailyWeather[] } =
          JSON.parse(cachedData2);
        setDaily1(cachedDaily1);
        setDaily2(cachedDaily2);
        setLoading(false);
        return;
      }

      try {
        const [d1, d2] = await Promise.all([
          getDailyWeather(city1.id, today, today),
          getDailyWeather(city2.id, today, today),
        ]);
        setDaily1(d1.data);
        setDaily2(d2.data);

        // Cache the fetched data
        localStorage.setItem(
          `dailyWeather-${city1.id}-${today}`,
          JSON.stringify({ daily: d1.data })
        );
        localStorage.setItem(
          `dailyWeatherTime-${city1.id}-${today}`,
          currentTime.toString()
        );
        localStorage.setItem(
          `dailyWeather-${city2.id}-${today}`,
          JSON.stringify({ daily: d2.data })
        );
        localStorage.setItem(
          `dailyWeatherTime-${city2.id}-${today}`,
          currentTime.toString()
        );
      } catch (err) {
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [city1, city2, today]);

  // Map locations to options for the Select dropdown
  const cityOptions: OptionType[] = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {loading && <Spinner />}

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Compare Mode</h1>

        <div className="flex flex-wrap gap-8 items-center mb-6">
          {/* City 1 Dropdown */}
          <div className="w-48">
            <label className="block font-semibold mb-1">City 1:</label>
            <Select<OptionType, false, GroupBase<OptionType>>
              options={cityOptions}
              value={city1 ? { value: city1.id, label: city1.name } : null}
              onChange={(option: SingleValue<OptionType>) => {
                if (!option) return dispatch(setCity1(null));
                const loc =
                  locations.find((l) => l.id === option.value) || null;
                dispatch(setCity1(loc));
              }}
              isClearable
              placeholder="-- Select City --"
              styles={customSelectStyles}
            />
          </div>

          {/* City 2 Dropdown */}
          <div className="w-48">
            <label className="block font-semibold mb-1">City 2:</label>
            <Select<OptionType, false, GroupBase<OptionType>>
              options={cityOptions}
              value={city2 ? { value: city2.id, label: city2.name } : null}
              onChange={(option: SingleValue<OptionType>) => {
                if (!option) return dispatch(setCity2(null));
                const loc =
                  locations.find((l) => l.id === option.value) || null;
                dispatch(setCity2(loc));
              }}
              isClearable
              placeholder="-- Select City --"
              styles={customSelectStyles}
            />
          </div>
        </div>

        {/* Show message if no city selected */}
        {(!city1 || !city2) && (
          <NoCitySelected
            icon={
              <LuScale className="text-6xl text-blue-600 dark:text-blue-400 animate-bounce" />
            }
            title="No City Selected"
            message="Please choose cities from the dropdown above to view the Comparison."
          />
        )}

        {/* Show comparison chart if both cities are selected */}
        {!loading &&
          city1 &&
          city2 &&
          daily1.length > 0 &&
          daily2.length > 0 && (
            <CompareChart
              city1={city1}
              city2={city2}
              daily1={daily1}
              daily2={daily2}
              today={today}
            />
          )}
      </div>
    </div>
  );
}
