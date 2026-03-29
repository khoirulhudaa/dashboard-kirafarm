import {
  Building2, CreditCard,
  FileText,
  Globe,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Pen,
  Phone,
  User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";

const API_BASE_URL = "https://be-kirafarm.kiraproject.id/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  seller?: {
    id: string;
    namaToko: string;
    alamat: string;
    whatsapp: string;
    bank: string;
    bankCode: string;
    rekening: string;
    namaRekening: string;
    deskripsi: string;
    slug: string;
    fotoKtp: string;
    balance: number;       
    totalEarnings: number;
    fotoNpwp: string;
  } | null;
}

const roleLabels: Record<string, string> = {
  OWNER: "Pemilik Usaha",
  ADMIN: "Administrator",
  STAFF: "Staf Penjualan",
  WAREHOUSE: "Petugas Gudang",
  BUYER: "Pembeli",
  SELLER: "Penjual / Mitra",
};

export default function UserProfiles() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    namaToko: "",
    alamat: "",
    whatsapp: "",
    deskripsi: "",
    bank: "",
    rekening: "",
    namaRekening: "",
  });

  const fetchUserData = async () => {
    try {
      setIsInitialLoading(true);
      const token = localStorage.getItem("accessToken");
      const savedUserStr = localStorage.getItem("user");
      if (!token || !savedUserStr) return;

      const savedUser = JSON.parse(savedUserStr);
      const response = await fetch(`${API_BASE_URL}/user/get-profile/${savedUser.id}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setUser(result.data);
        setProfileForm({
          name: result.data.name || "",
          phone: result.data.phone || "",
          namaToko: result.data.seller?.namaToko || "",
          alamat: result.data.seller?.alamat || "",
          whatsapp: result.data.seller?.whatsapp || "",
          deskripsi: result.data.seller?.deskripsi || "",
          bank: result.data.seller?.bank || "",
          rekening: result.data.seller?.rekening || "",
          namaRekening: result.data.seller?.namaRekening || "",
        });
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi data");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  const handleWithdrawRequest = async () => {
    const amountNum = parseFloat(withdrawAmount);
    const currentBalance = user?.seller?.balance || 0;
    const minimumRemaining = 10000; // Saldo yang harus tersisa
    const minimumWithdraw = 50000; // Minimal tarik 50rb

    // 1. Validasi Input Kosong atau Bukan Angka
    if (!withdrawAmount || isNaN(amountNum)) {
      return toast.error("Masukkan jumlah nominal yang valid");
    }

    // 2. Validasi Minimal Penarikan 50rb
    if (amountNum < minimumWithdraw) {
      return toast.error(`Minimal penarikan adalah Rp ${minimumWithdraw.toLocaleString("id-ID")}`);
    }

    // 3. Validasi Saldo Mencukupi
    if (amountNum > currentBalance) {
      return toast.error("Saldo Anda tidak mencukupi");
    }

    // 4. Validasi Saldo Mengendap (Harus sisa 10rb)
    if (currentBalance - amountNum < minimumRemaining) {
      return toast.error(`Penarikan gagal. Anda harus menyisakan minimal Rp ${minimumRemaining.toLocaleString("id-ID")} di saldo Anda.`);
    }

    try {
      setWithdrawLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/withdraw/request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountNum }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Permintaan penarikan berhasil dikirim!");
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
        fetchUserData(); // Refresh balance di UI
      } else {
        toast.error(result.message || "Gagal memproses penarikan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveProfileLoading(true);
      const token = localStorage.getItem("accessToken");
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        ...(user?.role === "SELLER" && {
          namaToko: profileForm.namaToko,
          whatsapp: profileForm.whatsapp,
          alamat: profileForm.alamat,
          deskripsi: profileForm.deskripsi,
          bank: profileForm.bank,
          rekening: profileForm.rekening,
          namaRekening: profileForm.namaRekening,
        })
      };

      const response = await fetch(`${API_BASE_URL}/user/update-profile-full/${user?.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Profil berhasil diperbarui!");
        setUser(result.data); 
        setIsEditProfileOpen(false);
        const updatedLocalUser = { ...JSON.parse(localStorage.getItem("user") || "{}"), name: result.data.name };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaveProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validasi sederhana
      if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        return toast.error("Semua field password wajib diisi");
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return toast.error("Konfirmasi password baru tidak cocok");
      }
      if (passwordForm.newPassword.length < 6) {
        return toast.error("Password baru minimal 6 karakter");
      }

      setChangePasswordLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/user/${user?.id}/password`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password berhasil diubah!");
        setIsChangePasswordOpen(false);
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.message || "Gagal mengubah password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Profil Lengkap | KiraFarm" description="Detail Akun & Bisnis" />
      <PageBreadcrumb pageTitle="Profil Saya" />
      
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
         {/* FINANCIAL OVERVIEW SECTION */}
        {user?.role === "SELLER" && user.seller && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Total Earnings Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  Rp {user.seller.totalEarnings?.toLocaleString("id-ID") || "0"}
                </h3>
                <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1">
                  <Globe size={10}/> Akumulasi penjualan selesai
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <Building2 size={120} />
              </div>
            </div>

            {/* Current Balance Card */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/20 dark:bg-blue-900/10 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Saldo Tersedia (Balance)</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-3xl font-black text-blue-700 dark:text-blue-400">
                    Rp {user.seller.balance?.toLocaleString("id-ID") || "0"}
                  </h3>
                  <Button 
                    onClick={() => setIsWithdrawOpen(true)} // Ubah ini
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg shadow-blue-200 dark:shadow-none"
                  >
                    <CreditCard size={16} className="mr-2"/> Tarik Dana
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      
        {/* HEADER SECTION */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                  <UserIcon size={40} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-500 font-medium">{user?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white uppercase tracking-wider">
                  {roleLabels[user?.role || ""] || user?.role}
                </span>
              </div>
            </div>

            <Button onClick={() => setIsEditProfileOpen(true)} className="rounded-xl px-6 py-2.5">
              <Pen size={16} className="mr-2"/> Edit Profil
            </Button>
          </div>
        </div>

        {/* MAIN GRID - Menggunakan items-stretch agar tinggi kiri dan kanan sama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* KOLOM KIRI: KONTAK */}
          <div className="h-full">
            <div className="h-full rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col">
              <h4 className="text-sm font-bold text-gray-400 uppercase mb-6 tracking-widest">Kontak & Keamanan</h4>
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"><Phone size={20} className="text-slate-500"/></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">No. WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.phone || "-"}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full mt-6 flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                  <Lock size={18}/>
                  <span className="text-sm font-bold">Ganti Password</span>
                </div>
                <Info size={16}/>
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: BISNIS */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col">
              {user?.role === "SELLER" && user.seller ? (
                <>
                  <div className="flex items-center gap-2 mb-6 text-blue-600">
                    <Building2 size={22}/>
                    <h4 className="text-lg font-bold">Informasi Bisnis & Toko</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Nama Toko</p>
                        <p className="text-md font-bold text-slate-800 dark:text-slate-100">{user.seller.namaToko}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">WhatsApp Bisnis</p>
                        <p className="text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-300"><MessageSquare size={14}/> {user.seller.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">URL / Slug</p>
                        <p className="text-sm font-medium text-blue-500 flex items-center gap-1"><Globe size={14}/> kirafarm.id/shop/{user.seller.slug}</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Alamat Operasional</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">"{user.seller.alamat}"</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Deskripsi</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{user.seller.deskripsi || "Belum ada deskripsi."}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Informasi bisnis hanya tersedia untuk akun Mitra/Seller.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BANKING SECTION (FULL WIDTH) */}
        {user?.role === "SELLER" && user.seller && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
             {/* Kartu Rekening */}
             <div className="lg:col-span-2">
                <div className="h-full rounded-3xl border border-gray-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CreditCard size={150} className="text-white"/>
                  </div>
                  <div className="relative z-10 text-white">
                    <div className="flex items-center gap-2 mb-8 text-slate-400">
                      <CreditCard size={20}/>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em]">Data Penarikan Dana</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Bank Tujuan</p>
                        <p className="text-xl font-bold tracking-tight">
                          {user.seller.bank?.toUpperCase() || "-"} <span className="text-slate-500 font-normal">({user.seller.bankCode || "N/A"})</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Nomor Rekening</p>
                        <p className="text-xl font-mono font-bold tracking-widest">{user.seller.rekening || "-"}</p>
                      </div>
                      <div className="md:col-span-2 pt-6 border-t border-slate-800">
                        <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Atas Nama</p>
                        <p className="text-lg font-bold text-cyan-400 uppercase tracking-wide">{user.seller.namaRekening || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Berkas Section */}
             <div className="h-full">
                <div className="h-full rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Dokumen Legalitas</h4>
                  <div className="space-y-4 flex-1">
                    <a href={user.seller.fotoKtp} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={20}/>
                        <span className="text-xs font-bold text-slate-600 uppercase">Foto KTP</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400 font-bold">LIHAT</span>
                    </a>
                    <a href={user.seller.fotoNpwp} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={20}/>
                        <span className="text-xs font-bold text-slate-600 uppercase">Foto NPWP</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400 font-bold">LIHAT</span>
                    </a>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* MODAL PENARIKAN DANA */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsWithdrawOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tarik Saldo</h3>
              <p className="text-sm text-gray-500 mt-1">
                Dana akan ditransfer ke rekening <span className="font-bold text-gray-700 dark:text-gray-300">{user?.seller?.bank}</span> Anda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Nominal Penarikan</Label>
                  <span className="text-[10px] font-bold text-blue-600">Saldo: Rp {user?.seller?.balance?.toLocaleString("id-ID")}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input 
                    type="number"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>

                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    <span className="font-bold block mb-1 uppercase">Ketentuan Penarikan:</span>
                    • Minimal penarikan: <span className="font-bold">Rp 50.000</span><br/>
                    • Saldo mengendap minimal: <span className="font-bold">Rp 10.000</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">*Proses verifikasi admin memerlukan waktu 1-3 hari kerja.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <Button 
                  className="rounded-xl h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none"
                  onClick={handleWithdrawRequest}
                  disabled={withdrawLoading}
                >
                  {withdrawLoading ? <Loader2 className="animate-spin" /> : "Konfirmasi Tarik"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER GANTI PASSWORD */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[99999999] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsChangePasswordOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 shadow-2xl h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                <Lock size={20} />
              </div>
              <h4 className="text-xl font-bold">Keamanan Akun</h4>
            </div>

            <div className="space-y-5">
              <div>
                <Label>Password Saat Ini</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordForm.oldPassword} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} 
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <Label>Password Baru</Label>
                <Input 
                  type="password" 
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                />
              </div>

              <div>
                <Label>Konfirmasi Password Baru</Label>
                <Input 
                  type="password" 
                  placeholder="Ulangi password baru"
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                />
              </div>

              <div className="pt-8 flex flex-col gap-3">
                <Button 
                  className="w-full h-12 rounded-xl font-bold bg-amber-600 hover:bg-amber-700" 
                  onClick={handleChangePassword}
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? <Loader2 className="animate-spin" /> : "Perbarui Password"}
                </Button>
                <button 
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER EDIT - Tidak berubah secara logika, hanya penyesuaian UI sedikit */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 p-8 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
            <h4 className="text-2xl font-bold mb-8">Edit Profil & Bisnis</h4>
            <div className="space-y-6">
              <section className="space-y-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Informasi Dasar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Lengkap</Label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                </div>
              </section>

              {user?.role === "SELLER" && (
                <>
                  <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Detail Bisnis</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Toko</Label>
                        <Input value={profileForm.namaToko} onChange={(e) => setProfileForm({ ...profileForm, namaToko: e.target.value })} />
                      </div>
                      <div>
                        <Label>WA Bisnis</Label>
                        <Input value={profileForm.whatsapp} onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <Label>Alamat</Label>
                        <textarea className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-blue-500" rows={2} value={profileForm.alamat} onChange={(e) => setProfileForm({...profileForm, alamat: e.target.value})} />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Rekening Penarikan</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <Label>Bank</Label>
                        <Input value={profileForm.bank} onChange={(e) => setProfileForm({ ...profileForm, bank: e.target.value })} />
                      </div>
                      <div className="col-span-1">
                        <Label>No. Rekening</Label>
                        <Input value={profileForm.rekening} onChange={(e) => setProfileForm({ ...profileForm, rekening: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <Label>Nama Pemilik</Label>
                        <Input value={profileForm.namaRekening} onChange={(e) => setProfileForm({ ...profileForm, namaRekening: e.target.value })} />
                      </div>
                    </div>
                  </section>
                </>
              )}
              
              <div className="pt-8 flex gap-3">
                <Button className="flex-1 h-12 rounded-xl font-bold" onClick={handleSaveProfile} disabled={saveProfileLoading}>
                  {saveProfileLoading ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}