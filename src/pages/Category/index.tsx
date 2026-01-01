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

interface Category {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

const dummyCategories: Category[] = [
  { id: "1", name: "Ternak", description: "Produk hewan ternak seperti sapi, ayam, kambing", status: "ACTIVE" },
  { id: "2", name: "Sayur", description: "Berbagai macam sayuran segar organik dan hidroponik", status: "ACTIVE" },
  { id: "3", name: "Buah", description: "Buah-buahan segar lokal dan impor", status: "ACTIVE" },
  { id: "4", name: "Telur", description: "Telur ayam kampung, bebek, dan puyuh", status: "INACTIVE" },
  { id: "5", name: "Ikan", description: "Ikan air tawar dan laut segar", status: "ACTIVE" },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setCategories(dummyCategories);
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi!");
      return;
    }

    const newCategory: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      status: editingCategory?.status || "ACTIVE",
    };

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? newCategory : c));
      toast.success("Kategori berhasil diperbarui");
    } else {
      setCategories([newCategory, ...categories]);
      toast.success("Kategori berhasil ditambahkan");
    }

    setIsEditDrawerOpen(false);
    resetForm();
  };

  const handleToggleStatus = (category: Category) => {
    const action = category.status === "ACTIVE" ? "nonaktifkan" : "aktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} kategori "${category.name}"?`)) return;

    setCategories(categories.map(c =>
      c.id === category.id
        ? { ...c, status: category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : c
    ));
    toast.success(`Kategori berhasil ${category.status === "ACTIVE" ? "dinonaktifkan" : "diaktifkan"}`);
  };

  // Filtering
  const filtered = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || cat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Kategori Produk
      </h1>

      {/* Filter & Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1">
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

          <div className="w-full lg:w-auto">
            <Label htmlFor="status">Status</Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <Label className="opacity-0">Tambah</Label>
            <button
              onClick={() => openEditDrawer()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition w-full lg:w-auto"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori
            </button>
          </div>
        </div>

        {(searchTerm || filterStatus) && (
          <button
            onClick={() => { setSearchTerm(""); setFilterStatus(""); }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      <ComponentCard title="Daftar Kategori">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin w-10 h-10 text-gray-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Nama Kategori</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Deskripsi</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Status</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((cat) => (
                    <tr key={cat.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-6 font-medium">{cat.name}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{cat.description || "-"}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          cat.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {cat.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditDrawer(cat)} title="Edit" className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition">
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          {cat.status === "ACTIVE" ? (
                            <button onClick={() => handleToggleStatus(cat)} title="Nonaktifkan" className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded transition">
                              <ToggleRight className="w-4 h-4 text-orange-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(cat)} title="Aktifkan" className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded transition">
                              <ToggleLeft className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <p className="text-center py-10 text-gray-500">
                  {searchTerm || filterStatus ? "Tidak ditemukan kategori." : "Belum ada kategori."}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded ${currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {page}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Edit / Add Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl h-full overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editingCategory ? "Edit" : "Tambah"} Kategori</h2>
              <button onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label htmlFor="cat-name">Nama Kategori</Label>
                <Input id="cat-name" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Ternak" required />
              </div>

              <div>
                <Label htmlFor="cat-desc">Deskripsi (Opsional)</Label>
                <textarea
                  id="cat-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Jelaskan isi kategori ini..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  Simpan
                </button>
                <button type="button" onClick={() => { setIsEditDrawerOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}