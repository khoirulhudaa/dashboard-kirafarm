import { Check, ChevronLeft, ChevronRight, Copy, Loader, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { GetAuthToken } from "../../utils/token";

interface Inmate {
  id: string;
  name: string;
  inmateNumber: string;
  cellBlock: string;
  prison: {
    code: string;
    name: string;
  };
}

interface Voucher {
  id: string;
  inmateId: string;
  purchasedMinutes: number;
  purchasedSeconds: number;
  redemptionCodeHash: string;
  generatedAt: string;
  voucherExpiresAt: string;
  redeemedAt: string | null;
  isRedeemed: boolean;
  isExpired: boolean;
  notes?: string;
  generatedBy: string;
  createdAt: string;
  inmate: Inmate;
}

const minuteOptions = [
  { value: "15", label: "15 Menit" },
  { value: "30", label: "30 Menit" },
  { value: "60", label: "60 Menit" },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Options untuk dropdown items per page
  const pageSizeOptions = [5, 10, 20];

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInmate, setSelectedInmate] = useState<Inmate | null>(null);
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");

  // Inmates list
  const [inmates, setInmates] = useState<Inmate[]>([]);
  const [loadingInmates, setLoadingInmates] = useState(false);
  const [inmateSearch] = useState("");

  // Search & Filter (client-side)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInmateNumber, setFilterInmateNumber] = useState("");
  const [filterPrisonCode, setFilterPrisonCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Success Modal
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    data: {
      redemptionCode: string;
      purchasedMinutes: number;
      inmateName: string;
      inmateNumber: string;
      prisonCode: string;
      prisonName: string;
      expiresInDays: number;
    } | null;
  }>({ open: false, data: null });

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Fetch vouchers dari server (dengan pagination dinamis)
  const fetchVouchers = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/quotas?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${GetAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        toast.error("Sesi berakhir");
        navigate("/signin");
        return;
      }
      if (!response.ok) {
        toast.error(response.statusText || "Server bermasalah!");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setVouchers(result.data);
        setTotalItems(result.meta.total);
        setTotalPages(result.meta.totalPages);
        setCurrentPage(result.meta.page);
      } else {
        toast.error("Gagal mengambil data voucher: " + (result.error?.message || "Unknown error"));
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch inmates
  const fetchInmates = async () => {
    setLoadingInmates(true);
    try {
      const response = await fetch(`${API_BASE}/inmates`, {
        headers: {
          Authorization: `Bearer ${GetAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        toast.error("Sesi berakhir");
        navigate("/signin");
        return;
      }

      const result = await response.json();
      if (result.success) {
        setInmates(result.data);
      } else {
        toast.error("Gagal mengambil data narapidana");
      }
    } catch (err) {
      toast.error("Error saat mengambil data narapidana");
    } finally {
      setLoadingInmates(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      fetchInmates();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    fetchVouchers(1);
  }, [itemsPerPage]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInmate || !minutes) {
      toast.error("Narapidana dan Durasi wajib dipilih!");
      return;
    }

    setLoadingGenerate(true);
    try {
      const response = await fetch(`${API_BASE}/quotas/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GetAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inmateId: selectedInmate.id,
          minutes: Number(minutes),
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Voucher berhasil dibuat!");

        setSuccessModal({
          open: true,
          data: {
            redemptionCode: result.data.redemptionCode,
            purchasedMinutes: result.data.purchasedMinutes,
            inmateName: result.data.inmateName,
            inmateNumber: result.data.inmateNumber,
            prisonCode: result.data.prison.code,
            prisonName: result.data.prison.name,
            expiresInDays: result.data.expiresInDays,
          },
        });

        fetchVouchers(1);
        setSelectedInmate(null);
        setMinutes("");
        setNotes("");
        setIsDrawerOpen(false);
      } else {
        toast.error(result.error?.message || "Gagal hasilkan kuota");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat hasilkan kuota");
    } finally {
      setLoadingGenerate(false);
    }
  };

  // Client-side filtering
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.inmate.inmateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInmate = !filterInmateNumber || voucher.inmate.inmateNumber.toLowerCase().includes(filterInmateNumber.toLowerCase());
    const matchesPrison = !filterPrisonCode || voucher.inmate.prison.code.toLowerCase().includes(filterPrisonCode.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "redeemed") matchesStatus = voucher.isRedeemed;
    if (filterStatus === "unused") matchesStatus = !voucher.isRedeemed && !voucher.isExpired;
    if (filterStatus === "expired") matchesStatus = voucher.isExpired;

    return matchesSearch && matchesInmate && matchesPrison && matchesStatus;
  });

  // Tentukan data yang ditampilkan
  const hasActiveFilter = searchTerm || filterInmateNumber || filterPrisonCode || filterStatus;
  const currentData = hasActiveFilter ? filteredVouchers : vouchers;
  const displayedTotal = hasActiveFilter ? filteredVouchers.length : totalItems;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Kode voucher berhasil disalin!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filtered inmates for dropdown
  const filteredInmates = inmates.filter(
    (i) =>
      i.name.toLowerCase().includes(inmateSearch.toLowerCase()) ||
      i.inmateNumber.toLowerCase().includes(inmateSearch.toLowerCase()) ||
      i.prison.code.toLowerCase().includes(inmateSearch.toLowerCase())
  );

  const inmateOptions = filteredInmates.map((inmate) => ({
    value: inmate.id,
    label: `${inmate.name} (${inmate.inmateNumber}) - ${inmate.cellBlock} • ${inmate.prison.code}`,
  }));

  // Handle perubahan items per page
  const handlePageSizeChange = (newSize: string) => {
    setItemsPerPage(Number(newSize));
    setCurrentPage(1);
  };

  // Reset filter dan kembali ke page 1
  const resetFilters = () => {
    setSearchTerm("");
    setFilterInmateNumber("");
    setFilterPrisonCode("");
    setFilterStatus("");
    setCurrentPage(1);
    fetchVouchers(1);
  };

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Kuota
      </h1>

      {/* Success Modal */}
      {successModal.open && successModal.data && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSuccessModal({ open: false, data: null })} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSuccessModal({ open: false, data: null })}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Kuota Berhasil Dibuat!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Berikan kode ini kepada narapidana atau keluarga
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <code className="text-3xl font-bold tracking-wider text-amber-600 dark:text-amber-400 select-all">
                  {successModal.data.redemptionCode}
                </code>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Narapidana:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {successModal.data.inmateName} ({successModal.data.inmateNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Penjara:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {successModal.data.prisonCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Durasi:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {successModal.data.purchasedMinutes} menit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kadaluarsa:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {successModal.data.expiresInDays} hari
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCopyCode(successModal.data!.redemptionCode)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-6 h-6" />
                    Kode Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6" />
                    Salin Kode Kuota
                  </>
                )}
              </button>

              <button
                onClick={() => setSuccessModal({ open: false, data: null })}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 flex-1 w-full md:w-max lg:flex-none">
            <div>
              <Label htmlFor="filter-inmate">Nomor Tahanan</Label>
              <Input
                id="filter-inmate"
                type="text"
                placeholder="INM003"
                value={filterInmateNumber}
                onChange={(e) => {
                  setFilterInmateNumber(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div>
              <Label htmlFor="filter-prison">Kode Penjara</Label>
              <Input
                id="filter-prison"
                type="text"
                placeholder="LP-SBY"
                value={filterPrisonCode}
                onChange={(e) => {
                  setFilterPrisonCode(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Label htmlFor="searchVoucher">Cari Kuota</Label>
              <Search className="absolute left-3 top-[calc(50%+0.75rem)] -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="searchVoucher"
                type="text"
                placeholder="ID Kuota..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="md:flex flex-col hidden"                                                  >
              <Label htmlFor="filter-status">Status</Label>
              <Select
                options={[
                  { value: "", label: "Semua" },
                  { value: "unused", label: "Belum Dipakai" },
                  { value: "redeemed", label: "Sudah Dipakai" },
                  { value: "expired", label: "Kadaluarsa" },
                ]}
                defaultValue={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setCurrentPage(1);
                }}
                placeholder="Pilih status"
              />
            </div>

            <div className="flex flex-col">
              <Label className="opacity-0">Generate</Label>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center gap-2 px-6 h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Hasilkan Kuota
              </button>
            </div>
          </div>
        </div>

        {hasActiveFilter && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={resetFilters}
              className="text-sm text-amber-600 hover:underline flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset semua filter
            </button>
            <span className="text-sm text-gray-500">
              (Pagination dinonaktifkan saat filter aktif)
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <ComponentCard title="Daftar Kuota Panggilan Video">
        {loading ? (
          <div className="w-full flex flex-col justify-center items-center pt-4">
            <Loader className="animate-spin w-10 h-10 text-gray-500 duration-200" />
            <p className="text-center py-4 text-[18px] text-gray-500">Sedang memuat data...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center justify-between w-full gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Menampilkan {currentData.length} dari {displayedTotal} kuota
                  {hasActiveFilter && " (hasil filter)"}
                </span>

                {/* Dropdown Items per Page - hanya jika tidak ada filter */}
                {!hasActiveFilter && (
                  <div className="flex items-center gap-2">
                    <span>Tampilkan:</span>
                    <Select
                      options={pageSizeOptions.map((size) => ({
                        value: size.toString(),
                        label: size.toString(),
                      }))}
                      placeholder="Pilih"
                      defaultValue={itemsPerPage.toString()}
                      onChange={handlePageSizeChange}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Narapidana</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Penjara</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Durasi</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((voucher) => (
                    <tr key={voucher.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-6 dark:text-white">
                        <div>
                          <div className="font-medium">{voucher.inmate.name}</div>
                          <div className="text-sm text-gray-500">{voucher.inmate.inmateNumber} • {voucher.inmate.cellBlock}</div>
                        </div>
                      </td>
                      <td className="py-3 px-6 dark:text-white">
                        <div>
                          <div className="font-medium">{voucher.inmate.prison.name}</div>
                          <div className="text-sm text-gray-500">{voucher.inmate.prison.code}</div>
                        </div>
                      </td>
                      <td className="py-3 px-6 dark:text-white">{voucher.purchasedMinutes} menit</td>
                      <td className="py-3 px-6 dark:text-white">
                        {voucher.isExpired ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Kadaluarsa
                          </span>
                        ) : voucher.isRedeemed ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Sudah Dipakai
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Belum Dipakai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <p className="text-center py-10 text-gray-500">
                  {hasActiveFilter
                    ? "Tidak ditemukan kuota dengan filter tersebut."
                    : "Belum ada kuota yang digenerate."}
                </p>
              )}
            </div>

            {/* Pagination */}
            {!hasActiveFilter && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => fetchVouchers(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  onClick={() => fetchVouchers(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Drawer Generate */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full md:max-w-[50vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold">Buat Kuota Baru</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dropdown Narapidana dengan pencarian */}
                    <div className="md:col-span-2">
                      <Label htmlFor="inmate">Pilih Narapidana</Label>
                      {loadingInmates ? (
                        <div className="text-sm text-gray-500">Memuat daftar narapidana...</div>
                      ) : (
                       <Select
                          options={inmateOptions} 
                          defaultValue={selectedInmate?.id || ""}       
                          onChange={(value) => {
                            const inmate = inmates.find((i) => i.id === value);
                            setSelectedInmate(inmate || null);
                          }}
                          placeholder="Pilih narapidana..."
                          required
                        />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="minutes">Durasi Panggilan Video</Label>
                      <Select
                        options={minuteOptions}
                        defaultValue={minutes}
                        onChange={setMinutes}
                        placeholder="Pilih durasi"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Catatan (Opsional)</Label>
                      <Input
                        id="notes"
                        type="text"
                        placeholder="Purchase dari Koperasi Lapas"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loadingGenerate}
                      className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-70 text-white font-medium rounded-lg transition"
                    >
                      {loadingGenerate ? "Memproses..." : "Hasilkan Kuota"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition"
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