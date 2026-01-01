import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { GetAuthToken } from "../../utils/token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NewInmatesChart() {
  const navigate = useNavigate();
  const [inmates, setInmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchInmates = async () => {
      const token = GetAuthToken();
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login kembali.");
      //   navigate("/signin", { replace: true });
      //   return;
      // }

      try {
        const res = await fetch(`${BASE_URL}/inmates?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // if (res.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   toast.error("Sesi berakhir. Silakan login kembali.");
        //   navigate("/signin", { replace: true });
        //   return;
        // }

        if (!res.ok) {
          throw new Error("Gagal memuat data narapidana");
        }

        const json = await res.json();
        setInmates(json.data || []);
      } catch (err: any) {
        if (err.name === "TypeError" && err.message.includes("fetch")) {
          toast.error("Tidak dapat terhubung ke server. Periksa koneksi atau URL API.");
        } else {
          toast.error(err.message || "Gagal memuat data chart");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInmates();
  }, [navigate]);

  const currentYear = new Date().getFullYear(); // 2025

  const monthlyData = Array(12).fill(0);
  inmates.forEach((inmate: any) => {
    const date = new Date(inmate.admissionDate);
    if (date.getFullYear() === currentYear) {
      monthlyData[date.getMonth()]++;
    }
  });

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 180, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "39%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val} narapidana` } },
  };

  const series = [{ name: "Narapidana Baru", data: monthlyData }];

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-4" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Narapidana Masuk Bulanan (Tahun {currentYear})
        </h3>
        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>View More</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>Export</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}