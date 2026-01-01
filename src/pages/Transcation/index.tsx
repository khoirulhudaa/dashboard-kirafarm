import {
  ChevronLeft,
  ChevronRight,
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
import Select from "../../components/form/Select";

// Dummy Produk
const dummyProducts = [
  { id: "1", code: "TRK-001", name: "Sapi Potong", price: 150000, stock: 10, unit: "ekor" },
  { id: "2", code: "TRK-002", name: "Ayam Kampung", price: 50000, stock: 50, unit: "ekor" },
  { id: "4", code: "SYR-001", name: "Bayam Organik", price: 5000, stock: 100, unit: "kg" },
  { id: "7", code: "BUH-001", name: "Apel Malang", price: 25000, stock: 300, unit: "kg" },
  { id: "8", code: "BUH-002", name: "Pisang Cavendish", price: 15000, stock: 400, unit: "kg" },
  { id: "12", code: "BUH-004", name: "Mangga Arumanis", price: 18000, stock: 150, unit: "kg" },
];

interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  status: "PAID" | "PENDING" | "CANCELLED";
}

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}${day}-${random}`;
};

// Dummy Penjualan (Tanggal sesuai 2026)
const dummySales: Sale[] = [
  {
    id: "1",
    invoiceNumber: "INV-20260115-5678",
    date: "2026-01-15T11:20:00.000Z",
    customerName: "Toko Sembako Jaya Abadi",
    items: [
      { productId: "1", productName: "Sapi Potong", price: 150000, quantity: 3, subtotal: 450000 },
      { productId: "4", productName: "Bayam Organik", price: 5000, quantity: 30, subtotal: 150000 },
    ],
    totalAmount: 600000,
    status: "PAID",
  },
  {
    id: "2",
    invoiceNumber: "INV-20260110-2341",
    date: "2026-01-10T14:45:00.000Z",
    customerName: "Restoran Nusa Indah",
    items: [
      { productId: "2", productName: "Ayam Kampung", price: 50000, quantity: 20, subtotal: 1000000 },
      { productId: "7", productName: "Apel Malang", price: 25000, quantity: 10, subtotal: 250000 },
    ],
    totalAmount: 1250000,
    status: "PAID",
  },
  {
    id: "3",
    invoiceNumber: "INV-20260105-7890",
    date: "2026-01-05T09:30:00.000Z",
    customerName: "Pasar Malam Sentosa",
    items: [
      { productId: "8", productName: "Pisang Cavendish", price: 15000, quantity: 60, subtotal: 900000 },
      { productId: "12", productName: "Mangga Arumanis", price: 18000, quantity: 40, subtotal: 720000 },
    ],
    totalAmount: 1620000,
    status: "PENDING",
  },
  {
    id: "4",
    invoiceNumber: "INV-20260101-4321",
    date: "2026-01-01T16:00:00.000Z",
    customerName: "Warung Makan Pak Slamet",
    items: [
      { productId: "2", productName: "Ayam Kampung", price: 50000, quantity: 8, subtotal: 400000 },
    ],
    totalAmount: 400000,
    status: "CANCELLED",
  },
];

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products] = useState(dummyProducts);
  const [loading, setLoading] = useState(true);

  // Drawer
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form Tambah
  const [customerName, setCustomerName] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setSales(dummySales);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const resetForm = () => {
    setCustomerName("");
    setSaleItems([]);
  };

  const openAddDrawer = () => {
    resetForm();
    setIsAddDrawerOpen(true);
  };

  const openDetailDrawer = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailDrawerOpen(true);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: "", productName: "", price: 0, quantity: 1, subtotal: 0 }]);
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...saleItems];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].productId = product.id;
        updated[index].productName = product.name;
        updated[index].price = product.price;
      }
    } else if (field === "quantity") {
      updated[index].quantity = Math.max(1, Number(value) || 1);
    }
    updated[index].subtotal = updated[index].price * updated[index].quantity;
    setSaleItems(updated);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Nama pelanggan wajib diisi!");
      return;
    }
    if (saleItems.length === 0 || saleItems.some((item) => !item.productId)) {
      toast.error("Tambahkan minimal satu produk yang valid!");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      customerName: customerName.trim(),
      items: saleItems,
      totalAmount,
      status: "PAID",
    };

    setSales([newSale, ...sales]);
    toast.success(`Penjualan berhasil dicatat! Total: ${formatCurrency(totalAmount)}`);
    setIsAddDrawerOpen(false);
    resetForm();
  };

  // Filtering & Pagination
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || sale.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentData = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Penjualan
      </h1>

      {/* Search & Filter */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1">
            <Label>Cari Transaksi</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Nomor invoice atau nama pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              options={[
                { value: "", label: "Semua Status" },
                { value: "PAID", label: "Lunas" },
                { value: "PENDING", label: "Pending" },
                { value: "CANCELLED", label: "Dibatalkan" },
              ]}
              defaultValue={filterStatus}
              onChange={(v) => setFilterStatus(v)}
            />
          </div>

          <button
            onClick={openAddDrawer}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Tabel */}
      <ComponentCard title="Daftar Penjualan">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="animate-spin w-12 h-12 text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Invoice</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Tanggal</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Pelanggan</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Total</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Status</th>
                    <th className="py-4 px-6 text-xs font-medium uppercase text-gray-700 dark:text-gray-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((sale) => (
                    <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="py-4 px-6 font-medium">{sale.invoiceNumber}</td>
                      <td className="py-4 px-6 text-sm">{formatDate(sale.date)}</td>
                      <td className="py-4 px-6">{sale.customerName}</td>
                      <td className="py-4 px-6 font-semibold">{formatCurrency(sale.totalAmount)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            sale.status === "PAID"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : sale.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {sale.status === "PAID" ? "Lunas" : sale.status === "PENDING" ? "Pending" : "Dibatalkan"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openDetailDrawer(sale)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                        >
                          <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm || filterStatus ? "Tidak ada transaksi yang cocok." : "Belum ada data penjualan."}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedSale && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-end">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detail Penjualan</h2>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Nomor Invoice</Label>
                  <p className="text-lg font-semibold">{selectedSale.invoiceNumber}</p>
                </div>
                <div>
                  <Label>Tanggal</Label>
                  <p className="text-lg">{formatDate(selectedSale.date)}</p>
                </div>
                <div>
                  <Label>Pelanggan</Label>
                  <p className="text-lg">{selectedSale.customerName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <span
                    className={`px-4 py-2 text-sm font-medium rounded-full ${
                      selectedSale.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : selectedSale.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedSale.status === "PAID" ? "Lunas" : selectedSale.status === "PENDING" ? "Pending" : "Dibatalkan"}
                  </span>
                </div>
              </div>

              <div>
                <Label>Daftar Item</Label>
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">Produk</th>
                        <th className="py-3 px-4 text-center text-sm font-medium">Harga</th>
                        <th className="py-3 px-4 text-center text-sm font-medium">Jumlah</th>
                        <th className="py-3 px-4 text-right text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-700">
                          <td className="py-3 px-4">{item.productName}</td>
                          <td className="py-3 px-4 text-center">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-bold bg-gray-50 dark:bg-gray-800">
                        <td colSpan={3} className="py-4 px-4 text-right text-lg">Total</td>
                        <td className="py-4 px-4 text-right text-xl text-blue-600">
                          {formatCurrency(selectedSale.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tambah Penjualan Drawer */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-[999999999] bg-black/60 flex justify-end">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transaksi Penjualan Baru</h2>
              <button
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="p-6 space-y-8">
              <div>
                <Label htmlFor="customer">Nama Pelanggan</Label>
                <Input
                  id="customer"
                  placeholder="Masukkan nama pelanggan (wajib)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Daftar Produk</Label>
                  <button
                    type="button"
                    onClick={addSaleItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Item
                  </button>
                </div>

                {saleItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                    Belum ada item. Klik tombol di atas untuk menambah produk.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {saleItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-4 items-end border-b dark:border-gray-700 pb-4"
                      >
                        <div className="col-span-5">
                          <Label className="text-xs">Produk</Label>
                          <Select
                            options={products.map((p) => ({
                              value: p.id,
                              label: `${p.name} (${p.code}) - Stok: ${p.stock} ${p.unit}`,
                            }))}
                            onChange={(v) => updateSaleItem(index, "productId", v)}
                            placeholder="Pilih produk..."
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Harga</Label>
                          <Input value={formatCurrency(item.price)} disabled className="bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Jumlah</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateSaleItem(index, "quantity", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Subtotal</Label>
                          <Input value={formatCurrency(item.subtotal)} disabled className="bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeSaleItem(index)}
                            className="w-full p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                          >
                            <X className="w-5 h-5 text-red-600 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    Total: {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-lg"
                >
                  Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-lg"
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