import type { Location } from "./location";
import type { DailyWeather, HourlyPerDay, HourlyWeather } from "./weather";

export type LineChartProps = {
  todayHourly: HourlyWeather[];
  selectedDayIndex: number;
  hourlyByDay: HourlyPerDay[];
  handleDayLineChartChange: (newIndex: number) => void;
};

export type BarChartProps = {
  daily: DailyWeather[];
  displayedDays: number;
  handleDayBarChartChange: (direction: "back" | "next") => void;
};

export type CompareChartProps = {
  city1: Location;
  city2: Location;
  daily1: DailyWeather[];
  daily2: DailyWeather[];
  today: string;
};
