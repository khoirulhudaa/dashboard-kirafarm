import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PrisonData {
  name: string;
  inmates: number;
  officers: number;
}

export default function InmateOfficerChart() {
  const navigate = useNavigate();
  const [data, setData] = useState<PrisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrisons = async () => {
      const token = localStorage.getItem("accessToken");
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login kembali.");
      //   navigate("/signin", { replace: true });
      //   return;
      // }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/prison`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // if (res.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   toast.error("Sesi berakhir. Silakan login kembali.");
        //   navigate("/signin", { replace: true });
        //   return;
        // }
        if (!res.ok) throw new Error(`Gagal memuat data lapas`);

        const json = await res.json();
        const prisons = json.data || [];

        const formatted: PrisonData[] = prisons.map((p: any) => ({
          name: p.name || p.code || "Tidak Diketahui",
          inmates: p._count?.inmates || 0,
          officers: p._count?.officers || 0,
        }));

        setData(formatted);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data lapas");
        toast.error(err.message || "Gagal memuat data lapas");
      } finally {
        setLoading(false);
      }
    };

    fetchPrisons();
  }, [navigate]);

  const totalInmates = data.reduce((sum, d) => sum + d.inmates, 0);
  const totalOfficers = data.reduce((sum, d) => sum + d.officers, 0);
  const total = totalInmates + totalOfficers;

  const series = total > 0 ? [(totalInmates / total) * 100, (totalOfficers / total) * 100] : [0, 0];

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 420,
      fontFamily: "Inter, Outfit, sans-serif",
      animations: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        track: { background: "#e2e8f0" },
        dataLabels: {
          show: true,
          name: { fontSize: "16px" },
          value: { fontSize: "24px", fontWeight: 600 },
          total: {
            show: true,
            label: "Total Orang",
            formatter: () => total.toLocaleString(),
            fontSize: "18px",
          },
        },
        hollow: { size: "60%" },
      },
    },
    labels: ["Narapidana", "Petugas"],
    colors: ["#60a5fa", "#34d399"],
    fill: { type: "gradient", gradient: { shade: "light", type: "vertical" } },
    stroke: { lineCap: "round" },
    title: { text: "Rasio Narapidana vs Petugas (Keseluruhan)", align: "center", style: { fontSize: "18px", fontWeight: 600 } },
    tooltip: { y: { formatter: val => `${Math.round(val)}% (${val > 50 ? totalInmates : totalOfficers}) orang` } },
  };

  if (loading) return <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"><div className="h-8 bg-gray-200 rounded w-96 animate-pulse mb-6 mx-auto" /><div className="h-96 bg-gray-100 rounded animate-pulse" /></div>;

  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:bg-red-900/20 dark:border-red-800"><p className="text-red-600 dark:text-red-400 font-medium">{error}</p></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 shadow-sm">
      <Chart options={options} series={series} type="radialBar" height={420} />
    </div>
  );
}