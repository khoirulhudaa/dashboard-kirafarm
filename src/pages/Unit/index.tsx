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

interface Unit {
  id: string;
  name: string;        // e.g. "kg"
  fullName: string;    // e.g. "Kilogram"
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

const dummyUnits: Unit[] = [
  { id: "1", name: "kg", fullName: "Kilogram", description: "Satuan berat standar untuk sayur dan buah", status: "ACTIVE" },
  { id: "2", name: "ekor", fullName: "Ekor", description: "Untuk menghitung hewan ternak utuh", status: "ACTIVE" },
  { id: "3", name: "lusin", fullName: "Lusin", description: "12 buah (biasa untuk telur)", status: "ACTIVE" },
  { id: "4", name: "pack", fullName: "Pak", description: "Kemasan kecil (misal 500gr)", status: "ACTIVE" },
  { id: "5", name: "liter", fullName: "Liter", description: "Untuk susu atau produk cair", status: "INACTIVE" },
  { id: "6", name: "gram", fullName: "Gram", description: "Satuan kecil untuk bumbu/rempah", status: "ACTIVE" },
];

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setUnits(dummyUnits);
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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
      setDescription(unit.description);
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullName.trim()) {
      toast.error("Nama singkat dan nama lengkap wajib diisi!");
      return;
    }

    const newUnit: Unit = {
      id: editingUnit?.id || Date.now().toString(),
      name: name.trim().toLowerCase(),
      fullName: fullName.trim(),
      description: description.trim(),
      status: editingUnit?.status || "ACTIVE",
    };

    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? newUnit : u));
      toast.success("Satuan berhasil diperbarui");
    } else {
      setUnits([newUnit, ...units]);
      toast.success("Satuan berhasil ditambahkan");
    }

    setIsEditDrawerOpen(false);
    resetForm();
  };

  const handleToggleStatus = (unit: Unit) => {
    const action = unit.status === "ACTIVE" ? "nonaktifkan" : "aktifkan";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} satuan "${unit.name}"?`)) return;

    setUnits(units.map(u =>
      u.id === unit.id
        ? { ...u, status: unit.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : u
    ));
    toast.success(`Satuan berhasil ${unit.status === "ACTIVE" ? "dinonaktifkan" : "diaktifkan"}`);
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Satuan Stok
      </h1>

      {/* Filter & Actions */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1">
            <Label>Cari Satuan</Label>
            <div className="relative">
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
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Semua</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <Label className="opacity-0">Tambah</Label>
            <button
              onClick={() => openEditDrawer()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full lg:w-auto"
            >
              <Plus className="w-5 h-5" />
              Tambah Satuan
            </button>
          </div>
        </div>
      </div>

      <ComponentCard title="Daftar Satuan Stok">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin w-10 h-10 text-gray-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Singkatan</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Deskripsi</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(unit => (
                    <tr key={unit.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-6 font-medium">{unit.name}</td>
                      <td className="py-4 px-6">{unit.fullName}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{unit.description || "-"}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          unit.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {unit.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <button onClick={() => openEditDrawer(unit)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded">
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          {unit.status === "ACTIVE" ? (
                            <button onClick={() => handleToggleStatus(unit)} className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded">
                              <ToggleRight className="w-4 h-4 text-orange-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(unit)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded">
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
                <p className="text-center py-10 text-gray-500">Tidak ada data satuan.</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i+1} onClick={() => setCurrentPage(i+1)}
                    className={`px-4 py-2 rounded ${currentPage === i+1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {i+1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editingUnit ? "Edit" : "Tambah"} Satuan</h2>
              <button onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label htmlFor="unit-name">Singkatan (contoh: kg)</Label>
                <Input id="unit-name" value={name} onChange={e => setName(e.target.value)} placeholder="kg" required />
              </div>

              <div>
                <Label htmlFor="unit-full">Nama Lengkap</Label>
                <Input id="unit-full" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Kilogram" required />
              </div>

              <div>
                <Label htmlFor="unit-desc">Deskripsi (Opsional)</Label>
                <textarea
                  id="unit-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Penjelasan penggunaan satuan ini..."
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