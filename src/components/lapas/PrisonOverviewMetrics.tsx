// import { BuildingIcon, ClockIcon, ShieldIcon } from "lucide-react";
// import {
//   ArrowDownIcon,
//   ArrowUpIcon,
//   UserIcon,      // ganti BoxIconLine untuk inmates
// } from "../../icons";
// import Badge from "../ui/badge/Badge";

// export default function PrisonOverviewMetrics() {
//   // Data dummy dihitung dari 5 prisons, 5 inmates, 5 officers, 5 quotas
//   const totalPrisons = 5;
//   const totalInmates = 5;
//   const totalOfficers = 5;
//   const activeQuotas = 5; // semua quota belum redeemed

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
//       {/* Total Prisons */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <BuildingIcon className="text-gray-800 size-6 dark:text-white/90" />
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Total Lapas
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {totalPrisons}
//             </h4>
//           </div>
//           <Badge color="success">
//             <ArrowUpIcon />
//             25%
//           </Badge>
//         </div>
//       </div>

//       {/* Total Inmates */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <UserIcon className="text-gray-800 size-6 dark:text-white/90" />
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Narapidana Aktif
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {totalInmates}
//             </h4>
//           </div>
//           <Badge color="success">
//             <ArrowUpIcon />
//             11.01%
//           </Badge>
//         </div>
//       </div>

//       {/* Total Officers */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <ShieldIcon className="text-gray-800 size-6 dark:text-white/90" />
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Petugas
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {totalOfficers}
//             </h4>
//           </div>
//           <Badge color="success">
//             <ArrowUpIcon />
//             8.5%
//           </Badge>
//         </div>
//       </div>

//       {/* Active Quotas */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <ClockIcon className="text-gray-800 size-6 dark:text-white/90" />
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Kuota Video Call Aktif
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {activeQuotas}
//             </h4>
//           </div>
//           <Badge color="error">
//             <ArrowDownIcon />
//             15%
//           </Badge>
//         </div>
//       </div>
//     </div>
//   );
// }


import { BuildingIcon, ClockIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { GetAuthToken } from "../../utils/token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LapasMetrics() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    totalPrisons: number;
    totalInmates: number;
    totalOfficers: number;
    activeQuotas: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = GetAuthToken();
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login kembali.");
      //   navigate("/signin", { replace: true });
      //   return;
      // }

      try {
        const [prisonsRes, quotasRes] = await Promise.all([
          fetch(`${BASE_URL}/prison`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/quotas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Cek 401
        // if (prisonsRes.status === 401 || quotasRes.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   toast.error("Sesi berakhir. Silakan login kembali.");
        //   navigate("/signin", { replace: true });
        //   return;
        // }

        if (!prisonsRes.ok || !quotasRes.ok) {
          throw new Error("Gagal memuat data dari server");
        }

        const prisonsJson = await prisonsRes.json();
        const quotasJson = await quotasRes.json();

        const prisons = prisonsJson.data;
        const quotas = quotasJson.data;

        const totalPrisons = prisons.length;
        const totalInmates = prisons.reduce((sum: number, p: any) => sum + (p._count?.inmates || 0), 0);
        const totalOfficers = prisons.reduce((sum: number, p: any) => sum + (p._count?.officers || 0), 0);
        const activeQuotas = quotas.filter((q: any) => !q.isRedeemed && !q.isExpired).length;

        setData({ totalPrisons, totalInmates, totalOfficers, activeQuotas });
      } catch (err: any) {
        if (err.name === "TypeError" && err.message.includes("fetch")) {
          toast.error("Tidak dapat terhubung ke server. Periksa koneksi internet atau URL API.");
        } else {
          toast.error(err.message || "Gagal memuat metrics");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-800" />
            <div className="mt-5 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { totalPrisons = 0, totalInmates = 0, totalOfficers = 0, activeQuotas = 0 } = data || {};

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Total Lapas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BuildingIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Lapas</span>
            <h4 className="mt-2 font-bold flex items-center text-gray-800 text-title-sm dark:text-white/90">
              {totalPrisons}
              <small className="text-slate-500 text-sm font-normal ml-2">Lokasi</small>
            </h4>
          </div>
        </div>
      </div>

      {/* Narapidana Aktif */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <UserIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Narapidana Aktif</span>
            <h4 className="mt-2 font-bold flex items-center text-gray-800 text-title-sm dark:text-white/90">
              {totalInmates}
              <small className="text-slate-500 text-sm font-normal ml-2">Orang</small>
            </h4>
          </div>
        </div>
      </div>

      {/* Petugas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ShieldIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Petugas</span>
            <h4 className="mt-2 font-bold flex items-center text-gray-800 text-title-sm dark:text-white/90">
              {totalOfficers}
              <small className="text-slate-500 text-sm font-normal ml-2">Orang</small>
            </h4>
          </div>
        </div>
      </div>

      {/* Kuota Video Call Aktif */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ClockIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kuota Panggilan Aktif</span>
            <h4 className="mt-2 font-bold flex items-center text-gray-800 text-title-sm dark:text-white/90">
              {activeQuotas}
              <small className="text-slate-500 text-sm font-normal ml-2">Kuota</small>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}