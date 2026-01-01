import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProvinceData {
  province: string;
  prisons: number;
  inmates: number;
  officers: number;
}

export default function StatisticsChart() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login kembali.");
      //   navigate("/signin", { replace: true });
      //   return;
      // }

      try {
        const res = await fetch(`${BASE_URL}/prison`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // if (res.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   toast.error("Sesi berakhir. Silakan login kembali.");
        //   navigate("/signin", { replace: true });
        //   return;
        // }
        if (!res.ok) throw new Error("Gagal memuat data lapas");

        const json = await res.json();
        const prisons = json.data || [];

        const grouped = prisons.reduce((acc: any, p: any) => {
          const prov = p.province || "Tidak Diketahui";
          if (!acc[prov]) acc[prov] = { prisons: 0, inmates: 0, officers: 0 };
          acc[prov].prisons += 1;
          acc[prov].inmates += p._count?.inmates || 0;
          acc[prov].officers += p._count?.officers || 0;
          return acc;
        }, {});

        const formatted: ProvinceData[] = Object.keys(grouped).map(prov => ({
          province: prov,
          prisons: grouped[prov].prisons,
          inmates: grouped[prov].inmates,
          officers: grouped[prov].officers,
        }));

        formatted.sort((a, b) => (b.inmates + b.officers + b.prisons) - (a.inmates + a.officers + a.prisons));
        setData(formatted);
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat statistik penjara");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const provinces = data.map(d => d.province);

  const series = [
    { name: "Jumlah Lapas", data: data.map(d => d.prisons) },
    { name: "Narapidana", data: data.map(d => d.inmates) },
    { name: "Petugas", data: data.map(d => d.officers) },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 420,
      stacked: true,
      fontFamily: "Inter, Outfit, sans-serif",
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
        borderRadius: 14,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      type: "gradient",
      gradient: { shade: "light", type: "vertical", shadeIntensity: 0.3, opacityFrom: 0.9, opacityTo: 0.7 },
    },
    colors: ["#94a3b8", "#60a5fa", "#34d399"], // Gray soft, blue soft, teal — hanya 3 warna calm
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: provinces,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { rotate: -45, style: { fontSize: "13px", fontWeight: 500 } },
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "13px" } },
    },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 6 },
    legend: { position: "top", horizontalAlign: "center" },
    title: { text: "Statistik Penjara per Provinsi", align: "center", style: { fontSize: "18px", fontWeight: 600 } },
    tooltip: { y: { formatter: val => `${val.toLocaleString()} orang/unit` } },
  };

  if (loading) return <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"><div className="h-8 bg-gray-200 rounded w-96 animate-pulse mb-6 mx-auto" /><div className="h-96 bg-gray-100 rounded animate-pulse" /></div>;

  if (data.length === 0) return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]"><p className="text-gray-500">Tidak ada data penjara</p></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 shadow-sm">
      <Chart options={options} series={series} type="bar" height={420} />
    </div>
  );
}