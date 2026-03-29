import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import {
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  ShoppingCart,
  X
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import AdminChatSidebar from "../../components/common/AdminChatSidebar";

// --- INTERFACES ---
interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  actualWeight?: number;
  subtotal: number;
  unit: string;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  shippingAddress: string;
  shippingCost: number;
  items: SaleItem[];
  totalAmount: number;
  status:
  | "PENDING"
  | "WAITING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  unitType: "INTEGER" | "DECIMAL";
  stock: number;
}

// --- REUSABLE COMPONENTS ---
const ComponentCard = ({ children, title, onRefresh, isFetching }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>
      {onRefresh && (
        <button onClick={onRefresh} className={`p-2 hover:bg-gray-100 rounded-full transition ${isFetching ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Label = ({ children, className }: any) => <label className={`block text-xs font-bold text-gray-500 uppercase mb-1 ${className}`}>{children}</label>;
const Input = (props: any) => <input {...props} className={`w-full p-3 bg-white dark:bg-gray-800 border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-50 ${props.className}`} />;

export default function SalesManagement() {
  const queryClient = useQueryClient();

  // --- UI STATES ---
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [saleItems, setSaleItems] = useState<Partial<SaleItem>[]>([]);
  const [tempWeights, setTempWeights] = useState<Record<string, number>>({});
  const [inputShipping, setInputShipping] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const BASE_URL = 'https://be-kirafarm.kiraproject.id'
  const steps = [
    { key: "PENDING", label: "Pending", desc: "Menunggu ongkir" },
    { key: "WAITING_PAYMENT", label: "Waiting Pay", desc: "Menunggu pembayaran" },
    { key: "PROCESSING", label: "Processing", desc: "Diproses" },
    { key: "SHIPPED", label: "Shipped", desc: "Dikirim" },
    { key: "DELIVERED", label: "Delivered", desc: "Sampai" },
    { key: "COMPLETED", label: "Completed", desc: "Selesai" }
  ];

 // --- QUERIES ---
  const { data: sales = [], isLoading: isSalesLoading, isFetching: isSalesFetching, refetch: refetchSales } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      // 1. Ambil data user dari localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      // 2. Inisialisasi URL
      let url = `${BASE_URL}/api/sales`;
      
      // 3. Cek Role & Ambil seller.id sesuai struktur lokasStorage kamu
      if (user?.role === "SELLER" && user?.seller?.id) {
        const params = new URLSearchParams();
        params.append("sellerId", user.seller.id); // Mengambil dari user.seller.id
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data penjualan");
      
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/products`);
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // --- MUTATIONS ---
  const createSaleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${BASE_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal membuat pesanan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Pesanan berhasil dibuat!");
      setIsAddDrawerOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
      const res = await fetch(`${BASE_URL}/api/sales/${id}`, {
        method: 'PUT', // Sesuaikan dengan router.put di backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.message || "Gagal memperbarui status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Data berhasil diperbarui!");
      if (selectedSale) {
        setSelectedSale(data.data);
      }
    },
    onError: (err: any) => toast.error(err.message)
  });

  // --- LOGIC HELPER ---
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const resetForm = () => {
    setCustomerName("");
    setShippingAddress("");
    setSaleItems([]);
  };

  const addSaleItem = () => setSaleItems([...saleItems, { productId: "", productName: "", price: 0, quantity: 0, subtotal: 0, unit: "" }]);

  const updateNewItem = (index: number, field: string, value: any) => {
    const updated = [...saleItems];
    if (field === "productId") {
      const p = products.find(x => x.id === value);
      if (p) {
        updated[index] = { 
            ...updated[index], 
            productId: p.id, 
            productName: p.name, 
            price: p.price, 
            unit: p.unit, 
            quantity: p.unitType === "INTEGER" ? 1 : 0.5 
        };
      }
    } else if (field === "quantity") {
      const p = products.find(x => x.id === updated[index].productId);
      let val = parseFloat(value) || 0;
      if (p?.unitType === "INTEGER") val = Math.floor(val);
      updated[index].quantity = val;
    }
    updated[index].subtotal = (updated[index].price || 0) * (updated[index].quantity || 0);
    setSaleItems(updated);
  };

  const submitNewSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) return toast.error("Pilih minimal 1 produk");
    createSaleMutation.mutate({ customerName, shippingAddress, items: saleItems });
  };

  const handleUpdateStatus = (status: Sale["status"], extra?: any) => {
    if (!selectedSale) return;

    // Gabungkan status baru dan extra (seperti shippingCost) 
    // dengan data items yang sudah ada agar tidak ditolak backend
    const payload = {
      status,
      items: selectedSale.items, // Sertakan items yang sudah ada
      customerName: selectedSale.customerName,
      ...extra
    };
    updateStatusMutation.mutate({ id: selectedSale.id, payload });
  };

  if (isSalesLoading) return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="font-bold text-gray-500">Memuat Data Transaksi...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Data Transaksi Pembelian
            <button 
                onClick={() => { refetchSales(); toast.info("Me-refresh data..."); }} 
                className={`p-2 rounded-full hover:bg-gray-200 transition ${isSalesFetching ? 'animate-spin' : ''}`}
            >
                <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </h1>
          <p className="text-gray-500">Manajemen Logistik & Escrow Kirafarm</p>
        </div>
        <button onClick={() => { resetForm(); setIsAddDrawerOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95 font-bold">
          <Plus className="w-5 h-5" /> Transaksi Baru
        </button>
      </div>

      <ComponentCard title="Semua Aktivitas Penjualan">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b">
                <th className="p-4">Invoice / Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tagihan Akhir</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{s.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{s.customerName}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      s.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                      s.status === 'WAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                      s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      s.status === 'PROCESSING' ? 'bg-blue-100 text-blue-600' :
                      s.status === 'SHIPPED' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{formatCurrency(Number(s.totalAmount) + Number(s.shippingCost))}</td>
                  <td className="p-4 text-center flex items-center gap-2">
                    <button 
                        onClick={() => { setSelectedSale(s); setTempWeights({}); setInputShipping(""); setIsDetailDrawerOpen(true); }} 
                        className="p-2 hover:bg-green-700 bg-green-600 border-4 border-green-300 rounded-xl text-white transition"
                    >
                      <DollarSign className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setChatOrderId(s.id);
                        setIsChatOpen(true);
                      }}
                      className="p-2 hover:bg-blue-700 bg-blue-600 border-4 border-blue-300 rounded-xl text-white transition"
                    >
                      <MessageSquare className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && <div className="p-10 text-center text-gray-400 font-medium italic">Belum ada transaksi terdaftar.</div>}
        </div>
      </ComponentCard>

      {isChatOpen && chatOrderId && (
        <div className="fixed inset-0 z-[999999] bg-black/30 backdrop-blur-sm flex justify-end">
          
          {/* OVERLAY CLICK (buat close) */}
          <div 
            className="absolute inset-0"
            onClick={() => setIsChatOpen(false)}
          />

          {/* SIDEBAR */}
          <div className="relative z-10">
            <AdminChatSidebar
              orderId={chatOrderId}
              onClose={() => setIsChatOpen(false)}
            />
          </div>

        </div>
      )}

      {/* DRAWER: TRANSAKSI BARU */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-[99999999] bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
              <h2 className="text-2xl font-black flex items-center gap-3"><ShoppingCart className="text-blue-600"/> Checkout Pesanan</h2>
              <button onClick={() => setIsAddDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
            </div>
            <form onSubmit={submitNewSale} className="space-y-6">
                <div>
                  <Label>Identitas Pelanggan</Label>
                  <Input placeholder="Nama Pelanggan..." value={customerName} onChange={(e:any) => setCustomerName(e.target.value)} required />
                </div>
                <div>
                  <Label>Alamat Pengiriman</Label>
                  <textarea 
                    className="w-full p-3 bg-white border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <Label>Daftar Produk</Label>
                  <button type="button" onClick={addSaleItem} className="text-blue-600 text-xs font-black uppercase hover:underline">+ Tambah Produk</button>
                </div>
                {saleItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-2xl border border-black/5">
                    <div className="col-span-7">
                      <select className="w-full p-2 bg-transparent border-b border-black/10 outline-none text-sm font-medium" onChange={(e) => updateNewItem(idx, "productId", e.target.value)} required>
                        <option value="">Pilih Produk...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)}/{p.unit})</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <Input type="number" step="0.01" value={item.quantity} onChange={(e:any) => updateNewItem(idx, "quantity", e.target.value)} />
                    </div>
                    <div className="col-span-1 text-right px-1">
                      <button type="button" onClick={() => setSaleItems(saleItems.filter((_, i) => i !== idx))}><X className="w-5 h-5 text-red-400 hover:text-red-600"/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
                <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Total Produk</p>
                <p className="text-4xl font-black">{formatCurrency(saleItems.reduce((s, i) => s + (i.subtotal || 0), 0))}</p>
              </div>
              <button disabled={createSaleMutation.isPending} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all disabled:bg-gray-400">
                {createSaleMutation.isPending ? "Memproses..." : "Simpan Pesanan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: DETAIL & WORKFLOW */}
      {isDetailDrawerOpen && selectedSale && (
        <div className="fixed inset-0 z-[99999999] bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="w-full h-max">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">{selectedSale.invoiceNumber}</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{selectedSale.customerName}</p>
                </div>
                <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X/></button>
              </div>

              <div className="flex-1 overflow-y-auto h-max p-4 space-y-8">
                {/* STEPPER STATUS */}
                <div className="flex justify-between relative px-2">
                  <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10" />

                  {steps.map((st) => {
                    const order = steps.map(s => s.key);
                    const isActive = selectedSale.status === st.key;
                    const isPast = order.indexOf(selectedSale.status) > order.indexOf(st.key);

                    return (
                      <div key={st.key} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${
                            isActive
                              ? "bg-blue-600 text-white scale-125 ring-4 ring-blue-50"
                              : isPast
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>

                        <p className="text-[10px] text-slate-600 mt-3 font-bold">
                          {st.label}
                        </p>

                        {/* <p className="text-[9px] text-gray-400">
                          {st.desc}
                        </p> */}
                      </div>
                    );
                  })}
                </div>

                {/* ALAMAT PENGIRIMAN */}
                <div className="p-5 mt-4 bg-gray-50 rounded-3xl border border-black/5 space-y-2">
                  <div className="flex items-center gap-2 text-gray-800 font-black text-xs uppercase opacity-60"><MapPin className="w-4 h-4" /> Alamat Tujuan</div>
                  <p className="text-sm font-bold text-gray-700">{selectedSale.shippingAddress}</p>
                </div>

                {/* RINCIAN FINANSIAL */}
                <div className="p-6 bg-gray-900 rounded-3xl text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between text-sm opacity-70"><span>Total Produk</span><span>{formatCurrency(Number(selectedSale.totalAmount))}</span></div>
                  <div className="flex justify-between text-sm opacity-70"><span>Ongkos Kirim</span><span>{formatCurrency(Number(selectedSale.shippingCost))}</span></div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <p className="text-[11px] font-black uppercase">Net Total Tagihan</p>
                    <p className="text-3xl font-black">{formatCurrency(Number(selectedSale.totalAmount) + Number(selectedSale.shippingCost))}</p>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-6 border-t bg-gray-50 space-y-4">
                
                {/* 1. AREA DINAMIS BERDASARKAN STATUS SAAT INI */}
                <div className="flex flex-col gap-4">
                  
                  {/* STATUS: PENDING (Input Ongkir) */}
                  {selectedSale.status === "PENDING" && (
                    <div className="w-full p-5 border-2 border-blue-600 bg-blue-50 rounded-3xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <h3 className="text-blue-600 font-black text-xs uppercase">Atur Ongkos Kirim</h3>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Masukkan nominal ongkir..."
                          value={inputShipping}
                          onChange={(e: any) => setInputShipping(e.target.value)}
                          className="flex-1"
                        />
                        <button
                          disabled={!inputShipping || updateStatusMutation.isPending}
                          onClick={() =>
                            handleUpdateStatus("WAITING_PAYMENT", {
                              shippingCost: parseFloat(inputShipping)
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition-colors disabled:bg-gray-300"
                        >
                          {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUS: WAITING PAYMENT */}
                  {selectedSale.status === "WAITING_PAYMENT" && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
                      <p className="text-yellow-700 font-bold text-sm flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Menunggu Pembayaran Pelanggan...
                      </p>
                    </div>
                  )}

                  {/* STATUS: PROCESSING (Verifikasi Berat/Quantity Riil) */}
                  {selectedSale.status === "PROCESSING" && (
                    <div className="p-5 border-2 border-orange-200 bg-orange-50 rounded-3xl space-y-4">
                      <h3 className="text-orange-600 font-black text-xs uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Verifikasi Timbangan Akhir
                      </h3>

                      <div className="space-y-3">
                        {selectedSale.items.map((item) => (
                          <div key={item.productId} className="grid grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-orange-100">
                            <div>
                              <Label className="text-[10px]">Estimasi ({item.unit})</Label>
                              <p className="font-bold text-gray-700">{item.quantity}</p>
                            </div>
                            <div>
                              <Label className="text-[10px]">Berat Riil</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={tempWeights[item.productId] || ""}
                                onChange={(e: any) =>
                                  setTempWeights((prev) => ({
                                    ...prev,
                                    [item.productId]: parseFloat(e.target.value)
                                  }))
                                }
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        disabled={updateStatusMutation.isPending}
                        onClick={() => {
                          const finalItems = selectedSale.items.map(item => ({
                            ...item,
                            quantity: tempWeights[item.productId] || item.quantity // Override quantity dengan berat riil
                          }));
                          handleUpdateStatus("SHIPPED", { items: finalItems });
                        }}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                      >
                        {updateStatusMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Pesanan (Shipped)"}
                      </button>
                    </div>
                  )}

                  {/* STATUS: SHIPPED */}
                  {selectedSale.status === "SHIPPED" && (
                    <button
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleUpdateStatus("DELIVERED")}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Konfirmasi Sampai (Delivered)"}
                    </button>
                  )}

                  {/* STATUS: DELIVERED */}
                  {selectedSale.status === "DELIVERED" && (
                    <button
                      disabled={updateStatusMutation.isPending}
                      onClick={() => {
                        if (confirm("Selesaikan transaksi? Saldo akan diteruskan ke seller.")) {
                          handleUpdateStatus("COMPLETED");
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Selesaikan & Cairkan Saldo"}
                    </button>
                  )}
                </div>

                {/* 2. TOMBOL CANCEL (Tampil jika status belum final) */}
                {!["COMPLETED", "CANCELLED", "EXPIRED"].includes(selectedSale.status) && (
                  <button
                    disabled={updateStatusMutation.isPending}
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full group flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 font-bold bg-red-100 transition-colors border-2 hover:bg-red-200 border-red-400"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Batalkan Pesanan
                  </button>
                )}

                {/* 3. STATUS FINAL (ReadOnly) */}
                {selectedSale.status === "COMPLETED" && (
                  <div className="w-full bg-green-100 border border-green-200 text-green-700 p-4 rounded-2xl text-center font-black flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> TRANSAKSI BERHASIL DISELESAIKAN
                  </div>
                )}

                {["CANCELLED", "EXPIRED"].includes(selectedSale.status) && (
                  <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-center font-black flex items-center justify-center gap-2">
                    <X className="w-5 h-5" /> PESANAN INI TELAH DIBATALKAN
                  </div>
                )}

              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: KONFIRMASI PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[999999999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsCancelModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
                <X className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                Batalkan Pesanan?
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed px-2">
                Tindakan ini akan menghentikan seluruh proses transaksi. Saldo yang terkait akan dikembalikan/disesuaikan otomatis.
              </p>
            </div>
            
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 active:scale-[0.97] py-5 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest"
              >
                Kembali
              </button>
              <button 
                onClick={() => {
                  handleUpdateStatus("CANCELLED");
                  setIsCancelModalOpen(false);
                }}
                className="flex-1 active:scale-[0.97] py-5 text-sm font-black text-red-600 bg-red-100 hover:bg-red-200 border-l border-gray-100 transition-colors uppercase tracking-widest"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}