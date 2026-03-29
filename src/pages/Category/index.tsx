import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

// URL API Backend
const API_URL = "https://be-kirafarm.kiraproject.id/api/categories";

interface Category {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // --- API INTEGRATION ---

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const savedUserStr = localStorage.getItem("user");
      
      // Default URL
      let fetchUrl = API_URL;

      // Jika user ada, tambahkan sellerId ke params
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        // Jika user adalah SELLER, maka filter kategori berdasarkan ID-nya
        if (savedUser.seller?.id) {
          fetchUrl = `${API_URL}?sellerId=${savedUser.seller.id}`;
        } else if (savedUser.id) {
          // Fallback jika seller object tidak ada tapi ada user ID
          fetchUrl = `${API_URL}?sellerId=${savedUser.id}`;
        }
      }

      const res = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        toast.error(result.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama kategori wajib diisi!");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Ambil sellerId dari data user di localStorage
      const savedUserStr = localStorage.getItem("user");
      let sId = null;
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        // Gunakan pola yang sama dengan fetch: cek seller.id atau id user-nya
        sId = savedUser.seller?.id || savedUser.sellerId || savedUser.id;
      }

      const url = editingCategory ? `${API_URL}/${editingCategory.id}` : API_URL;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Sertakan sellerId di dalam body request
        body: JSON.stringify({ 
          name, 
          description,
          sellerId: sId // <--- Tambahkan ini
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        fetchCategories(); 
        setIsEditDrawerOpen(false);
        resetForm();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    const action = category.status === "ACTIVE" ? "nonaktifkan" : "aktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} kategori "${category.name}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      // Menggunakan rute update atau softDelete sesuai backend kamu
      // Jika menonaktifkan, gunakan rute patch/deactivate
      const url = category.status === "ACTIVE" 
        ? `${API_URL}/${category.id}/deactivate` 
        : `${API_URL}/${category.id}`;
      
      const method = category.status === "ACTIVE" ? "PATCH" : "PUT";
      const body = category.status === "INACTIVE" ? JSON.stringify({ status: "ACTIVE" }) : null;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
  };

  // --- UI LOGIC ---

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
  };

  const openEditDrawer = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description);
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const filtered = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || cat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Kategori Produk
      </h1>

      {/* Filter & Search */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label htmlFor="search">Cari Kategori</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari nama kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
          <Label htmlFor="status">Status</Label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
          </select>
        </div>

        <button
          onClick={() => openEditDrawer()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      {/* Table Section */}
      <ComponentCard title="Daftar Kategori">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin w-10 h-10 text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Nama Kategori</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Deskripsi</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {currentData.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 max-w-xs truncate">{cat.description || "-"}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          cat.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {cat.status === "ACTIVE" ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => openEditDrawer(cat)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleToggleStatus(cat)} className={`p-2 rounded-lg transition ${
                            cat.status === "ACTIVE" ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"
                          }`}>
                            {cat.status === "ACTIVE" ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 dark:text-gray-400 italic">Data kategori tidak ditemukan.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-full border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium">Halaman {currentPage} dari {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-full border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Drawer Overlay */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999999] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col animate-slide-left">
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>
              <button onClick={() => setIsEditDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                <div>
                  <Label htmlFor="cat-name">Nama Kategori</Label>
                  <Input 
                    id="cat-name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Masukkan nama kategori..." 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="cat-desc">Deskripsi</Label>
                  <textarea
                    id="cat-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Tulis deskripsi singkat..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader className="animate-spin w-4 h-4" />}
                  {editingCategory ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}