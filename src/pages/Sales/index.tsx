import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Data Pendapatan 2026 (sesuai tanggal sekarang: Jan 2026)
const monthlyData2026 = [
  { month: "Jan 2026", revenue: 9200000 },
  { month: "Feb 2026", revenue: 10800000 },
  { month: "Mar 2026", revenue: 11500000 },
  { month: "Apr 2026", revenue: 13200000 },
  { month: "Mei 2026", revenue: 12800000 },
  { month: "Jun 2026", revenue: 14500000 },
  { month: "Jul 2026", revenue: 15800000 },
  { month: "Ags 2026", revenue: 17200000 },
  { month: "Sep 2026", revenue: 16500000 },
  { month: "Okt 2026", revenue: 18000000 },
  { month: "Nov 2026", revenue: 19500000 },
  { month: "Des 2026", revenue: 21000000 },
];

const options: ApexOptions = {
  chart: {
    type: "area",
    height: 420,
    toolbar: { show: true },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: monthlyData2026.map((d) => d.month),
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (val) => `Rp ${(val / 1000000).toFixed(1)}Jt`,
    },
  },
  colors: ["#10b981"],
  title: {
    text: "Tren Pendapatan Penjualan Tahun 2026",
    align: "center",
    style: { fontSize: "20px", fontWeight: 600, color: "#1f2937" },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  grid: {
    borderColor: "#e2e8f0",
    strokeDashArray: 5,
  },
  tooltip: {
    y: {
      formatter: (val) => `Rp ${val.toLocaleString("id-ID")}`,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100],
    },
  },
};

const series = [
  {
    name: "Pendapatan",
    data: monthlyData2026.map((d) => d.revenue),
  },
];

export default function SalesReport() {
  const totalRevenue = monthlyData2026.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = 428;
  const averagePerTransaction = Math.round(totalRevenue / totalTransactions);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Laporan Penjualan Tahun 2026
      </h1>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
          <p className="text-blue-100 text-sm">Total Pendapatan Tahunan</p>
          <p className="text-2xl font-bold mt-3">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg">
          <p className="text-green-100 text-sm">Jumlah Transaksi</p>
          <p className="text-2xl font-bold mt-3">{totalTransactions}</p>
        </div>

        <div className="p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg">
          <p className="text-purple-100 text-sm">Rata-rata per Transaksi</p>
          <p className="text-2xl font-bold mt-3">
            Rp {averagePerTransaction.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Grafik */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <Chart options={options} series={series} type="area" height={420} />
      </div>
    </div>
  );
}