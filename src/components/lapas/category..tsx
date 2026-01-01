import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Dummy data kategori
const categoryData = [
  { category: "Buah", total: 1120 },
  { category: "Sayur", total: 650 },
  { category: "Ternak", total: 420 },
];

const options: ApexOptions = {
  chart: { type: "donut", height: 380 },
  labels: categoryData.map(c => c.category),
  colors: ["#60a5fa", "#34d399", "#f87171"],
  dataLabels: { enabled: true, formatter: val => `${Math.round(Number(val))}%` },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total Stok",
            formatter: () => categoryData.reduce((a, b) => a + b.total, 0).toString(),
          },
        },
      },
    },
  },
  legend: { position: "bottom" },
  title: { text: "Distribusi Stok per Kategori", align: "center", style: { fontSize: "18px", fontWeight: 600 } },
};

const series = categoryData.map(c => c.total);

export default function ProductCategoryChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      <Chart options={options} series={series} type="donut" height={380} />
    </div>
  );
}