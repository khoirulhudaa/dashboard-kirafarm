import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  Loader,
  Plus,
  Search,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

// --- Interfaces ---
interface Product {
  id: string;
  code: string;
  name: string;
  unit?: { name: string };
  stock: number; // Dari backend field-nya 'stock'
}

interface StockOpname {
  id: string;
  createdAt: string; 
  product: Product;
  previousStock: number;
  actualStock: number;
  difference: number;
  adjustmentType: "PLUS" | "MINUS";
  note: string;
  userName: string;
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};



export default function StockOpnamePage() {
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Drawer & Modal states
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  
  // Form states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [actualStock, setActualStock] = useState("");
  const [note, setNote] = useState("");
  
  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const BASE_URL = "https://be-kirafarm.kiraproject.id";

  const getSellerId = () => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const userData = JSON.parse(userRaw);
      return userData?.seller?.id; // Sesuai struktur user.seller.id
    }
    return null;
  };

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const sellerId = getSellerId();

    if (!sellerId) {
      toast.error("Data seller tidak ditemukan, silakan login ulang");
      setLoading(false);
      return;
    }

    try {
      const [prodRes, opnRes] = await Promise.all([
        // Tambahkan ?sellerId=... pada URL produk
        fetch(`${BASE_URL}/api/products/my-products?sellerId=${sellerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${BASE_URL}/api/stock-opname`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      const prodData = await prodRes.json();
      const opnData = await opnRes.json();

      console.log('prodData', prodData)
      console.log('opnData', opnData)

      if (prodData.success) setProducts(prodData.data);
      if (opnData.success) setOpnames(opnData.data);
    } catch (error) {
      toast.error("Gagal sinkronisasi data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const resetForm = () => {
    setSelectedProductId("");
    setActualStock("");
    setNote("");
  };

  const handleSubmitOpname = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Input Dasar
    if (!selectedProductId || !actualStock) {
      toast.error("Produk dan stok aktual wajib diisi!");
      return;
    }

    // 2. Ambil Data dari LocalStorage
    const token = localStorage.getItem("accessToken");
    const userRaw = localStorage.getItem("user");
    
    let sellerId = "";
    try {
      if (userRaw) {
        const userData = JSON.parse(userRaw);
        sellerId = userData?.seller?.id || ""; // Mengambil user.seller.id
      }
    } catch (err) {
      console.error("Gagal parse data user", err);
    }

    // 3. Validasi Keberadaan Token & SellerId
    if (!token || !sellerId) {
      toast.error("Sesi habis atau data seller tidak valid. Silakan login ulang.");
      return;
    }

    setIsSubmitting(true);

    try {
      const BASE_URL = "https://be-kirafarm.kiraproject.id";

      const response = await fetch(`${BASE_URL}/api/stock-opname`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Kirim Token di Header
        },
        body: JSON.stringify({
          productId: selectedProductId,
          sellerId: sellerId,        // Kirim sellerId di Body
          actualStock: Number(actualStock),
          note: note || "-",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Stok opname berhasil disimpan");
        
        // Update state lokal agar tabel langsung terupdate
        setOpnames([result.data, ...opnames]);
        
        // Update stok di list produk agar sinkron dengan angka terbaru
        setProducts(products.map(p => 
          p.id === selectedProductId ? { ...p, stock: Number(actualStock) } : p
        ));

        setIsAddDrawerOpen(false);
        resetForm();
      } else {
        toast.error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Terjadi kesalahan sistem atau koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtering Logic ---
  const filteredOpnames = opnames.filter((op) => {
    const productName = op.product?.name?.toLowerCase() || "";
    const productCode = op.product?.code?.toLowerCase() || "";
    const opNote = op.note?.toLowerCase() || "";
    
    const matchesSearch = productName.includes(searchTerm.toLowerCase()) ||
                         productCode.includes(searchTerm.toLowerCase()) ||
                         opNote.includes(searchTerm.toLowerCase());

    const matchesProduct = !filterProduct || op.product?.id === filterProduct;
    const matchesType = !filterType || op.adjustmentType === filterType;

    return matchesSearch && matchesProduct && matchesType;
  });

  const totalItems = filteredOpnames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredOpnames.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Stok Opname</h1>
        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Opname Baru
        </button>
      </header>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative">
          <Label>Cari</Label>
          <Search className="absolute left-3 top-[2.4rem] text-gray-400 w-4 h-4" />
          <Input
            placeholder="Kode / Nama Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <Label>Filter Produk</Label>
          <Select
            options={[
              { value: "", label: "Semua Produk" },
              ...products.map(p => ({ value: p.id, label: p.name }))
            ]}
            onChange={(v) => setFilterProduct(v as string)}
          />
        </div>
        <div>
          <Label>Tipe</Label>
          <Select
            options={[
              { value: "", label: "Semua" },
              { value: "PLUS", label: "Penambahan (+)" },
              { value: "MINUS", label: "Pengurangan (-)" }
            ]}
            onChange={(v) => setFilterType(v as string)}
          />
        </div>
      </div>

      <ComponentCard title="Riwayat Aktivitas">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader className="animate-spin text-blue-500 w-10 h-10" />
            <p className="mt-4 text-gray-400">Sinkronisasi data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Waktu & Produk</th>
                  <th className="px-6 py-4">Sistem → Aktual</th>
                  <th className="px-6 py-4 text-center">Selisih</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {currentData.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold">{formatDate(op.createdAt)}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{op.product?.name}</span>
                        <span className="text-xs text-blue-500 font-medium">{op.product?.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-gray-400">{op.previousStock}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{op.actualStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        op.adjustmentType === 'PLUS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {op.adjustmentType === 'PLUS' ? '+' : ''}{op.difference}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedOpname(op); setIsDetailDrawerOpen(true); }} className="p-2 hover:bg-white rounded-full shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-blue-600">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>

      {/* --- DRAWER: ADD OPNAME --- */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddDrawerOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">New Stock Audit</h2>
                <button onClick={() => setIsAddDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
              </div>

              <form onSubmit={handleSubmitOpname} className="space-y-8">
                <div>
                  <Label>Pilih Produk</Label>
                  <Select
                    options={products.map(p => ({
                      value: p.id,
                      label: `${p.name} (Sistem: ${p.stock})`
                    }))}
                    onChange={(v) => setSelectedProductId(v as string)}
                    placeholder="Pilih item..."
                  />
                </div>

                <div>
                  <Label>Jumlah Fisik Terhitung</Label>
                  <Input
                    type="number"
                    value={actualStock}
                    onChange={(e) => setActualStock(e.target.value)}
                    placeholder="Masukkan angka real di lapangan"
                    className="text-2xl font-bold py-6 text-blue-600"
                  />
                </div>

                <div>
                  <Label>Alasan / Catatan</Label>
                  <textarea
                    className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Barang rusak atau bonus supplier..."
                  />
                </div>

                <div className="pt-10 space-y-3">
                  <button
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader className="animate-spin" /> : "PROSES SEKARANG"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddDrawerOpen(false)}
                    className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: DETAIL (Menggunakan style blur yang kamu suka) --- */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedOpname && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailDrawerOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-white/20">
              <div className="text-center mb-6">
                 <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                    <Eye size={32} />
                 </div>
                 <h3 className="text-2xl font-bold">Audit Detail</h3>
                 <p className="text-gray-400 text-sm italic">{selectedOpname.id}</p>
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Petugas</span>
                  <span className="font-bold">{selectedOpname.userName}</span>
                </div>
                <div className="flex justify-between border-t dark:border-gray-700 pt-3">
                  <span className="text-gray-400">Item</span>
                  <span className="font-bold text-blue-600">{selectedOpname.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selisih Total</span>
                  <span className={`font-black ${selectedOpname.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedOpname.difference} Item
                  </span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3">
                  <span className="text-gray-400 block mb-2 text-xs uppercase font-bold">Catatan:</span>
                  <p className="text-sm leading-relaxed">{selectedOpname.note}</p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="w-full py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold transition-transform active:scale-95"
              >
                Tutup Laporan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}