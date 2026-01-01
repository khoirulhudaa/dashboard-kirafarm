import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Loader,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "WAREHOUSE";
  status: "ACTIVE" | "INACTIVE";
  joinDate: string; // ISO date
  address?: string;
}

const dummyEmployees: Employee[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    email: "ahmad@agromart.id",
    phone: "081234567890",
    role: "ADMIN",
    status: "ACTIVE",
    joinDate: "2023-01-15T00:00:00.000Z",
    address: "Jl. Raya Bogor No. 45, Jakarta",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@agromart.id",
    phone: "082198765432",
    role: "MANAGER",
    status: "ACTIVE",
    joinDate: "2023-06-20T00:00:00.000Z",
    address: "Perumahan Green Garden Blok A3, Bandung",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@agromart.id",
    phone: "085712345678",
    role: "STAFF",
    status: "ACTIVE",
    joinDate: "2024-02-10T00:00:00.000Z",
    address: "Jl. Sudirman Kav. 10, Jakarta",
  },
  {
    id: "4",
    name: "Rina Wulandari",
    email: "rina@agromart.id",
    phone: "089876543210",
    role: "WAREHOUSE",
    status: "ACTIVE",
    joinDate: "2024-08-05T00:00:00.000Z",
    address: "Gudang AgroMart, Cikarang",
  },
  {
    id: "5",
    name: "Dedi Kurniawan",
    email: "dedi@agromart.id",
    phone: "081398765432",
    role: "STAFF",
    status: "INACTIVE",
    joinDate: "2023-11-01T00:00:00.000Z",
    address: "Jl. Thamrin No. 22, Jakarta",
  },
  {
    id: "6",
    name: "Larasati Dewi",
    email: "laras@agromart.id",
    phone: "087712345678",
    role: "MANAGER",
    status: "ACTIVE",
    joinDate: "2024-03-15T00:00:00.000Z",
  },
];

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const roleLabels: Record<Employee["role"], string> = {
  ADMIN: "Administrator",
  MANAGER: "Manajer",
  STAFF: "Staf",
  WAREHOUSE: "Gudang",
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Employee["role"]>("STAFF");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setEmployees(dummyEmployees);
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("STAFF");
    setAddress("");
    setEditingEmployee(null);
  };

  const openEditDrawer = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setName(employee.name);
      setEmail(employee.email);
      setPhone(employee.phone);
      setRole(employee.role);
      setAddress(employee.address || "");
    } else {
      resetForm();
    }
    setIsEditDrawerOpen(true);
  };

  const openDetailDrawer = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Nama, email, dan nomor telepon wajib diisi!");
      return;
    }

    const updatedEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status: editingEmployee?.status || "ACTIVE",
      joinDate: editingEmployee?.joinDate || new Date().toISOString(),
      address: address.trim() || undefined,
    };

    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
      toast.success("Data pegawai berhasil diperbarui");
    } else {
      setEmployees([updatedEmployee, ...employees]);
      toast.success("Pegawai baru berhasil ditambahkan");
    }

    setIsEditDrawerOpen(false);
    resetForm();
  };

  const handleToggleStatus = (employee: Employee) => {
    const action = employee.status === "ACTIVE" ? "nonaktifkan" : "aktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} pegawai "${employee.name}"?`)) return;

    setEmployees(employees.map(emp =>
      emp.id === employee.id
        ? { ...emp, status: employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
        : emp
    ));
    toast.success(`Pegawai berhasil ${employee.status === "ACTIVE" ? "dinonaktifkan" : "diaktifkan"}`);
  };

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm);

    const matchesRole = !filterRole || emp.role === filterRole;
    const matchesStatus = !filterStatus || emp.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Manajemen Pegawai & Admin
      </h1>

      {/* Filter & Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                options={[
                  { value: "", label: "Semua Role" },
                  { value: "ADMIN", label: "Administrator" },
                  { value: "MANAGER", label: "Manajer" },
                  { value: "STAFF", label: "Staf" },
                  { value: "WAREHOUSE", label: "Gudang" },
                ]}
                defaultValue={filterRole}
                onChange={(v) => setFilterRole(v as any)}
                placeholder="Pilih role"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                options={[
                  { value: "", label: "Semua Status" },
                  { value: "ACTIVE", label: "Aktif" },
                  { value: "INACTIVE", label: "Tidak Aktif" },
                ]}
                defaultValue={filterStatus}
                onChange={(v) => setFilterStatus(v as any)}
                placeholder="Pilih status"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1">
              <Label>Cari Pegawai</Label>
              <Search className="absolute left-3 top-[calc(50%+0.75rem)] -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Nama, email, atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Label className="opacity-0">Tambah</Label>
              <button
                onClick={() => openEditDrawer()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Tambah Pegawai
              </button>
            </div>
          </div>
        </div>

        {(searchTerm || filterRole || filterStatus) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterRole("");
                setFilterStatus("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <ComponentCard title="Daftar Pegawai">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin w-10 h-10 text-gray-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Nama</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Email & Telepon</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Role</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Bergabung</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="py-4 px-6 uppercase text-xs font-medium text-gray-700 dark:text-gray-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((emp) => (
                    <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-6 font-medium">{emp.name}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p>{emp.email}</p>
                          <p className="text-gray-500">{emp.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {roleLabels[emp.role]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">{formatDate(emp.joinDate)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          emp.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {emp.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openDetailDrawer(emp)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button onClick={() => openEditDrawer(emp)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition">
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          {emp.status === "ACTIVE" ? (
                            <button onClick={() => handleToggleStatus(emp)} className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded transition">
                              <ToggleRight className="w-4 h-4 text-orange-600" />
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(emp)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded transition">
                              <ToggleLeft className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentData.length === 0 && (
                <p className="text-center py-10 text-gray-500">
                  {searchTerm || filterRole || filterStatus
                    ? "Tidak ditemukan pegawai dengan filter tersebut."
                    : "Belum ada data pegawai."}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} onClick={() => setCurrentPage(i+1)}
                    className={`px-4 py-2 rounded ${currentPage === i+1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {i+1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedEmployee && (
        <div className="fixed inset-0 z-[999999] bg-black/60 flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detail Pegawai</h2>
              <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div><Label>Nama Lengkap</Label><p className="text-lg font-medium">{selectedEmployee.name}</p></div>
              <div><Label>Email</Label><p className="text-lg">{selectedEmployee.email}</p></div>
              <div><Label>Telepon</Label><p className="text-lg">{selectedEmployee.phone}</p></div>
              <div><Label>Role</Label>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {roleLabels[selectedEmployee.role]}
                </span>
              </div>
              <div><Label>Tanggal Bergabung</Label><p className="text-lg">{formatDate(selectedEmployee.joinDate)}</p></div>
              {selectedEmployee.address && (
                <div><Label>Alamat</Label><p className="text-lg">{selectedEmployee.address}</p></div>
              )}
              <div><Label>Status</Label>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedEmployee.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedEmployee.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editingEmployee ? "Edit" : "Tambah"} Pegawai</h2>
              <button onClick={() => { setIsEditDrawerOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  options={[
                    { value: "ADMIN", label: "Administrator" },
                    { value: "MANAGER", label: "Manajer" },
                    { value: "STAFF", label: "Staf" },
                    { value: "WAREHOUSE", label: "Gudang" },
                  ]}
                  defaultValue={role}
                  onChange={(v) => setRole(v as Employee["role"])}
                />
              </div>

              <div>
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                  placeholder="Masukkan alamat lengkap..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                  Simpan
                </button>
                <button type="button" onClick={() => { setIsEditDrawerOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}