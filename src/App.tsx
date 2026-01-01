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
import SalesManagement from "./pages/Transcation";
import UnitManagement from "./pages/Unit";
import UserProfiles from "./pages/UserProfiles";

export default function App() {
  return (
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
            <Route path="/manajemen-pegawai" element={<EmployeeManagement />} />
            <Route path="/pelanggan" element={<CustomerManagement />} />
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
  );
}
