export default function UserInfoCard() {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Informasi Kepegawaian
      </h4>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">NIP</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">198507152010012345</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Pangkat/Golongan</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">Penata Muda Tk. I (III/b)</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Jabatan</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">Petugas Pengamanan</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">officer.surabaya@lapasconnect.go.id</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Status</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Terakhir Login</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">-</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Bergabung Sejak</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">18 Desember 2025</p>
        </div>
      </div>
    </div>
  );
}