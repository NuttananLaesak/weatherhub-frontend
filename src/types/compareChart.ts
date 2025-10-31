import type { Location } from "./location";
import type { DailyWeather } from "./weather";

export type CompareChartProps = {
  city1: Location;
  city2: Location;
  daily1: DailyWeather[];
  daily2: DailyWeather[];
  today: string;
};
