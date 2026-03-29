import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader,
  Search,
  Upload,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

// URL API Backend
const API_URL = "https://be-kirafarm.kiraproject.id/api/withdraw";

interface Withdrawal {
  id: string;
  sellerId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "SUCCESS" | "REJECTED";
  adminNote: string | null;
  proofOfTransfer: string | null;
  createdAt: string;
  seller?: {
    namaToko: string;
  };
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State untuk Custom Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"SUCCESS" | "REJECTED" | null>(null);

  // Drawer States
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form States
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setWithdrawals(result.data);
      } else {
        toast.error(result.message || "Gagal mengambil data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Handler Pilih File dengan Validasi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Tipe
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file harus JPG atau PNG");
      return;
    }

    // Validasi Ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setProofFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdateStatus = async (status: "SUCCESS" | "REJECTED") => {
    if (!selectedWithdrawal) return;

    // Validasi khusus untuk Approve
    if (status === "SUCCESS" && !proofFile) {
      return toast.error("Wajib mengunggah bukti transfer untuk menyetujui!");
    }

    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${status}?`)) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("status", status);
      formData.append("adminNote", adminNote);
      if (proofFile) formData.append("proof", proofFile);

      const res = await fetch(`${API_URL}/admin/status/${selectedWithdrawal.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchWithdrawals();
        closeDetailDrawer();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal memproses permintaan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
    setSelectedWithdrawal(null);
    setAdminNote("");
    setProofFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filtered = withdrawals.filter((wd) => {
    const searchStr = `${wd.seller?.namaToko || ""} ${wd.accountName} ${wd.id}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || wd.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Fungsi yang dipanggil saat tombol Approve/Reject di klik
  const triggerConfirm = (status: "SUCCESS" | "REJECTED") => {
    if (status === "SUCCESS" && !proofFile) {
      return toast.error("Wajib mengunggah bukti transfer!");
    }
    setPendingStatus(status);
    setShowConfirmModal(true);
  };

  // Fungsi eksekusi final (dipanggil dari dalam Modal)
  const executeUpdateStatus = async () => {
    if (!selectedWithdrawal || !pendingStatus) return;

    setShowConfirmModal(false); // Tutup modal konfirmasi
    setIsSubmitting(true);      // Aktifkan overlay loading di Drawer
    
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("status", pendingStatus);
      formData.append("adminNote", adminNote);
      if (proofFile) formData.append("proof", proofFile);

      const res = await fetch(`${API_URL}/admin/status/${selectedWithdrawal.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchWithdrawals();
        closeDetailDrawer();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal memproses permintaan");
    } finally {
      setIsSubmitting(false);
      setPendingStatus(null);
    }
  };

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Penarikan Dana
      </h1>

      {/* Filter & Search Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label htmlFor="search">Cari Transaksi</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari toko atau nama rekening..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
          <Label htmlFor="status">Status</Label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="SUCCESS">Berhasil</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      <ComponentCard title="Daftar Permintaan">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin w-10 h-10 text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Tanggal</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Toko</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Nominal</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {currentData.map((wd) => (
                  <tr key={wd.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-4 px-6 text-sm dark:text-gray-300">
                      {new Date(wd.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {wd.seller?.namaToko || "Unknown"}
                    </td>
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">
                      {formatIDR(Number(wd.amount))}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                        wd.status === "SUCCESS" ? "bg-green-100 text-green-700" :
                        wd.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => { setSelectedWithdrawal(wd); setIsDetailDrawerOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>

      {/* Pagination (Opsional jika data banyak) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">Hal {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Drawer: Detail & Approve */}
      {isDetailDrawerOpen && selectedWithdrawal && (
        <div className="fixed inset-0 z-[999999999] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col animate-slide-left relative">
            
            {/* OVERLAY BLUE MODERN SAAT SUBMITTING */}
            {isSubmitting && (
              <div className="absolute inset-0 z-[100] bg-blue-600/10 backdrop-blur-[2px] flex flex-col items-center justify-center animate-pulse">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-sm font-bold dark:text-white">Memproses Data...</p>
                </div>
              </div>
            )}

            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Detail Penarikan</h2>
              <button onClick={closeDetailDrawer} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                  <span className="text-gray-500 text-sm">Toko</span>
                  <span className="font-bold text-sm dark:text-white">{selectedWithdrawal.seller?.namaToko}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                  <span className="text-gray-500 text-sm">Nominal</span>
                  <span className="font-bold text-blue-600 text-lg">{formatIDR(Number(selectedWithdrawal.amount))}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Rekening Tujuan</p>
                  <p className="font-bold dark:text-white">{selectedWithdrawal.bankName}</p>
                  <p className="text-sm dark:text-gray-300">{selectedWithdrawal.accountNumber}</p>
                  <p className="text-sm dark:text-gray-300 font-medium italic">a/n {selectedWithdrawal.accountName}</p>
                </div>
              </div>

              {/* Tampilkan Bukti Transfer jika sudah SUKSES */}
              {selectedWithdrawal.proofOfTransfer && (
                <div className="space-y-2">
                  <Label>Bukti Transfer Tersimpan</Label>
                  <a href={selectedWithdrawal.proofOfTransfer} target="_blank" rel="noreferrer" className="block group relative rounded-xl overflow-hidden border dark:border-gray-700 shadow-sm">
                    <img src={selectedWithdrawal.proofOfTransfer} alt="Bukti TF" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                       <span className="text-white text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">Lihat Full Gambar</span>
                    </div>
                  </a>
                </div>
              )}

              {/* CUSTOM MODERN CONFIRMATION MODAL */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                  {/* Overlay Blue Backdrop */}
                  <div 
                    className="absolute inset-0 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => !isSubmitting && setShowConfirmModal(false)}
                  ></div>

                  {/* Modal Content */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Dekorasi Background */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${pendingStatus === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-2xl ${pendingStatus === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {pendingStatus === 'SUCCESS' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-black dark:text-white uppercase tracking-tight"> Konfirmasi Aksi </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                          Apakah Anda yakin ingin mengubah status transaksi ini menjadi 
                          <span className={`font-bold ml-1 ${pendingStatus === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                            {pendingStatus === 'SUCCESS' ? 'approval' : 'reject'}
                          </span>?
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full pt-4">
                        <button 
                          onClick={() => setShowConfirmModal(false)}
                          className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs uppercase hover:bg-gray-200 transition-all active:scale-95"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={executeUpdateStatus}
                          className={`py-3 px-4 text-white rounded-xl font-bold text-xs uppercase shadow-lg transition-all active:scale-95 ${
                            pendingStatus === 'SUCCESS' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                          }`}
                        >
                          Ya, Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Approval Admin (Hanya muncul jika PENDING) */}
              {selectedWithdrawal.status === "PENDING" && (
                <div className="pt-6 border-t dark:border-gray-800 space-y-5">
                  <div className="space-y-3">
                    <Label>Upload Bukti Transfer <span className="text-red-500">*</span></Label>
                    
                    {!previewUrl ? (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 transition hover:border-blue-500 group cursor-pointer bg-gray-50/50 dark:bg-gray-800/20">
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png"
                          id="proof-upload"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="proof-upload" className="flex flex-col items-center justify-center cursor-pointer">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3 group-hover:scale-110 transition">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm font-bold dark:text-white">Pilih Screenshot Bukti TF</p>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">JPG, PNG (Maks. 2MB)</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-blue-100 dark:border-blue-900 group shadow-lg">
                        <img src={previewUrl} alt="Preview" className="w-full h-52 object-cover" />
                        <button 
                          onClick={() => { setProofFile(null); setPreviewUrl(null); }}
                          className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full shadow-xl hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                           <p className="text-[11px] text-white font-medium truncate">{proofFile?.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="admin-note">Catatan Admin</Label>
                    <textarea
                      id="admin-note"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Masukkan catatan atau nomor referensi bank..."
                      className="w-full mt-1 p-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => triggerConfirm("REJECTED")}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" /> Tolak
                    </button>

                    <button 
                      onClick={() => triggerConfirm("SUCCESS")}
                      disabled={isSubmitting || !proofFile}
                      className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white transition active:scale-95 shadow-xl ${
                        !proofFile ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Catatan lama jika sudah diproses */}
              {selectedWithdrawal.status !== "PENDING" && selectedWithdrawal.adminNote && (
                 <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Catatan Admin:</p>
                    <p className="text-sm italic dark:text-gray-300 font-medium">"{selectedWithdrawal.adminNote}"</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}