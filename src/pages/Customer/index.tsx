import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Loader,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchase: string;
  notes?: string;
}

const dummyCustomers: Customer[] = [
  {
    id: "1",
    name: "Toko Sembako Makmur",
    phone: "081234567890",
    email: "makmur@gmail.com",
    address: "Jl. Sudirman No. 10, Jakarta",
    totalPurchases: 4500000,
    lastPurchase: "2025-12-28",
    notes: "Pelanggan tetap, suka beli ayam & sayur",
  },
  {
    id: "2",
    name: "Restoran Sehat",
    phone: "082198765432",
    address: "Mall Kelapa Gading",
    totalPurchases: 3200000,
    lastPurchase: "2025-12-20",
  },
  {
    id: "3",
    name: "Budi Santoso",
    phone: "085712345678",
    totalPurchases: 1800000,
    lastPurchase: "2025-12-15",
    notes: "Pembeli eceran buah",
  },
  {
    id: "4",
    name: "Pasar Tradisional Baru",
    phone: "089876543210",
    address: "Pasar Minggu",
    totalPurchases: 5800000,
    lastPurchase: "2025-12-31",
    notes: "Grosir besar",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCustomers(dummyCustomers);
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setEditingCustomer(null);
  };

  const openDetailDrawer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailDrawerOpen(true);
  };

  const openEditDrawer = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || "");
      setAddress(customer.address || "");
      setNotes(customer.notes || "");
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Nama dan nomor telepon wajib diisi!");
      return;
    }

    const updatedCustomer: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      totalPurchases: editingCustomer?.totalPurchases || 0,
      lastPurchase: editingCustomer?.lastPurchase || "-",
    };

    if (editingCustomer) {
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c))
      );
      toast.success("Pelanggan berhasil diperbarui");
    } else {
      setCustomers([updatedCustomer, ...customers]);
      toast.success("Pelanggan baru berhasil ditambahkan");
    }

    setIsEditDrawerOpen(false);
    resetForm();
  };

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Pelanggan
      </h1>

      {/* Filter & Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="relative flex-1">
            <Label>Cari Pelanggan</Label>
            <Search className="absolute left-3 top-[calc(50%+0.75rem)] -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Nama, telepon, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <Label className="opacity-0">Tambah</Label>
            <button
              onClick={() => openEditDrawer()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition w-full lg:w-auto"
            >
              <Plus className="w-5 h-5" />
              Tambah Pelanggan
            </button>
          </div>
        </div>

        {searchTerm && (
          <div className="mt-4">
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset pencarian
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <ComponentCard title="Daftar Pelanggan">
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
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                      Nama Pelanggan
                    </th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                      Kontak
                    </th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                      Total Belanja
                    </th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                      Terakhir Beli
                    </th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-4 px-6 font-medium">{c.name}</td>
                      <td className="py-4 px-6">
                        <p className="font-medium">{c.phone}</p>
                        {c.email && (
                          <p className="text-sm text-gray-500">{c.email}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {formatCurrency(c.totalPurchases)}
                      </td>
                      <td className="py-4 px-6">{c.lastPurchase}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openDetailDrawer(c)}
                            title="Lihat Detail"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => openEditDrawer(c)}
                            title="Edit"
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                          >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <p className="text-center py-10 text-gray-500">
                  {searchTerm
                    ? "Tidak ditemukan pelanggan dengan pencarian tersebut."
                    : "Belum ada data pelanggan."}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl h-full overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detail Pelanggan</h2>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Label>Nama Pelanggan</Label>
                <p className="text-lg font-medium">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label>Nomor Telepon</Label>
                <p className="text-lg">{selectedCustomer.phone}</p>
              </div>
              {selectedCustomer.email && (
                <div>
                  <Label>Email</Label>
                  <p className="text-lg">{selectedCustomer.email}</p>
                </div>
              )}
              {selectedCustomer.address && (
                <div>
                  <Label>Alamat</Label>
                  <p className="text-lg">{selectedCustomer.address}</p>
                </div>
              )}
              <div>
                <Label>Total Belanja</Label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(selectedCustomer.totalPurchases)}
                </p>
              </div>
              <div>
                <Label>Terakhir Pembelian</Label>
                <p className="text-lg">{selectedCustomer.lastPurchase}</p>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <Label>Catatan</Label>
                  <p className="text-lg">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl h-full overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingCustomer ? "Edit" : "Tambah"} Pelanggan
              </h2>
              <button
                onClick={() => {
                  setIsEditDrawerOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label htmlFor="name">Nama Pelanggan</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Alamat lengkap pengiriman..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Catatan khusus tentang pelanggan ini..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDrawerOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                >
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