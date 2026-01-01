import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
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
import Select from "../../components/form/Select";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  unit: string; // e.g., kg, ekor, lusin
  description: string;
  thumbnail: string; // External URL
  origin: string; // e.g., Lokal, Impor
  status: "ACTIVE" | "INACTIVE";
  addedDate: string;
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("id-ID");
};

const dummyCategories: Category[] = [
  { id: "1", name: "Ternak" },
  { id: "2", name: "Sayur" },
  { id: "3", name: "Buah" },
];

const dummyProducts: Product[] = [
  {
    id: "1",
    code: "TRK-001",
    name: "Sapi Potong",
    category: { id: "1", name: "Ternak" },
    price: 150000,
    stock: 10,
    unit: "ekor",
    description: "Sapi potong berkualitas tinggi, berat rata-rata 500kg, dari peternakan lokal.",
    thumbnail: "https://source.unsplash.com/random/300x200/?cow",
    origin: "Lokal Indonesia",
    status: "ACTIVE",
    addedDate: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    code: "TRK-002",
    name: "Ayam Kampung",
    category: { id: "1", name: "Ternak" },
    price: 50000,
    stock: 50,
    unit: "ekor",
    description: "Ayam kampung organik, diberi pakan alami, siap potong.",
    thumbnail: "https://source.unsplash.com/random/300x200/?chicken",
    origin: "Lokal Jawa Barat",
    status: "ACTIVE",
    addedDate: "2024-02-10T00:00:00.000Z",
  },
  {
    id: "3",
    code: "TRK-003",
    name: "Kambing Etawa",
    category: { id: "1", name: "Ternak" },
    price: 2000000,
    stock: 5,
    unit: "ekor",
    description: "Kambing etawa untuk breeding atau susu, sehat dan vaksin lengkap.",
    thumbnail: "https://source.unsplash.com/random/300x200/?goat",
    origin: "Lokal Jawa Tengah",
    status: "ACTIVE",
    addedDate: "2024-03-05T00:00:00.000Z",
  },
  {
    id: "4",
    code: "SYR-001",
    name: "Bayam Organik",
    category: { id: "2", name: "Sayur" },
    price: 5000,
    stock: 100,
    unit: "kg",
    description: "Bayam segar organik, tanpa pestisida, panen harian.",
    thumbnail: "https://source.unsplash.com/random/300x200/?spinach",
    origin: "Lokal Bogor",
    status: "ACTIVE",
    addedDate: "2024-04-20T00:00:00.000Z",
  },
  {
    id: "5",
    code: "SYR-002",
    name: "Wortel Lokal",
    category: { id: "2", name: "Sayur" },
    price: 8000,
    stock: 200,
    unit: "kg",
    description: "Wortel manis dan renyah, langsung dari petani.",
    thumbnail: "https://source.unsplash.com/random/300x200/?carrot",
    origin: "Lokal Bandung",
    status: "INACTIVE",
    addedDate: "2024-05-12T00:00:00.000Z",
  },
  {
    id: "6",
    code: "SYR-003",
    name: "Kangkung Hidroponik",
    category: { id: "2", name: "Sayur" },
    price: 4000,
    stock: 150,
    unit: "kg",
    description: "Kangkung hidroponik berkualitas, bebas tanah dan pestisida.",
    thumbnail: "https://source.unsplash.com/random/300x200/?kangkung",
    origin: "Lokal Jakarta",
    status: "ACTIVE",
    addedDate: "2024-06-08T00:00:00.000Z",
  },
  {
    id: "7",
    code: "BUH-001",
    name: "Apel Malang",
    category: { id: "3", name: "Buah" },
    price: 25000,
    stock: 300,
    unit: "kg",
    description: "Apel segar dari Malang, manis dan juicy.",
    thumbnail: "https://source.unsplash.com/random/300x200/?apple",
    origin: "Lokal Malang",
    status: "ACTIVE",
    addedDate: "2024-07-15T00:00:00.000Z",
  },
  {
    id: "8",
    code: "BUH-002",
    name: "Pisang Cavendish",
    category: { id: "3", name: "Buah" },
    price: 15000,
    stock: 400,
    unit: "kg",
    description: "Pisang cavendish premium, matang sempurna.",
    thumbnail: "https://source.unsplash.com/random/300x200/?banana",
    origin: "Lokal Lampung",
    status: "ACTIVE",
    addedDate: "2024-08-20T00:00:00.000Z",
  },
  {
    id: "9",
    code: "BUH-003",
    name: "Jeruk Bali",
    category: { id: "3", name: "Buah" },
    price: 20000,
    stock: 250,
    unit: "kg",
    description: "Jeruk bali segar, kaya vitamin C, tanpa biji.",
    thumbnail: "https://source.unsplash.com/random/300x200/?orange",
    origin: "Lokal Bali",
    status: "INACTIVE",
    addedDate: "2024-09-10T00:00:00.000Z",
  },
  {
    id: "10",
    code: "TRK-004",
    name: "Bebek Pedaging",
    category: { id: "1", name: "Ternak" },
    price: 60000,
    stock: 30,
    unit: "ekor",
    description: "Bebek pedaging umur 2 bulan, siap potong.",
    thumbnail: "https://source.unsplash.com/random/300x200/?duck",
    origin: "Lokal Jawa Timur",
    status: "ACTIVE",
    addedDate: "2024-10-05T00:00:00.000Z",
  },
  {
    id: "11",
    code: "SYR-004",
    name: "Tomat Cherry",
    category: { id: "2", name: "Sayur" },
    price: 12000,
    stock: 80,
    unit: "kg",
    description: "Tomat cherry manis, cocok untuk salad.",
    thumbnail: "https://source.unsplash.com/random/300x200/?tomato",
    origin: "Lokal Yogyakarta",
    status: "ACTIVE",
    addedDate: "2024-11-15T00:00:00.000Z",
  },
  {
    id: "12",
    code: "BUH-004",
    name: "Mangga Arumanis",
    category: { id: "3", name: "Buah" },
    price: 18000,
    stock: 150,
    unit: "kg",
    description: "Mangga arumanis harum dan manis.",
    thumbnail: "https://source.unsplash.com/random/300x200/?mango",
    origin: "Lokal Probolinggo",
    status: "ACTIVE",
    addedDate: "2024-12-20T00:00:00.000Z",
  },
  // Tambahkan lebih banyak jika diperlukan untuk membuatnya lengkap
];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [origin, setOrigin] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    setCategories(dummyCategories);
    setProducts(dummyProducts);
    if (dummyCategories.length > 0 && !selectedCategoryId) setSelectedCategoryId(dummyCategories[0].id);
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterPrice, filterStatus]);

  const resetForm = () => {
    setName("");
    setCode("");
    setPrice("");
    setStock("");
    setUnit("");
    setDescription("");
    setThumbnail("");
    setOrigin("");
    setSelectedCategoryId(categories[0]?.id || "");
    setEditingProduct(null);
  };

  const openEditDrawer = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setCode(product.code);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setUnit(product.unit);
      setDescription(product.description);
      setThumbnail(product.thumbnail);
      setOrigin(product.origin);
      setSelectedCategoryId(product.category.id);
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const openDetailDrawer = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !stock || !unit || !description || !thumbnail || !origin || !selectedCategoryId || (!editingProduct && !code)) {
      toast.error("Field wajib diisi belum lengkap!");
      return;
    }

    const category = categories.find(c => c.id === selectedCategoryId) || categories[0];

    const updatedProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      code: code || editingProduct!.code,
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      unit,
      description,
      thumbnail,
      origin,
      status: editingProduct?.status || "ACTIVE",
      addedDate: editingProduct?.addedDate || new Date().toISOString(),
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      toast.success("Produk berhasil diperbarui");
    } else {
      setProducts([updatedProduct, ...products]);
      toast.success("Produk berhasil ditambahkan");
    }

    setIsEditDrawerOpen(false);
    resetForm();
  };

  const handleDeactivate = (product: Product) => {
    if (!confirm(`Nonaktifkan produk ${product.name}?`)) return;
    setProducts(products.map(p => p.id === product.id ? { ...p, status: "INACTIVE" } : p));
    toast.success("Produk berhasil dinonaktifkan");
  };

  const handleActivate = (product: Product) => {
    if (!confirm(`Aktifkan kembali produk ${product.name}?`)) return;
    setProducts(products.map(p => p.id === product.id ? { ...p, status: "ACTIVE" } : p));
    toast.success("Produk berhasil diaktifkan kembali");
  };

  // Client-side filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filterCategory || product.category.id === filterCategory;

    const matchesPrice = !filterPrice || product.price === Number(filterPrice);

    const matchesStatus = !filterStatus || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
  });

  const totalItemsCalc = filteredProducts.length;
  const totalPagesCalc = Math.ceil(totalItemsCalc / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Penjualan Produk
      </h1>

      {/* BAGIAN FILTER */}
      <div className="mb-8 relative mt-[-4px]">
        <div className="mt-9 flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 flex-1 w-full md:w-max lg:flex-none">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                options={[
                  { value: "", label: "Semua Kategori" },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name })),
                ]}
                defaultValue={filterCategory}
                onChange={(v) => setFilterCategory(v as any)}
                placeholder="Pilih kategori"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                options={[
                  { value: "", label: "Semua Status" },
                  { value: "ACTIVE", label: "Aktif" },
                  { value: "INACTIVE", label: "Tidak Aktif" },
                ]}
                defaultValue={filterStatus}
                onChange={(v) => setFilterStatus(v as any)}
                placeholder="Pilih status"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 top-[3px]">
              <Label htmlFor="searchTerm">Cari Nama</Label>
              <Search className="absolute left-3 top-[calc(50%+0.75rem)] -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                id="searchTerm"
                placeholder="Cari nama atau kode produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col">
              <Label className="opacity-0">Placeholder untuk align</Label>
              <button
                onClick={() => openEditDrawer()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Tambah Produk
              </button>
            </div>
          </div>
        </div>

        {/* Reset filter */}
        {(filterCategory || filterPrice || filterStatus || searchTerm) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setFilterCategory("");
                setFilterPrice("");
                setFilterStatus("");
                setSearchTerm("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <ComponentCard title="Daftar Produk">
        {
          loading &&
          <div className="w-full flex flex-col justify-center items-center pt-4">
            <Loader className="animate-spin w-10 h-10 text-gray-500 duration-200" />
            <p className="text-center py-4 text-[18px] text-gray-500">Sedang memuat data...</p>
          </div>
        }
        {!loading && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItemsCalc)} dari {totalItemsCalc} data
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan:</span>
                <Select
                  options={[
                    { value: "5", label: "5" },
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                  ]}
                  defaultValue={itemsPerPage.toString()}
                  onChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                  className="w-24"
                  placeholder="Pilih"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Nama
                    </th>
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Kategori
                    </th>
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Harga (Rp)
                    </th>
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Stok
                    </th>
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="dark:text-white py-4 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((product) => (
                    <tr key={product.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="dark:text-white py-3 px-6 whitespace-nowrap flex flex-col">
                        <p>
                          {product.name}
                        </p>
                        <small className="text-gray-500 font-normal">
                          {product.code}
                        </small>
                      </td>
                      <td className="dark:text-white py-3 px-6">{product.category.name}</td>
                      <td className="dark:text-white py-3 px-6">{product.price.toLocaleString("id-ID")}</td>
                      <td className="dark:text-white py-3 px-6">{product.stock} {product.unit}</td>
                      <td className="dark:text-white py-3 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {product.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="dark:text-white py-3 px-6">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openDetailDrawer(product)} title="Detail" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button onClick={() => openEditDrawer(product)} title="Edit" className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition">
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          {product.status === "ACTIVE" ? (
                            <button onClick={() => handleDeactivate(product)} title="Nonaktifkan" className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900 rounded transition">
                              <ToggleRight className="w-4 h-4 text-orange-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleActivate(product)} title="Aktifkan" className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded transition">
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
                  {searchTerm || filterCategory || filterPrice || filterStatus
                    ? "Tidak ditemukan data dengan filter tersebut."
                    : "Belum ada data produk."}
                </p>
              )}
            </div>

            {totalPagesCalc > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPagesCalc }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPagesCalc}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-xs" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold">Detail Produk</h2>
                <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <img src={selectedProduct.thumbnail} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg" />
                </div>
                <div><Label>Nama Produk</Label><p className="text-lg font-medium">{selectedProduct.name}</p></div>
                <div><Label>Kode Produk</Label><p className="text-lg">{selectedProduct.code}</p></div>
                <div><Label>Kategori</Label><p className="text-lg">{selectedProduct.category.name}</p></div>
                <div><Label>Harga</Label><p className="text-lg">Rp {selectedProduct.price.toLocaleString("id-ID")}</p></div>
                <div><Label>Stok</Label><p className="text-lg">{selectedProduct.stock} {selectedProduct.unit}</p></div>
                <div><Label>Deskripsi</Label><p className="text-lg">{selectedProduct.description}</p></div>
                <div><Label>Asal</Label><p className="text-lg">{selectedProduct.origin}</p></div>
                <div><Label>Tanggal Ditambahkan</Label><p className="text-lg">{formatDate(selectedProduct.addedDate)}</p></div>
                <div><Label>Status</Label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${selectedProduct.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {selectedProduct.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Tambah Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-xs" onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} />
          <div className="absolute inset-y-0 right-0 w-full overflow-y-auto md:max-w-[50vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                <button onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nama Produk</Label>
                      <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {!editingProduct && (
                      <div>
                        <Label htmlFor="code">Kode Produk</Label>
                        <Input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                        defaultValue={selectedCategoryId}
                        onChange={(v) => setSelectedCategoryId(v as any)}
                        placeholder="Pilih kategori"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Harga (Rp)</Label>
                      <Input type="number" id="price" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>

                    <div>
                      <Label htmlFor="stock">Stok</Label>
                      <Input type="number" id="stock" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                    </div>

                    <div>
                      <Label htmlFor="unit">Satuan</Label>
                      <Input type="text" id="unit" placeholder="kg / ekor / lusin" value={unit} onChange={(e) => setUnit(e.target.value)} />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        rows={4}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="thumbnail">Thumbnail URL</Label>
                      <Input type="text" id="thumbnail" placeholder="https://example.com/image.jpg" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                    </div>

                    <div>
                      <Label htmlFor="origin">Asal</Label>
                      <Input type="text" id="origin" placeholder="Lokal Indonesia" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                      {editingProduct ? "Simpan Perubahan" : "Simpan"}
                    </button>
                    <button type="button" onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition">
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