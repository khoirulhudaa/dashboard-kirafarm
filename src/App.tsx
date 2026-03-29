import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Blank from "./pages/Blank";
import CategoryManagement from "./pages/Category";
import CustomerManagement from "./pages/Customer";
import Home from "./pages/Dashboard/Home";
import EmployeeManagement from "./pages/Employee";
import NotFound from "./pages/OtherPage/NotFound";
import ProductManagement from "./pages/Product";
import SalesReport from "./pages/Sales";
import StockOpnamePage from "./pages/Stok";
import SalesManagement from "./pages/Transcation";
import UnitManagement from "./pages/Unit";
import UserProfiles from "./pages/UserProfiles";
import WithdrawalManagement from "./pages/withdrawl";

// 1. Inisialisasi QueryClient di luar komponen
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ini setting global jika ingin semua query punya behavior yang sama
      staleTime: 5 * 60 * 1000, 
    },
  },
});

export default function App() {
  return (  
    <QueryClientProvider client={queryClient}>
      <>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/" element={<Home />} />
              <Route path="/manajemen-produk" element={<ProductManagement />} />
              <Route path="/manajemen-kategori" element={<CategoryManagement />} />
              <Route path="/manajemen-satuan" element={<UnitManagement />} />
              <Route path="/penjualan" element={<SalesManagement />} />
              <Route path="/pemintaan-pencairan-dana" element={<WithdrawalManagement />} />
              <Route path="/manajemen-pegawai" element={<EmployeeManagement />} />
              <Route path="/pelanggan" element={<CustomerManagement />} />
              <Route path="/stok-opname" element={<StockOpnamePage />} />
              <Route path="/laporan" element={<SalesReport />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/blank" element={<Blank />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </>
    </QueryClientProvider>
  );
}
