import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Scale,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";

// 1. Tipe Data Order (Requirement 1 & 3)
type OrderStatus = "RESERVED" | "PAID" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED";

interface Transaction {
  id: string;
  customerName: string;
  productName: string;
  category: "TERNAK" | "SAYUR" | "BUAH";
  unitType: "KG" | "UNIT"; // Requirement 1.2
  estimatedWeight: number;
  actualWeight?: number;
  pricePerUnit: number;
  status: OrderStatus;
  expiryTime: string; // ISO String (Requirement 1.3)
}

export default function OrderDetail() {
  const [order, setOrder] = useState<Transaction>({
    id: "TRX-2026-001",
    customerName: "Budi Santoso",
    productName: "Sapi Limousin A1",
    category: "TERNAK",
    unitType: "UNIT",
    estimatedWeight: 520.5,
    pricePerUnit: 75000, // Rp 75.000 / kg
    status: "PAID",
    expiryTime: new Date(Date.now() + 600000).toISOString(), // 10 menit dari sekarang
  });

  const [actualWeightInput, setActualWeightInput] = useState(0);

  // 2. Logic Partial Refund (Requirement 5)
  const calculateRefund = () => {
    if (!order.actualWeight) return 0;
    const diff = order.estimatedWeight - order.actualWeight;
    return diff > 0 ? diff * order.pricePerUnit : 0;
  };

  const handleUpdateWeight = () => {
    if (actualWeightInput <= 0) return toast.error("Berat tidak valid");
    
    // Simulasi Atomic Update (Requirement 1.1)
    setOrder(prev => ({ ...prev, actualWeight: actualWeightInput, status: "SHIPPED" }));
    toast.success("Berat aktual disimpan & Status diperbarui ke SHIPPED");
    if (order.estimatedWeight > actualWeightInput) {
      toast.info(`Sistem Escrow: Partial Refund Rp ${(calculateRefund()).toLocaleString()} diproses.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      {/* STEPPER UI (Requirement 3.1) */}
      <div className="grid grid-cols-5 gap-2 mb-10">
        {["RESERVED", "PAID", "SHIPPED", "DELIVERED", "COMPLETED"].map((s, i) => {
          const isActive = ["RESERVED", "PAID", "SHIPPED", "DELIVERED", "COMPLETED"].indexOf(order.status) >= i;
          return (
            <div key={s} className="text-center">
              <div className={`h-2 rounded-full mb-2 ${isActive ? "bg-green-500" : "bg-gray-200"}`} />
              <span className={`text-[10px] font-bold ${isActive ? "text-green-600" : "text-gray-400"}`}>{s}</span>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* INFORMASI UTAMA */}
          <ComponentCard title={`Detail Pesanan #${order.id}`}>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="font-bold text-xl">{order.productName}</h3>
                  <p className="text-gray-500">Pelanggan: {order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estimasi Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {(order.estimatedWeight * order.pricePerUnit).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* TIMER (Requirement 1.3) */}
              {order.status === "RESERVED" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <p className="text-sm font-medium">Selesaikan pembayaran dalam 10:00 menit atau stok akan dikembalikan (Auto-Restock).</p>
                </div>
              )}
            </div>
          </ComponentCard>

          {/* WEIGHT ADJUSTMENT (Requirement 5) */}
          <ComponentCard title="Logistik & Penimbangan">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg"><Scale className="text-orange-600" /></div>
              <div className="flex-1">
                <p className="font-bold">Penyesuaian Berat Akhir</p>
                <p className="text-sm text-gray-500 mb-4">Wajib diisi setelah hewan ditimbang ulang sebelum kirim.</p>
                
                {order.actualWeight ? (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Berat Estimasi: <b>{order.estimatedWeight}kg</b></span>
                      <span>Berat Aktual: <b>{order.actualWeight}kg</b></span>
                    </div>
                    {order.estimatedWeight > order.actualWeight && (
                      <div className="text-blue-600 font-bold text-sm">
                        ✓ Partial Refund Berhasil: Rp {calculateRefund().toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Masukkan berat aktual..."
                      className="flex-1 border p-2 rounded-lg"
                      onChange={(e) => setActualWeightInput(Number(e.target.value))}
                    />
                    <button 
                      onClick={handleUpdateWeight}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      Konfirmasi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* SIDEBAR: CHAT & RESOLUTION (Requirement 4) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-sm h-[500px] flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="font-bold">Resolution Center</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 text-sm mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mr-8">
                Sapi sudah siap dikirim. Mohon konfirmasi berat aktualnya.
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
                Oke, lampirkan foto timbangan digitalnya ya. (Audit Trail)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input className="flex-1 text-sm border p-2 rounded-lg" placeholder="Kirim pesan bukti..." />
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">
                Pesan ditandai sebagai bukti hukum (Requirement 4.1)
              </p>
            </div>
          </div>

          {/* ESCROW INFO (Requirement 3) */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 rounded-2xl">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2 font-bold">
              <ShieldCheck className="w-5 h-5" /> Escrow Aktif
            </div>
            <p className="text-xs text-green-600 leading-relaxed">
              Dana Anda aman di sistem. Akan otomatis cair ke penjual 2 jam setelah status <b>DELIVERED</b> jika tidak ada komplain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}