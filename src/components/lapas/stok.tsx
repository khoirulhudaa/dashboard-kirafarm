import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Dummy stok produk
const stockData = [
    { product: "Bayam Organik", stock: 100 },
  { product: "Sapi Potong", stock: 10 },
  { product: "Apel Malang", stock: 300 },
  { product: "Kambing Etawa", stock: 5 },
  { product: "Bebek Pedaging", stock: 30 },
  { product: "Pisang Cavendish", stock: 400 },
];

const options: ApexOptions = {
  chart: {
    type: "bar",
    height: 420,
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "60%",
      borderRadius: 4,
      dataLabels: { position: "top" },
      // Gunakan distributed: true + colors array untuk warna per bar
      distributed: true, // <--- KUNCI UTAMA!
    },
  },
  // Berikan array warna sesuai urutan data
  colors: stockData.map((d) =>
    d.stock < 20 ? "#f87171" : // Merah untuk stok < 20
    d.stock < 50 ? "#fbbf24" : // Kuning/orange untuk < 50
    "#34d399" // Hijau untuk aman
  ),
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val} unit`,
    offsetY: -20,
    style: { fontSize: "12px", colors: ["#304758"] },
  },
  xaxis: {
    categories: stockData.map((p) => p.product),
    labels: {
      rotate: -45,
      style: { fontSize: "13px" },
    },
  },
  yaxis: {
    title: { text: "Jumlah Stok" },
    min: 0,
  },
  grid: { borderColor: "#e2e8f0" },
  title: {
    text: "Overview Stok Produk Saat Ini",
    align: "center",
    style: { fontSize: "18px", fontWeight: 600 },
  },
  tooltip: {
    y: { formatter: (val) => `${val} unit tersisa` },
  },
  legend: { show: false },
};

const series = [
  {
    name: "Stok Tersisa",
    data: stockData.map((p) => p.stock),
  },
];

export default function StockOverviewChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span className="text-sm">Stok Rendah (&lt;20)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-400"></div>
          <span className="text-sm">Perlu Restock (&lt;50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span className="text-sm">Aman (≥50)</span>
        </div>
      </div>
      <Chart options={options} series={series} type="bar" height={420} />
    </div>
  );
}