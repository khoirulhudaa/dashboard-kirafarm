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

const API_UNIT_URL = "https://be-kirafarm.kiraproject.id/api/units";

interface Unit {
  id: string;
  name: string;
  fullName: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form States
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");

  // --- API Handlers ---

 const fetchUnits = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const savedUserStr = localStorage.getItem("user");
    
    // Default URL
    let fetchUrl = API_UNIT_URL;

    // Jika ada data user di localStorage, tambahkan sellerId ke params
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      const sId = savedUser.seller?.id || savedUser.sellerId;
      
      if (sId) {
        fetchUrl = `${API_UNIT_URL}?sellerId=${sId}`;
      }
    }

    const res = await fetch(fetchUrl, {
      headers: {
        "Authorization": `Bearer ${token}`, // Tambahkan token jika API membutuhkan auth
      },
    });
    
    const json = await res.json();
    if (json.success) {
      setUnits(json.data);
    }
  } catch (error) {
    toast.error("Gagal mengambil data dari server");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullName.trim()) {
      toast.error("Nama singkat dan nama lengkap wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const sId = savedUser.seller?.id || savedUser.sellerId;

      const url = editingUnit ? `${API_UNIT_URL}/${editingUnit.id}` : API_UNIT_URL;
      const method = editingUnit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          fullName: fullName.trim(),
          description: description.trim(),
          sellerId: sId, // <--- Kirim sellerId ke backend
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsEditDrawerOpen(false);
        fetchUnits(); // Refresh data
        resetForm();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (unit: Unit) => {
    const isActivating = unit.status === "INACTIVE";
    const confirmMsg = isActivating 
      ? `Aktifkan kembali satuan "${unit.name}"?` 
      : `Nonaktifkan satuan "${unit.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("accessToken");
      
      // Jika menonaktifkan, gunakan endpoint PATCH softDelete dari backend
      // Jika mengaktifkan kembali, gunakan endpoint PUT update status
      const url = isActivating 
        ? `${API_UNIT_URL}/${unit.id}` 
        : `${API_UNIT_URL}/${unit.id}/deactivate`;
      
      const method = isActivating ? "PUT" : "PATCH";
      const body = isActivating ? JSON.stringify({ status: "ACTIVE" }) : null;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: body,
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchUnits();
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status satuan");
    }
  };

  // --- UI Helpers ---

  const resetForm = () => {
    setName("");
    setFullName("");
    setDescription("");
    setEditingUnit(null);
  };

  const openEditDrawer = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setName(unit.name);
      setFullName(unit.fullName);
      setDescription(unit.description || "");
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const filtered = units.filter(u => {
    const matches = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = !filterStatus || u.status === filterStatus;
    return matches && statusMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Manajemen Satuan Stok
        </h1>
        <button
          onClick={() => openEditDrawer()}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Tambah Satuan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label>Cari Satuan</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Cari nama atau singkatan..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <ComponentCard title={`Total Satuan (${filtered.length})`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="animate-spin w-10 h-10 text-blue-600" />
            <p className="text-gray-500 animate-pulse">Sinkronisasi server...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="py-4 px-6 uppercase text-xs font-bold text-gray-500">Singkatan</th>
                  <th className="py-4 px-6 uppercase text-xs font-bold text-gray-500">Nama Lengkap</th>
                  <th className="py-4 px-6 uppercase text-xs font-bold text-gray-500">Deskripsi</th>
                  <th className="py-4 px-6 uppercase text-xs font-bold text-gray-500">Status</th>
                  <th className="py-4 px-6 uppercase text-xs font-bold text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentData.map(unit => (
                  <tr key={unit.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">{unit.name}</td>
                    <td className="py-4 px-6 dark:text-gray-300">{unit.fullName}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm max-w-xs truncate">{unit.description || "-"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        unit.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {unit.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEditDrawer(unit)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(unit)} 
                          className={`p-2 rounded-lg transition ${unit.status === "ACTIVE" ? "text-orange-500 hover:bg-orange-100" : "text-green-500 hover:bg-green-100"}`}
                          title={unit.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {unit.status === "ACTIVE" ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">Data tidak ditemukan.</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-6 border-t dark:border-gray-700">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </ComponentCard>

      {/* Drawer Form */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl animate-slide-left">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h2 className="text-xl font-bold dark:text-white">
                {editingUnit ? "Update Satuan" : "Tambah Satuan Baru"}
              </h2>
              <button onClick={() => setIsEditDrawerOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <Label htmlFor="unit-name">Singkatan Satuan</Label>
                <Input 
                  id="unit-name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Contoh: kg, ekor, box" 
                  className="mt-1"
                  required 
                />
                <p className="text-[10px] text-gray-400 mt-1">* Singkatan ini akan muncul pada label stok produk.</p>
              </div>

              <div>
                <Label htmlFor="unit-full">Nama Lengkap</Label>
                <Input 
                  id="unit-full" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="Contoh: Kilogram" 
                  className="mt-1"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="unit-desc">Deskripsi (Opsional)</Label>
                <textarea
                  id="unit-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  placeholder="Berikan penjelasan singkat penggunaan satuan ini..."
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                >
                  {isSubmitting && <Loader className="animate-spin w-5 h-5" />}
                  {isSubmitting ? "Menyimpan..." : "Simpan Satuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}