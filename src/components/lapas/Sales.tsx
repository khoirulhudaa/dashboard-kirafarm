import { Package, ShoppingCart, Tag, TrendingUp } from "lucide-react";

export default function SalesMetrics({ products, sales, categories }: any) {
  const today = new Date().toISOString().split('T')[0];
  
  // Filter transaksi hari ini yang tidak dibatalkan
  const salesToday = sales.filter((s: any) => 
    s.createdAt.startsWith(today) && s.status !== 'CANCELLED'
  );

  const revenueToday = salesToday.reduce((acc: number, curr: any) => 
    acc + Number(curr.totalAmount || 0), 0
  );

  const metrics = [
    { title: "Total Produk", value: products.length, unit: "Jenis", icon: <Package />, color: "bg-blue-100 text-blue-600", dark: "dark:bg-blue-900/30 dark:text-blue-400" },
    { title: "Transaksi Hari Ini", value: salesToday.length, unit: "Penjualan", icon: <ShoppingCart />, color: "bg-green-100 text-green-600", dark: "dark:bg-green-900/30 dark:text-green-400" },
    { title: "Pendapatan Hari Ini", value: `Rp ${revenueToday.toLocaleString("id-ID")}`, unit: "", icon: <TrendingUp />, color: "bg-teal-100 text-teal-600", dark: "dark:bg-teal-900/30 dark:text-teal-400" },
    { title: "Kategori Produk", value: categories.length, unit: "Kategori", icon: <Tag />, color: "bg-purple-100 text-purple-600", dark: "dark:bg-purple-900/30 dark:text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((m, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm transition-hover hover:shadow-md">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${m.color} ${m.dark}`}>
            {m.icon}
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">{m.title}</span>
            <h4 className="mt-2 font-bold text-black text-xl dark:text-white/90 flex items-baseline gap-1">
              {m.value}
              {m.unit && <small className="text-xs font-normal text-gray-400 uppercase tracking-wider">{m.unit}</small>}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}