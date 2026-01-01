import { Eye, EyeOff, Lock, Pen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";

// Data dummy pengguna (bisa diganti sesuai kebutuhan)
const dummyUser = {
  id: "usr-001",
  name: "Ahmad Fauzi",
  email: "ahmad@agromart.id",
  phone: "0812-3456-7890",
  role: "OWNER", // bisa: OWNER, ADMIN, STAFF, WAREHOUSE
  joinDate: "2023-01-15T00:00:00.000Z",
  lastLoginAt: "2025-12-31T08:30:00.000Z",
  businessName: "AgroMart Jaya",
  address: "Jl. Raya Bogor No. 45, Jakarta Selatan",
};

const roleLabels: Record<string, string> = {
  OWNER: "Pemilik Usaha",
  ADMIN: "Administrator",
  STAFF: "Staf Penjualan",
  WAREHOUSE: "Petugas Gudang",
};

const formatDate = (isoString: string | null) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserProfiles() {
  const [user] = useState(dummyUser);

  // Sidebar states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Loading states (simulasi)
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Form profil
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessName: user.businessName,
    address: user.address || "",
  });

  // Form password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Handlers untuk sidebar
  const openEditProfile = () => setIsEditProfileOpen(true);
  const closeEditProfile = () => setIsEditProfileOpen(false);

  const openChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPassword({ current: false, new: false, confirm: false });
    setIsChangePasswordOpen(true);
  };
  const closeChangePassword = () => setIsChangePasswordOpen(false);

  // Simulasi update profil (karena offline)
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim() || !profileForm.phone.trim()) {
      toast.error("Nama, email, dan nomor telepon tidak boleh kosong");
      return;
    }

    setSaveProfileLoading(true);
    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Profil berhasil diperbarui (data disimpan lokal)");
    closeEditProfile();
    setSaveProfileLoading(false);
  };

  // Simulasi ganti password
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua kolom harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    setChangePasswordLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    toast.success("Password berhasil diubah (simulasi offline)");
    closeChangePassword();
    setChangePasswordLoading(false);
  };

  return (
    <>
      <PageMeta
        title="Profil Pengguna | AgroMart"
        description="Kelola profil dan pengaturan akun Anda"
      />
      <PageBreadcrumb pageTitle="Profil Akun" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          {/* User Meta Card */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-24 h-24 overflow-hidden border-4 border-blue-700 rounded-full dark:border-blue-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="w-16 h-16 text-blue-700 dark:text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="order-3 xl:order-2 text-center xl:text-left">
                  <h4 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
                    {user.name}
                  </h4>
                  <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Aktif
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Role: <span className="font-medium">{roleLabels[user.role] || user.role}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Bergabung sejak {formatDate(user.joinDate).split(",")[0]}
                  </p>
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openEditProfile}
                  className="flex w-full md:w-max h-[40px] items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  <Pen className="w-4 h-4" />
                  Ubah Profil
                </button>

                <button
                  onClick={openChangePassword}
                  className="flex w-full md:w-max h-[40px] items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                >
                  <Lock className="w-4 h-4" />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>

          {/* Informasi Usaha */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
              Informasi Usaha
            </h4>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Nama Usaha
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {user.businessName}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Nomor Telepon
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {user.phone}
                </p>
              </div>
              <div className="lg:col-span-2">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Alamat Usaha
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {user.address || "-"}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Terakhir Login
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {formatDate(user.lastLoginAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Edit Profil */}
      <div
        className={`fixed inset-0 z-[99999999] transition-opacity ${
          isEditProfileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
          onClick={closeEditProfile}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-2xl transition-transform dark:bg-gray-900 ${
            isEditProfileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-6 dark:border-gray-800">
              <h4 className="text-2xl font-semibold dark:text-white">
                Edit Profil
              </h4>
              <button
                onClick={closeEditProfile}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <Label>Nama Lengkap</Label>
                <Input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Nomor Telepon</Label>
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Nama Usaha</Label>
                <Input
                  type="text"
                  value={profileForm.businessName}
                  onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                />
              </div>
              <div>
                <Label>Alamat Usaha (Opsional)</Label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Masukkan alamat lengkap usaha..."
                />
              </div>
            </div>
            <div className="border-t p-6 dark:border-gray-800">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeEditProfile}>
                  Batal
                </Button>
                <Button onClick={handleSaveProfile} disabled={saveProfileLoading}>
                  {saveProfileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Ganti Password */}
      <div
        className={`fixed inset-0 z-[99999999] transition-opacity ${
          isChangePasswordOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
          onClick={closeChangePassword}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-2xl transition-transform dark:bg-gray-900 ${
            isChangePasswordOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-6 dark:border-gray-800">
              <h4 className="text-2xl font-semibold dark:text-white">
                Ubah Kata Sandi
              </h4>
              <button
                onClick={closeChangePassword}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="relative">
                <Label>Kata Sandi Saat Ini</Label>
                <Input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Label>Kata Sandi Baru</Label>
                <Input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Label>Konfirmasi Kata Sandi Baru</Label>
                <Input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Ketik ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="border-t p-6 dark:border-gray-800">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeChangePassword}>
                  Batal
                </Button>
                <Button onClick={handleChangePassword} disabled={changePasswordLoading}>
                  {changePasswordLoading ? "Menyimpan..." : "Ubah Kata Sandi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}