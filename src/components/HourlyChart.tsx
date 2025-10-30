import { Line } from "react-chartjs-2";
import type { HourlyPerDay, HourlyWeather } from "../types/weather";
import { PaginationButtons } from "./PaginationButtons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type LineChartProps = {
  todayHourly: HourlyWeather[];
  selectedDayIndex: number;
  hourlyByDay: HourlyPerDay[];
  handleDayLineChartChange: (newIndex: number) => void;
};

export const HourlyChart = ({
  todayHourly,
  selectedDayIndex,
  hourlyByDay,
  handleDayLineChartChange,
}: LineChartProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center gap-2 mb-3 md:mb-4">
        <div>
          <h2 className="text-xl font-semibold">Hourly Chart</h2>
          {hourlyByDay[selectedDayIndex].date.replace(/-/g, "/")}
        </div>
        <PaginationButtons
          onPrev={() =>
            handleDayLineChartChange(Math.max(selectedDayIndex - 1, 0))
          }
          onNext={() =>
            handleDayLineChartChange(
              Math.min(selectedDayIndex + 1, hourlyByDay.length - 1)
            )
          }
          disabledPrev={selectedDayIndex === 0}
          disabledNext={selectedDayIndex === hourlyByDay.length - 1}
        />
      </div>

      <Line
        key={todayHourly.length}
        data={{
          labels: todayHourly.map((h) =>
            new Date(h.timestamp).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          ),
          datasets: [
            {
              label: "Temp °C",
              data: todayHourly.map((h) => h.temp_c),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.3,
            },
            {
              label: "Humidity %",
              data: todayHourly.map((h) => h.humidity),
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
  );
};
