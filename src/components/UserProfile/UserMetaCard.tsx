import { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function OfficerMetaCard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleSave = () => {
    // Handle save logic here (e.g., API call)
    console.log("Saving changes...");
    closeSidebar();
  };

  return (
    <>
      {/* Card Utama */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-24 h-24 overflow-hidden border-4 border-blue-900 rounded-full dark:border-blue-700">
              <img
                src="https://www.ditjenpas.go.id/uploads/images/image_1680x_5e2e63e7133e1.jpg"
                alt="Petugas Pemasyarakatan"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-xl font-bold text-center text-gray-800 dark:text-white/90 xl:text-left">
                Ani Kusuma
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-4 xl:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  NIP: 198507152010012345
                </p>
                <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nomor Badge: OFF-SBY-001
                </p>
                <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Aktif
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                Jabatan: Petugas Pengamanan
              </p>
            </div>
          </div>

          <button
            onClick={openSidebar}
            className="flex w-max items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
            </svg>
            <p className="w-max">
              Edit Profil
            </p>
          </button>
        </div>
      </div>

      {/* Sidebar Drawer dari Kanan */}
      <div className={`fixed inset-0 z-[99999999] h-screen overflow-auto ${isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeSidebar}
        />

        {/* Panel Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Header Sidebar */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
              <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Profil Petugas
              </h4>
              <button
                onClick={closeSidebar}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
                Perbarui data petugas untuk menjaga informasi tetap akurat.
              </p>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input type="text" value="Ani Kusuma" />
                </div>
                <div>
                  <Label>NIP</Label>
                  <Input type="text" value="198507152010012345" />
                </div>
                <div>
                  <Label>Nomor Badge</Label>
                  <Input type="text" value="OFF-SBY-001" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value="officer.surabaya@lapasconnect.go.id" />
                </div>
                <div>
                  <Label>Pangkat/Golongan</Label>
                  <Input type="text" value="Penata Muda Tk. I (III/b)" />
                </div>
                <div>
                  <Label>Jabatan</Label>
                  <Input type="text" value="Petugas Pengamanan" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input type="text" value="Aktif" />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-gray-200 p-6 dark:border-gray-800">
              <div className="flex items-center justify-end gap-3">
                <Button size="sm" variant="outline" onClick={closeSidebar}>
                  Tutup
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}