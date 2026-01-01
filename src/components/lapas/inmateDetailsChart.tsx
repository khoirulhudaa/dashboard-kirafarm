import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BlockData {
  [key: string]: number;
}

export default function InmateDetailsChart() {
  const navigate = useNavigate();
  const [blockCounts, setBlockCounts] = useState<BlockData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInmates = async () => {
      const token = localStorage.getItem("accessToken");
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login kembali.");
      //   navigate("/signin", { replace: true });
      //   return;
      // }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/inmates`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // if (res.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   toast.error("Sesi berakhir. Silakan login kembali.");
        //   navigate("/signin", { replace: true });
        //   return;
        // }
        if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);

        const json = await res.json();
        const inmates = json.data || [];

        const counts: BlockData = {};
        inmates.forEach((inmate: any) => {
          const cellBlock = inmate.cellBlock;
          if (!cellBlock) return;
          const blockPrefix = cellBlock.split("-")[0]?.trim().toUpperCase();
          if (blockPrefix) {
            counts[blockPrefix] = (counts[blockPrefix] || 0) + 1;
          }
        });

        const sortedEntries = Object.entries(counts).sort(([, a], [, b]) => b - a);
        setBlockCounts(Object.fromEntries(sortedEntries));
      } catch (err: any) {
        const message =
          err.message.includes("fetch") || err.name === "TypeError"
            ? "Tidak dapat terhubung ke server."
            : err.message || "Gagal memuat data narapidana";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInmates();
  }, [navigate]);

  const blockNames = Object.keys(blockCounts);
  const blockValues = Object.values(blockCounts);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      fontFamily: "Inter, Outfit, sans-serif",
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 14,
        barHeight: "75%",
        distributed: false, // Biar tidak rainbow, pakai 2 warna bergantian via series
      },
    },
    colors: ["#60a5fa", "#94a3b8"], // Hanya blue soft & gray soft bergantian
    fill: {
      type: "gradient",
      gradient: { shade: "light", type: "horizontal", shadeIntensity: 0.25, opacityFrom: 0.9, opacityTo: 0.7 },
    },
    dataLabels: {
      enabled: true,
      formatter: val => `${val} narapidana`,
      offsetX: 10,
      style: { fontSize: "14px", fontWeight: 600, colors: ["#ffffff"] },
      dropShadow: { enabled: true, opacity: 0.3 },
    },
    xaxis: {
      categories: blockNames,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "14px" } },
    },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 6 },
    title: { text: "Distribusi Narapidana per Blok Sel", align: "center", style: { fontSize: "18px", fontWeight: 600 } },
    tooltip: { y: { formatter: val => `${val} narapidana` } },
  };

  const series = [{ name: "Jumlah Narapidana", data: blockValues }];
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="h-8 bg-gray-200 rounded w-80 animate-pulse mb-6 mx-auto" />
        <div className="h-80 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 shadow-sm">
      <Chart options={options} series={series} type="bar" height={380} />
    </div>
  );
}