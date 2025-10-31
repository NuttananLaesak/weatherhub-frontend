import { Bar } from "react-chartjs-2";
import type { CompareChartProps } from "../../types/chart";

export const CompareChart = ({
  city1,
  city2,
  daily1,
  daily2,
  today,
}: CompareChartProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
      <div className="md:flex justify-between">
        <h2 className="text-xl font-semibold">Weather Comparison</h2>
        <h2 className="text-lg font-semibold mb-2 md:mb-10">{today}</h2>
      </div>
      <Bar
        data={{
          labels: ["Temp Max (°C)", "Temp Min (°C)", "Rain (mm)"],
          datasets: [
            {
              label: `${city1.name}`,
              data: [
                daily1[0]?.temp_max || 0,
                daily1[0]?.temp_min || 0,
                daily1[0]?.rain_total_mm || 0,
              ],
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
            {
              label: `${city2.name}`,
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
  );
};
