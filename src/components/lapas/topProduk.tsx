import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Dummy data produk terlaris
const topProducts = [
  { name: "Ayam Kampung", sales: 85 },
  { name: "Apel Malang", sales: 72 },
  { name: "Pisang Cavendish", sales: 65 },
  { name: "Bayam Organik", sales: 58 },
  { name: "Mangga Arumanis", sales: 48 },
  { name: "Sapi Potong", sales: 35 },
];

const options: ApexOptions = {
  chart: { type: "bar", height: 380, fontFamily: "Inter, sans-serif", toolbar: { show: false } },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 10,
      barHeight: "70%",
    },
  },
  colors: ["#34d399"],
  dataLabels: {
    enabled: true,
    formatter: val => `${val} unit`,
    style: { fontSize: "14px", fontWeight: 600 },
  },
  xaxis: { categories: topProducts.map(p => p.name), axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { fontSize: "14px" } } },
  grid: { borderColor: "#e2e8f0", strokeDashArray: 6 },
  title: { text: "Produk Terlaris (Unit Terjual)", align: "center", style: { fontSize: "18px", fontWeight: 600 } },
  tooltip: { y: { formatter: val => `${val} unit terjual` } },
};

const series = [{ name: "Terjual", data: topProducts.map(p => p.sales) }];

export default function TopProductsChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      <Chart options={options} series={series} type="bar" height={380} />
    </div>
  );
}