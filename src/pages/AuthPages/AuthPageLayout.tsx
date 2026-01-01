import React from "react";
import GridShape from "../../components/common/GridShape";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="flex items-center text-white gap-5 mb-4">
                <a href="https://www.flaticon.com/free-icons/vegetable" title="vegetable icons">
                  <img src="/logo.png" className="scale-[1.2] dark:text-blue-400" /> {/* Icon perisai melambangkan integritas & pemasyarakatan */}
                </a>
                <div className="w-max text-left flex items-start justify-start flex-col">
                  <span className="font-bold text-5xl text-white">
                      KIRAFARM
                  </span>
                  <p className="text-center text-gray-400 dark:text-white/60 relative left-[1px]">
                      Manajemen Penjualan dan Produk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
