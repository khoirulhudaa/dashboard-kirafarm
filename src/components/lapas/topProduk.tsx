import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

export default function TopProductsChart({ sales }: any) {
  // Hitung agregasi penjualan per produk dari SaleItems
  const productSales: Record<string, number> = {};
  
  sales.forEach((sale: any) => {
    if (sale.status === 'CANCELLED') return;
    sale.items?.forEach((item: any) => {
      const name = item.Product?.name || "Produk Dihapus";
      productSales[name] = (productSales[name] || 0) + Number(item.quantity);
    });
  });

  const sorted = Object.entries(productSales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: "60%" } },
    colors: ["#34d399"],
    dataLabels: { enabled: true, formatter: (v) => `${v} unit` },
    xaxis: { categories: sorted.map(d => d.name) },
    title: { text: "Produk Terlaris", style: { fontSize: "16px", fontWeight: 700 } },
    grid: { strokeDashArray: 4 }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <Chart options={options} series={[{ name: "Terjual", data: sorted.map(d => d.qty) }]} type="bar" height={350} />
    </div>
  );
}