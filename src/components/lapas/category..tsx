import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

export default function ProductCategoryChart({ products, categories }: any) {
  // Hitung jumlah produk per kategori
  const stats = categories.map((cat: any) => {
    const count = products.filter((p: any) => p.categoryId === cat.id).length;
    return { name: cat.name, count };
  }).filter((c: any) => c.count > 0);

  const options: ApexOptions = {
    labels: stats.map((s: any) => s.name),
    colors: ["#60a5fa", "#34d399", "#f87171", "#fbbf24", "#8b5cf6"],
    legend: { position: "bottom" },
    title: { text: "Distribusi Produk per Kategori", style: { fontSize: "16px", fontWeight: 700 } },
    plotOptions: { pie: { donut: { size: '75%' } } }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <Chart options={options} series={stats.map((s: any) => s.count)} type="donut" height={350} />
    </div>
  );
}