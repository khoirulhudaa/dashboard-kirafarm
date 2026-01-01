export default function UserAssignmentCard() {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Penugasan Lembaga Pemasyarakatan
      </h4>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Kode Lapas</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">LP-SBY-001</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Nama Lapas</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">Lembaga Pemasyarakatan Kelas I Surabaya</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Kota</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">Surabaya</p>
        </div>
      </div>
    </div>
  );
}