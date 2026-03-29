import {
  Edit,
  Loader,
  Plus,
  Search,
  Trash2,
  Upload
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://be-kirafarm.kiraproject.id/api/products";
const MY_PRODUCTS_URL = `https://be-kirafarm.kiraproject.id/api/products/my-products`;
const CAT_API_URL = "https://be-kirafarm.kiraproject.id/api/categories";
const UNIT_API_URL = "https://be-kirafarm.kiraproject.id/api/units";

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  category?: Category;
  unit?: Unit;
  categoryId: string;
  unitId: string;
  price: number;
  stock: number;
  description: string;
  thumbnail: string;
  origin: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  
  // UI & File States
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const userJson = localStorage.getItem("user");

      if (!userJson || !token) {
        console.error("User atau Token tidak ditemukan");
        return;
      }

      const userData = JSON.parse(userJson);
      
      // SESUAI STRUKTUR KAMU: Ambil id dari dalam objek seller
      const sellerId = userData.seller?.id; 

      if (!sellerId) {
        console.error("Seller ID (3a2a0337...) tidak ditemukan dalam data user");
        return;
      }

      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      };

      // Gabungkan URL dengan query parameter
      const queryParam = `?sellerId=${sellerId}`;

      const [resProd, resCat, resUnit] = await Promise.all([
        fetch(`${MY_PRODUCTS_URL}${queryParam}`, { headers }),
        fetch(`${CAT_API_URL}${queryParam}`, { headers }), // Sekarang memfilter kategori milik seller
        fetch(`${UNIT_API_URL}${queryParam}`, { headers })  // Sekarang memfilter unit milik seller
      ]);

      const jsonProd = await resProd.json();
      const jsonCat = await resCat.json();
      const jsonUnit = await resUnit.json();

      if (jsonProd.success) setProducts(jsonProd.data);
      if (jsonCat.success) setCategories(jsonCat.data);
      if (jsonUnit.success) setUnits(jsonUnit.data);

    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchData();
    }, []);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !selectedCategoryId || !selectedUnitId || !code) {
      toast.error("Mohon lengkapi data wajib!");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("code", code);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock || "0");
      formData.append("description", description);
      formData.append("origin", origin);
      formData.append("categoryId", selectedCategoryId);
      formData.append("unitId", selectedUnitId);
      
      if (imageFile) {
        formData.append("thumbnail", imageFile); 
      }

      // Gunakan base URL untuk POST/PUT
      const url = editingProduct ? `${API_BASE_URL}/${editingProduct.id}` : API_BASE_URL;
      const method = editingProduct ? "PUT" : "POST";
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          // JANGAN set Content-Type ke multipart/form-data secara manual, 
          // biarkan browser yang melakukannya otomatis saat mengirim FormData
          "Authorization": `Bearer ${token}` 
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsEditDrawerOpen(false);
        fetchData(); 
        resetForm();
      } else {
        // Tampilkan pesan error spesifik dari backend (misal: "Insufficient permissions")
        toast.error(result.message || "Gagal menyimpan produk");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    await handleDelete(productToDelete.id); // Panggil fungsi delete yang sudah kamu buat
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const resetForm = () => {
    setName(""); setCode(""); setPrice(""); setStock("");
    setDescription(""); setOrigin(""); 
    setSelectedCategoryId(""); setSelectedUnitId("");
    setEditingProduct(null); setImageFile(null); setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEditDrawer = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setCode(product.code);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setDescription(product.description || "");
      setOrigin(product.origin || "");
      setSelectedCategoryId(product.categoryId);
      setSelectedUnitId(product.unitId);
      setPreviewUrl(product.thumbnail);
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus produk ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/${id}`, { 
        method: "DELETE", 
        headers: { "Authorization": `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Produk berhasil dihapus");
        fetchData();
      }
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500">Kelola stok dan informasi produk Kirafarm</p>
        </div>
        <button onClick={() => openEditDrawer()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-200">
          <Plus size={20} /> <span className="hidden md:inline">Tambah Produk</span>
        </button>
      </div>

      <div className="mb-6 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <Input 
          className="pl-12 py-3 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20" 
          placeholder="Cari berdasarkan nama atau kode produk..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ComponentCard title={`Total Produk (${filteredProducts.length})`}>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-500 animate-pulse">Memuat data produk...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Produk</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Kategori</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Harga</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Stok</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                         <img src={p.thumbnail || '/placeholder-img.png'} className="w-full h-full object-cover" alt={p.name} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">{p.code}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {p.category?.name || 'Uncategorized'}
                        </span>
                    </td>
                    <td className="p-4 font-bold text-blue-600">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                        <div className={`font-semibold ${p.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                            {p.stock} <span className="text-xs font-normal text-gray-400">{p.unit?.name || 'pcs'}</span>
                        </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEditDrawer(p)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => openDeleteModal(p)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-gray-400 italic">Produk tidak ditemukan</div>
            )}
          </div>
        )}
      </ComponentCard>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Overlay dengan Blur Tebal (Glassmorphism) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            />

            {/* Konten Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", damping: 25, stiffness: 300 } 
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-white/20"
            >
              {/* Icon dengan Pulse Effect */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-100 animate-ping rounded-full opacity-20"></div>
                <div className="relative w-full h-full bg-red-50 text-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                  <Trash2 size={40} strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hapus Produk?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Produk <span className="font-semibold text-gray-800">"{productToDelete?.name}"</span> akan dihapus permanen dari sistem Kirafarm.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  Ya, Hapus Sekarang
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 rounded-2xl font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batalkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DRAWER FORM --- */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsEditDrawerOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">{editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}</h2>
                <button disabled={isSubmitting} onClick={() => setIsEditDrawerOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <Label>Foto Produk</Label>
                <div 
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-gray-50 mt-1 group"
                >
                  {previewUrl ? (
                    <div className="relative w-full flex justify-center">
                        <img src={previewUrl} className="max-h-52 rounded-xl shadow-md object-contain" alt="Preview" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-xl transition-opacity">
                            <Upload className="text-white" />
                        </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                        <Upload className="text-blue-500" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Klik untuk upload gambar</p>
                      <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WEBP (Maks. 2MB)</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label>Kode Produk</Label>
                  <Input 
                    placeholder="Contoh: AYM-001" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    disabled={!!editingProduct} 
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <Label>Nama Produk</Label>
                  <Input 
                    placeholder="Nama lengkap produk" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Harga Jual (Rp)</Label>
                  <Input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Stok Awal</Label>
                  <Input type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <div className="mt-1">
                    <Select 
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      defaultValue={selectedCategoryId}
                      onChange={v => setSelectedCategoryId(v as string)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Satuan (Unit)</Label>
                  <div className="mt-1">
                    <Select 
                      options={units.map(u => ({ value: u.id, label: u.name }))}
                      defaultValue={selectedUnitId}
                      onChange={v => setSelectedUnitId(v as string)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Asal Produk (Origin)</Label>
                <Input placeholder="Contoh: Peternakan A" value={origin} onChange={e => setOrigin(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Deskripsi</Label>
                <textarea 
                   className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none h-28 text-sm"
                   placeholder="Informasi detail mengenai produk..."
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t sticky bottom-0 bg-white">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold disabled:opacity-50 flex justify-center items-center gap-3 transition-all shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? <Loader className="animate-spin" size={20} /> : null}
                  {isSubmitting ? "Memproses..." : editingProduct ? "Perbarui Produk" : "Simpan Produk Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}