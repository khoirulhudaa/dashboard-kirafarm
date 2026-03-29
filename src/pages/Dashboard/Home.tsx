import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import SalesMetrics from "../../components/lapas/Sales";
import StockOverviewChart from "../../components/lapas/stok";
import TopProductsChart from "../../components/lapas/topProduk";
import { Loader } from "lucide-react";
import ProductCategoryChart from "../../components/lapas/category.";

export default function Home() {
  const [data, setData] = useState({
    products: [],
    sales: [],
    categories: [],
    loading: true
  });

  // Ambil sellerId dari localStorage (asumsi disimpan saat login)
  const [sellerId, setSellerId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // Mengambil data user dari localStorage jika ada, atau bisa dari decode token
      const storedUser = localStorage.getItem("user");
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      const currentSellerId = userObj.seller.id || userObj?.sellerId || ""; 
      
      setSellerId(currentSellerId);

      const headers = { Authorization: `Bearer ${token}` };
      
      // Kita tambahkan query parameter ?sellerId agar filtering terjadi di level Database (Backend)
      // Ini jauh lebih efisien daripada filter di frontend
      const queryParam = currentSellerId ? `?sellerId=${currentSellerId}` : "";

      const [resProd, resSales, resCat] = await Promise.all([
        fetch(`https://be-kirafarm.kiraproject.id/api/products/my-products${queryParam}`, { headers }),
        fetch(`https://be-kirafarm.kiraproject.id/api/sales${queryParam}`, { headers }),
        fetch(`https://be-kirafarm.kiraproject.id/api/categories${queryParam}`, { headers })
      ]);

      const [prod, sales, cat] = await Promise.all([
        resProd.json(),
        resSales.json(),
        resCat.json()
      ]);

      setData({
        products: prod.data || [],
        sales: sales.data || [],
        categories: cat.data || [],
        loading: false
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Sinkronisasi Data Seller...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="KIRAFARM - Dashboard" description="Manajemen Produk & Penjualan" />
      <div className="space-y-6">
        
        {/* Row 1: Key Metrics (Mengirim sellerId sebagai props) */}
        <SalesMetrics 
          products={data.products} 
          sales={data.sales} 
          categories={data.categories}
          sellerId={sellerId} 
        />

        {/* Row 2: Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsChart 
            sales={data.sales} 
            sellerId={sellerId} 
          />
          <ProductCategoryChart 
            products={data.products} 
            categories={data.categories}
            sellerId={sellerId} 
          />
        </div>

        {/* Row 3: Inventory Status */}
        <div className="w-full">
          <StockOverviewChart 
            products={data.products} 
            sellerId={sellerId} 
          />
        </div>
      </div>
    </>
  );
}