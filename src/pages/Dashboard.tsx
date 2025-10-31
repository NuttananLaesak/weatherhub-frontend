import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/layout/Navbar";
import { MiniSpinner } from "../components/loading/MiniSpinner";
import { NoCitySelected } from "../components/form/NoCitySelected";
import { HiOutlineMapPin } from "react-icons/hi2";
import Select, { type SingleValue, type GroupBase } from "react-select";
import { customSelectStyles } from "../styles/customSelectStyles";
import { weatherCodeMap } from "../utils/weatherCodeMap";
import { formatDate, formatTime } from "../utils/formatDateTime";
import { HourlyChart } from "../components/chart/HourlyChart";
import { DailyChart } from "../components/chart/DailyChart";
import { setSelectedLocation } from "../store/locationSelected";
import {
  getLocations,
  getLatestWeather,
  getHourlyWeather,
  getDailyWeather,
} from "../api/weatherApi";
import type {
  LatestWeather,
  DailyWeather,
  HourlyPerDay,
  WeatherDataResponse,
} from "../types/weather";
import type { Location } from "../types/location";
import type { RootState, AppDispatch } from "../store";
import type { OptionType } from "../types/selectOption";
import { FaCloudRain, FaWind } from "react-icons/fa";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedLocation = useSelector(
    (state: RootState) => state.location.selectedLocation
  );

  const [locations, setLocations] = useState<Location[]>([]);
  const [latest, setLatest] = useState<LatestWeather | null>(null);
  const [hourlyByDay, setHourlyByDay] = useState<HourlyPerDay[]>([]);
  const [daily, setDaily] = useState<DailyWeather[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false); // new state for loading latest weather
  const [loadingHourly, setLoadingHourly] = useState(false); // new state for loading hourly data
  const [loadingDaily, setLoadingDaily] = useState(false); // new state for loading daily data
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [displayedDays, setDisplayedDays] = useState(1);

  // Load locations
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
        console.error("Error fetching locations", err);
      }
    };
    fetchLocations();
  }, [dispatch, selectedLocation]);

  // Load weather data when location changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedLocation) return;

      // Check cache before making API calls
      const cachedWeather = localStorage.getItem(
        `weatherData-${selectedLocation.id}`
      );
      const cachedTime = localStorage.getItem(
        `weatherDataTime-${selectedLocation.id}`
      );
      const cachedDayIndex = localStorage.getItem(
        `weatherDataDayIndex-${selectedLocation.id}`
      );
      const cachedDisplayedDays = localStorage.getItem(
        `weatherDataDisplayedDays-${selectedLocation.id}`
      );
      // Cache expires in 60 seconds
      const currentTime = Date.now();
      const cacheExpired = cachedTime
        ? (currentTime - parseInt(cachedTime)) / 1000 > 60
        : true;

      if (cachedWeather && !cacheExpired) {
        // Use cached data if it exists and is not expired
        const { latest, hourlyByDay, daily }: WeatherDataResponse =
          JSON.parse(cachedWeather);
        setLatest(latest);
        setHourlyByDay(hourlyByDay);
        setDaily(daily);
        setSelectedDayIndex(
          cachedDayIndex ? parseInt(cachedDayIndex) : hourlyByDay.length - 1
        );
        setDisplayedDays(
          cachedDisplayedDays ? parseInt(cachedDisplayedDays) : 1
        );
        return;
      }

      try {
        // Load Latest Weather
        setLoadingLatest(true);
        setLoadingHourly(true);
        setLoadingDaily(true);
        const latestRes = await getLatestWeather(selectedLocation.id);
        setLatest(latestRes.data);
        setLoadingLatest(false);

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const dailyHourlyData: HourlyPerDay[] = [];

        for (let d = 0; d < 7; d++) {
          const day = new Date(sevenDaysAgo);
          day.setDate(sevenDaysAgo.getDate() + d);

          const start = new Date(day);
          start.setHours(0, 0, 0, 0);
          const end = new Date(day);
          end.setHours(23, 0, 0, 0);

          // Load Hourly Weather
          const hourlyRes = await getHourlyWeather(
            selectedLocation.id,
            formatTime(start),
            formatTime(end)
          );

          dailyHourlyData.push({
            date: formatDate(day),
            hours: hourlyRes.data,
          });
        }
        setLoadingHourly(false);

        setHourlyByDay(dailyHourlyData);
        setSelectedDayIndex(dailyHourlyData.length - 1);

        // Load Diarly Weather
        const dailyRes = await getDailyWeather(
          selectedLocation.id,
          formatDate(sevenDaysAgo),
          formatDate(today)
        );
        setDaily(dailyRes.data);
        setLoadingDaily(false);

        // Cache weather data
        const weatherData: WeatherDataResponse = {
          latest: latestRes.data,
          hourlyByDay: dailyHourlyData,
          daily: dailyRes.data.reverse(),
        };

        localStorage.setItem(
          `weatherData-${selectedLocation.id}`,
          JSON.stringify(weatherData)
        );
        localStorage.setItem(
          `weatherDataTime-${selectedLocation.id}`,
          currentTime.toString()
        );
        localStorage.setItem(
          `weatherDataDayIndex-${selectedLocation.id}`,
          (dailyHourlyData.length - 1).toString()
        );
        localStorage.setItem(
          `weatherDataDisplayedDays-${selectedLocation.id}`,
          displayedDays.toString()
        );
      } catch (err) {
        console.error("Error fetching weather", err);
      }
    };

    fetchWeather();
  }, [selectedLocation, displayedDays]);

  // Change selected day for Hourly Chart
  const handleDayLineChartChange = (newIndex: number) => {
    setSelectedDayIndex(newIndex);
    if (selectedLocation) {
      localStorage.setItem(
        `weatherDataDayIndex-${selectedLocation.id}`,
        newIndex.toString()
      );
    }
  };

  // Change displayed days for Daily Chart
  const handleDayBarChartChange = (direction: "back" | "next") => {
    setDisplayedDays((prev) => {
      let newDisplayedDays = prev;
      if (direction === "next" && prev > 1) {
        newDisplayedDays = prev - 1;
      } else if (direction === "back" && prev < 7) {
        newDisplayedDays = prev + 1;
      }

      if (selectedLocation) {
        localStorage.setItem(
          `weatherDataDisplayedDays-${selectedLocation.id}`,
          newDisplayedDays.toString()
        );
      }

      return newDisplayedDays;
    });
  };

  // Prepare options for React Select
  const cityOptions: OptionType[] = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  const todayHourly = hourlyByDay[selectedDayIndex]?.hours || [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* City Selector */}
        <div className="mb-6 flex items-center space-x-2">
          <label className="font-semibold">Select City :</label>
          <div className="w-auto">
            <Select<OptionType, false, GroupBase<OptionType>>
              options={cityOptions}
              value={
                selectedLocation
                  ? { value: selectedLocation.id, label: selectedLocation.name }
                  : null
              }
              onChange={(option: SingleValue<OptionType>) => {
                if (!option) {
                  dispatch(setSelectedLocation(null));
                  return;
                }
                const loc =
                  locations.find((l) => l.id === option.value) || null;
                dispatch(setSelectedLocation(loc));
              }}
              isClearable
              placeholder="-- Select City --"
              styles={customSelectStyles}
            />
          </div>
        </div>

        {/* Show data only when a city is selected */}
        {selectedLocation ? (
          <>
            {/* Latest Weather */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              {loadingLatest ? (
                <MiniSpinner />
              ) : (
                latest && (
                  <>
                    <div className="lg:flex justify-between mb-3">
                      <h2 className="text-xl font-semibold">
                        Latest Weather - {selectedLocation.name}
                      </h2>
                      <h2 className="text-md font-semibold">
                        {latest.timestamp.slice(0, 10).replace(/-/g, "/")} -{" "}
                        {latest.timestamp.slice(11, 16)}
                      </h2>
                    </div>
                    <p>🌡️ Temp: {latest.temp_c} °C</p>
                    <p>💨 Wind Speed: {latest.wind_ms} m/s</p>
                    <p className="flex items-center gap-2">
                      <FaWind /> Wind Direction : {latest.wind_direction} °
                    </p>
                    <p className="flex items-center gap-2">
                      <FaCloudRain /> Condition :{" "}
                      {weatherCodeMap[latest.weather_code]}
                    </p>
                  </>
                )
              )}
            </div>

            {/* Hourly Chart */}
            {loadingHourly ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <MiniSpinner />
              </div>
            ) : (
              todayHourly.length > 0 && (
                <HourlyChart
                  todayHourly={todayHourly}
                  selectedDayIndex={selectedDayIndex}
                  hourlyByDay={hourlyByDay}
                  handleDayLineChartChange={handleDayLineChartChange}
                />
              )
            )}

            {/* Daily Chart */}
            {loadingDaily ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <MiniSpinner />
              </div>
            ) : (
              daily.length > 0 && (
                <DailyChart
                  daily={daily}
                  displayedDays={displayedDays}
                  handleDayBarChartChange={handleDayBarChartChange}
                />
              )
            )}
          </>
        ) : (
          // Show No City Selected Page
          <NoCitySelected
            icon={
              <HiOutlineMapPin className="text-6xl text-green-600 dark:text-green-400 animate-bounce" />
            }
            title="No City Selected"
            message="Please choose a city from the dropdown above to view the latest weather data."
          />
        )}
      </div>
    </div>
  );
}
