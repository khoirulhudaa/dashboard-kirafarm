import { Package, ShoppingCart, Tag, TrendingUp } from "lucide-react";

// Data dummy
const totalProducts = 12;
const totalSalesToday = 7;
const totalRevenueToday = 4525000;
const activeCategories = 3;

export default function SalesMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Total Produk */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <Package className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Produk</span>
            <h4 className="mt-2 font-bold flex items-center text-black text-xl dark:text-white/90">
              {totalProducts}
              <small className="text-slate-500 text-sm font-normal ml-2">Jenis</small>
            </h4>
          </div>
        </div>
      </div>

      {/* Penjualan Hari Ini */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <ShoppingCart className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Transaksi Hari Ini</span>
            <h4 className="mt-2 font-bold flex items-center text-black text-xl dark:text-white/90">
              {totalSalesToday}
              <small className="text-slate-500 text-sm font-normal ml-2">Penjualan</small>
            </h4>
          </div>
        </div>
      </div>

      {/* Pendapatan Hari Ini */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-xl dark:bg-teal-900/30">
          <TrendingUp className="text-teal-600 size-6 dark:text-teal-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Pendapatan Hari Ini</span>
            <h4 className="mt-2 font-bold text-black text-xl dark:text-white/90">
              Rp {totalRevenueToday.toLocaleString("id-ID")}
            </h4>
          </div>
        </div>
      </div>

      {/* Kategori Aktif */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
          <Tag className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kategori Produk</span>
            <h4 className="mt-2 font-bold flex items-center text-black text-xl dark:text-white/90">
              {activeCategories}
              <small className="text-slate-500 text-sm font-normal ml-2">Kategori</small>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}