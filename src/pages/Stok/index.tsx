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

interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface StockOpname {
  id: string;
  date: string; // ISO string
  product: Product;
  previousStock: number;
  actualStock: number;
  difference: number; // actual - previous
  adjustmentType: "PLUS" | "MINUS";
  note: string;
  user: string; // Nama user yang melakukan opname
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const dummyProducts: Product[] = [
  { id: "1", code: "TRK-001", name: "Sapi Potong", unit: "ekor", currentStock: 10 },
  { id: "2", code: "TRK-002", name: "Ayam Kampung", unit: "ekor", currentStock: 48 },
  { id: "4", code: "SYR-001", name: "Bayam Organik", unit: "kg", currentStock: 95 },
  { id: "7", code: "BUH-001", name: "Apel Malang", unit: "kg", currentStock: 285 },
];

const dummyStockOpnames: StockOpname[] = [
  {
    id: "OPN-001",
    date: "2025-12-20T14:30:00.000Z",
    product: dummyProducts[0],
    previousStock: 12,
    actualStock: 10,
    difference: -2,
    adjustmentType: "MINUS",
    note: "Hilang 2 ekor karena sakit & mati",
    user: "Admin",
  },
  {
    id: "OPN-002",
    date: "2025-12-15T09:15:00.000Z",
    product: dummyProducts[1],
    previousStock: 50,
    actualStock: 48,
    difference: -2,
    adjustmentType: "MINUS",
    note: "Konsumsi internal untuk acara keluarga",
    user: "Khoirul",
  },
  {
    id: "OPN-003",
    date: "2025-11-28T16:45:00.000Z",
    product: dummyProducts[2],
    previousStock: 100,
    actualStock: 95,
    difference: -5,
    adjustmentType: "MINUS",
    note: "Rusak karena hujan deras",
    user: "Admin",
  },
  {
    id: "OPN-004",
    date: "2025-11-10T11:20:00.000Z",
    product: dummyProducts[3],
    previousStock: 280,
    actualStock: 285,
    difference: 5,
    adjustmentType: "PLUS",
    note: "Tambahan dari supplier (bonus)",
    user: "Admin",
  },
];

export default function StockOpname() {
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);

  // Form states for adding new opname
  const [selectedProductId, setSelectedProductId] = useState("");
  const [actualStock, setActualStock] = useState("");
  const [note, setNote] = useState("");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterType, setFilterType] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Simulate fetch data
    setTimeout(() => {
      setProducts(dummyProducts);
      setOpnames(dummyStockOpnames);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProduct, filterType]);

  const resetForm = () => {
    setSelectedProductId(products[0]?.id || "");
    setActualStock("");
    setNote("");
  };

  const openAddDrawer = () => {
    resetForm();
    setIsAddDrawerOpen(true);
  };

  const openDetailDrawer = (opname: StockOpname) => {
    setSelectedOpname(opname);
    setIsDetailDrawerOpen(true);
  };

  const handleSubmitOpname = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !actualStock) {
      toast.error("Produk dan stok aktual wajib diisi!");
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const prevStock = product.currentStock;
    const actual = Number(actualStock);
    const diff = actual - prevStock;

    const newOpname: StockOpname = {
      id: `OPN-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      product,
      previousStock: prevStock,
      actualStock: actual,
      difference: diff,
      adjustmentType: diff >= 0 ? "PLUS" : "MINUS",
      note: note || "-",
      user: "Khoirul", // nanti ambil dari auth context
    };

    setOpnames([newOpname, ...opnames]);
    
    // Update stok produk (simulasi)
    setProducts(products.map(p =>
      p.id === selectedProductId ? { ...p, currentStock: actual } : p
    ));

    toast.success("Stok opname berhasil disimpan");
    setIsAddDrawerOpen(false);
    resetForm();
  };

  // Filtering
  const filteredOpnames = opnames.filter((op) => {
    const matchesSearch =
      op.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.note.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = !filterProduct || op.product.id === filterProduct;
    const matchesType = !filterType || op.adjustmentType === filterType;

    return matchesSearch && matchesProduct && matchesType;
  });

  const totalItems = filteredOpnames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredOpnames.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Stok Opname
      </h1>

      {/* FILTER & ADD BUTTON */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 w-full md:w-max">
            <div>
              <Label htmlFor="product">Produk</Label>
              <Select
                options={[
                  { value: "", label: "Semua Produk" },
                  ...products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` })),
                ]}
                defaultValue={filterProduct}
                onChange={(v) => setFilterProduct(v as string)}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipe Penyesuaian</Label>
              <Select
                options={[
                  { value: "", label: "Semua" },
                  { value: "PLUS", label: "Penambahan" },
                  { value: "MINUS", label: "Pengurangan" },
                ]}
                defaultValue={filterType}
                onChange={(v) => setFilterType(v as string)}
              />
            </div>

            <div className="relative">
              <Label htmlFor="search">Cari</Label>
              <Search className="absolute left-3 top-[calc(50%+0.75rem)] -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Nama / kode / catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <button
            onClick={openAddDrawer}
            className="md:w-max w-full flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition whitespace-nowrap ml-auto"
          >
            <Plus className="w-5 h-5" />
            Opname Baru
          </button>
        </div>

        {(searchTerm || filterProduct || filterType) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterProduct("");
              setFilterType("");
            }}
            className="mt-3 text-sm text-green-600 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* TABLE */}
      <ComponentCard title="Riwayat Stok Opname">
        {loading ? (
          <div className="w-full flex flex-col justify-center items-center pt-10 pb-20">
            <Loader className="animate-spin w-10 h-10 text-gray-500" />
            <p className="mt-4 text-gray-500">Memuat data stok opname...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} data
              </div>
            </div>

            <div className="overflow-x-auto">
             <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Info Produk</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perubahan Stok</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Selisih</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                    {currentData.map((op) => (
                        <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        {/* Info Produk & Tanggal */}
                        <td className="py-3 px-4">
                            <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-gray-400 uppercase">{formatDate(op.date)}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]" title={op.product.name}>
                                {op.product.name}
                            </span>
                            <span className="text-xs text-gray-500">{op.product.code}</span>
                            </div>
                        </td>

                        {/* Perubahan Stok (Sebelum -> Sesudah) */}
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400 line-through decoration-red-300/50">{op.previousStock}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-bold text-gray-900 dark:text-white">{op.actualStock}</span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                                {op.product.unit}
                            </span>
                            </div>
                        </td>

                        {/* Selisih dengan Satuan */}
                        <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            op.difference > 0 
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                                : op.difference < 0 
                                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                                : "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                            {op.difference > 0 ? "+" : ""}{op.difference} {op.product.unit}
                            </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right">
                            <button
                            onClick={() => openDetailDrawer(op)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                            >
                            <Eye className="w-4 h-4" />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

              {currentData.length === 0 && (
                <p className="text-center py-10 text-gray-500">
                  {searchTerm || filterProduct || filterType
                    ? "Tidak ditemukan data stok opname dengan filter tersebut."
                    : "Belum ada riwayat stok opname."}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* DETAIL DRAWER */}
      {isDetailDrawerOpen && selectedOpname && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold">Detail Stok Opname</h2>
                <button onClick={() => setIsDetailDrawerOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <Label>Tanggal Opname</Label>
                  <p className="text-lg font-medium">{formatDate(selectedOpname.date)}</p>
                </div>
                <div>
                  <Label>Produk</Label>
                  <p className="text-lg font-medium">{selectedOpname.product.name}</p>
                  <p className="text-sm text-gray-500">{selectedOpname.product.code}</p>
                </div>
                <div>
                  <Label>Stok Sebelum Opname</Label>
                  <p className="text-lg">{selectedOpname.previousStock} {selectedOpname.product.unit}</p>
                </div>
                <div>
                  <Label>Stok Aktual (Hasil Hitung)</Label>
                  <p className="text-lg">{selectedOpname.actualStock} {selectedOpname.product.unit}</p>
                </div>
                <div>
                  <Label>Selisih</Label>
                  <p className={`text-xl font-bold ${
                    selectedOpname.difference > 0 ? "text-green-600" :
                    selectedOpname.difference < 0 ? "text-red-600" : "text-gray-600"
                  }`}>
                    {selectedOpname.difference > 0 ? "+" : ""}
                    {selectedOpname.difference} {selectedOpname.product.unit}
                  </p>
                </div>
                <div>
                  <Label>Tipe Penyesuaian</Label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedOpname.adjustmentType === "PLUS"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {selectedOpname.adjustmentType === "PLUS" ? "Penambahan" : "Pengurangan"}
                  </span>
                </div>
                <div>
                  <Label>Catatan</Label>
                  <p className="text-lg whitespace-pre-wrap">{selectedOpname.note}</p>
                </div>
                <div>
                  <Label>Dilakukan oleh</Label>
                  <p className="text-lg">{selectedOpname.user}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW OPNAME DRAWER */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsAddDrawerOpen(false);
              resetForm();
            }}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold">Stok Opname Baru</h2>
                <button
                  onClick={() => {
                    setIsAddDrawerOpen(false);
                    resetForm();
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmitOpname} className="space-y-6">
                  <div>
                    <Label htmlFor="product">Produk</Label>
                    <Select
                      options={products.map(p => ({
                        value: p.id,
                        label: `${p.code} - ${p.name} (stok saat ini: ${p.currentStock} ${p.unit})`,
                      }))}
                      defaultValue={selectedProductId}
                      onChange={(v) => setSelectedProductId(v as string)}
                      placeholder="Pilih produk yang akan diopname"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actualStock">Jumlah Stok Aktual</Label>
                    <Input
                      type="number"
                      id="actualStock"
                      min="0"
                      value={actualStock}
                      onChange={(e) => setActualStock(e.target.value)}
                      placeholder="Masukkan jumlah stok hasil hitung fisik"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bandingkan dengan stok sistem saat ini.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="note">Catatan / Alasan Selisih</Label>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      rows={4}
                      placeholder="Contoh: Hilang karena pencurian, tambahan dari supplier, rusak, dll..."
                    />
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                    >
                      Simpan Stok Opname
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddDrawerOpen(false);
                        resetForm();
                      }}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}