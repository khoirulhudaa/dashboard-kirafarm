import {
  Eye,
  Loader,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

// 1. Interface Data Seller - DISESUAIKAN DENGAN MODEL & ALIAS
interface Seller {
  id: string;
  userId: string;
  nama: string;
  nik: string;
  namaToko: string;
  slug: string;
  email: string;
  whatsapp: string;
  alamat: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  fotoKtp: string;        // Sesuai Model
  fotoNpwp: string;  // Sesuai Model
  fotoProduk: string;      // Sesuai Model
  bank: string;
  rekening: string;
  namaRekening: string;
  createdAt: string;
  account?: {             // Relasi as: 'account'
    id: string;
    name: string;
    email: string;
  };
}

export default function SellerManagement() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Fetch Data dari endpoint Admin
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      // Gunakan route admin list
      const response = await fetch("https://be-kirafarm.kiraproject.id/api/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setSellers(result.data);
      } else {
        toast.error(result.message || "Gagal memuat data");
      }
    } catch (error) {
      toast.error("Kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // 3. Update Status (Approve/Reject)
  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!confirm(`Yakin ingin ${newStatus === "APPROVED" ? "menyetujui" : "menolak"} seller ini?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("accessToken");
      // Gunakan route admin status
      const response = await fetch(`https://be-kirafarm.kiraproject.id/api/seller/status/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setIsDetailDrawerOpen(false);
        fetchSellers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal memproses permintaan");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch =
      s.nama.toLowerCase().includes(searchStr) ||
      s.namaToko.toLowerCase().includes(searchStr) ||
      s.account?.name.toLowerCase().includes(searchStr);
    const matchesStatus = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currentData = filteredSellers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Verifikasi Seller</h1>
        <button onClick={fetchSellers} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">Refresh Data</button>
      </div>

      <div className="mb-8 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Label>Cari Seller / Akun</Label>
          <Input 
            placeholder="Cari toko atau nama pemilik..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            options={[
              { value: "", label: "Semua" },
              { value: "PENDING", label: "Menunggu" },
              { value: "APPROVED", label: "Disetujui" },
              { value: "REJECTED", label: "Ditolak" },
            ]}
            onChange={(v) => setFilterStatus(v as string)}
          />
        </div>
      </div>

      <ComponentCard title="Daftar Pengajuan">
        {loading ? (
          <div className="flex justify-center py-10"><Loader className="animate-spin" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 text-xs font-bold uppercase">Toko</th>
                <th className="p-4 text-xs font-bold uppercase">Pemilik (Account)</th>
                <th className="p-4 text-xs font-bold uppercase">Status</th>
                <th className="p-4 text-xs font-bold uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-4">
                    <p className="font-bold">{s.namaToko}</p>
                    <p className="text-xs text-slate-400">@{s.slug}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{s.account?.name || s.nama}</p>
                    <p className="text-xs text-slate-400">{s.account?.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                      s.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                      s.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>{s.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => { setSelectedSeller(s); setIsDetailDrawerOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ComponentCard>

      {/* DETAIL DRAWER */}
      {isDetailDrawerOpen && selectedSeller && (
        <div className="fixed inset-0 z-[999999999] flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto p-8 space-y-8 animate-in slide-in-from-right">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-black">Detail Verifikasi</h2>
              <button onClick={() => setIsDetailDrawerOpen(false)}><X /></button>
            </div>

            {/* FOTO DOKUMEN - DISESUAIKAN NAMA PROPERTI */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Foto KTP</Label>
                <img src={selectedSeller.fotoKtp} className="rounded-xl border h-40 w-full object-cover" />
              </div>
              <div>
                <Label>Foto NPWP</Label>
                <img src={selectedSeller.fotoNpwp} className="rounded-xl border h-40 w-full object-cover" />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Rekening Tujuan</p>
              <p className="text-lg font-black">{selectedSeller.rekening} ({selectedSeller.bank})</p>
              <p className="italic text-slate-600">a.n {selectedSeller.namaRekening}</p>
            </div>

            {selectedSeller.status === 'PENDING' && (
              <div className="flex gap-4">
                <button disabled={actionLoading} onClick={() => handleUpdateStatus(selectedSeller.id, 'REJECTED')} className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl">Tolak</button>
                <button disabled={actionLoading} onClick={() => handleUpdateStatus(selectedSeller.id, 'APPROVED')} className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200">Setujui</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}