import PageMeta from "../../components/common/PageMeta";
import ProductCategoryChart from "../../components/lapas/category.";
import SalesMetrics from "../../components/lapas/Sales";
import StockOverviewChart from "../../components/lapas/stok";
import TopProductsChart from "../../components/lapas/topProduk";

export default function Home() {
  return (
    <>
      <PageMeta title="KIRAFARM" description="Sistem Manajemen Penjualan Produk Pertanian & Peternakan" />
      <div className="gap-4 md:gap-6 space-y-6">
        {/* Metrics */}
        <div className="col-span-12">
          <SalesMetrics />
        </div>

        {/* Top Produk & Kategori */}
        <div className="grid md:grid-cols-2 gap-6">
          <TopProductsChart />
          <ProductCategoryChart />
        </div>

        {/* Stok Overview */}
        <div className="col-span-12">
          <StockOverviewChart />
        </div>
      </div>
    </>
  );
}