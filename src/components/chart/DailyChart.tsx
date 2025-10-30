import { Bar } from "react-chartjs-2";
import { PaginationButtons } from "../button/PaginationButtons";
import type { DailyWeather } from "../../types/weather";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChartProps = {
  daily: DailyWeather[];
  displayedDays: number;
  handleDayBarChartChange: (direction: "back" | "next") => void;
};

export const DailyChart = ({
  daily,
  displayedDays,
  handleDayBarChartChange,
}: BarChartProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center gap-2 mb-3 md:mb-4">
        <div>
          <h2 className="text-xl font-semibold">Daily Summary</h2>
        </div>

        <PaginationButtons
          onPrev={() => handleDayBarChartChange("back")}
          onNext={() => handleDayBarChartChange("next")}
          disabledPrev={displayedDays === 7}
          disabledNext={displayedDays === 1}
        />
      </div>
      <Bar
        key={displayedDays} // เพิ่ม key ตาม displayedDays
        data={{
          labels: daily.slice(0, displayedDays).map((d) => d.date), // แสดงข้อมูลตามจำนวนวันที่เลือก
          datasets: [
            {
              label: "Temp Max (°C)",
              data: daily.slice(0, displayedDays).map((d) => d.temp_max),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
            {
              label: "Temp Min (°C)",
              data: daily.slice(0, displayedDays).map((d) => d.temp_min),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
            {
              label: "Rain (mm)",
              data: daily.slice(0, displayedDays).map((d) => d.rain_total_mm),
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
  );
};
