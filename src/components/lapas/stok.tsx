import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

export default function StockOverviewChart({ products }: any) {
  const stockData = products.slice(0, 15); // Tampilkan 15 produk pertama

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { 
      bar: { 
        columnWidth: "50%", 
        borderRadius: 4, 
        distributed: true,
        dataLabels: { position: 'top' }
      } 
    },
    colors: stockData.map((p: any) => 
      p.stock < 10 ? "#ef4444" : p.stock < 30 ? "#f59e0b" : "#10b981"
    ),
    xaxis: { 
      categories: stockData.map((p: any) => p.name),
      labels: { rotate: -45, style: { fontSize: '11px' } }
    },
    legend: { show: false },
    title: { text: "Status Stok Inventaris", style: { fontSize: "16px", fontWeight: 700 } }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-bold uppercase tracking-tighter">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Kritis (&lt;10)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm" /> Menipis (&lt;30)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm" /> Aman</div>
      </div>
      <Chart options={options} series={[{ name: "Stok", data: stockData.map((p: any) => p.stock) }]} type="bar" height={400} />
    </div>
  );
}