import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  BarChart3,
  ChevronDown,
  Home,
  Package,
  ShoppingCart,
  UserCircle,
  Users
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import {
  HorizontaLDots
} from "../icons";

// Fungsi ambil user dari localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: {
    name: string;
    path: string;
    new?: boolean;
    pro?: boolean;
    roles?: string[];
  }[];
};

const allNavItems: NavItem[] = [
  {
    icon: <Home className="w-5 h-5" />,
    name: "Halaman Utama",
    path: "/",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "Penjualan",
    path: "/penjualan",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Inventori",
    subItems: [
      { name: "Daftar Produk", path: "/manajemen-produk" },
      { name: "Stok Opname", path: "/stok-opname" },
      { name: "Kategori", path: "/manajemen-kategori" },
      { name: "Satuan", path: "/manajemen-satuan" },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Manajemen",
    subItems: [
      { name: "Data Pelanggan", path: "/pelanggan" },
      { name: "Data Pegawai", path: "/manajemen-pegawai" },
    ],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    name: "Laporan",
    path: "/laporan",
  },
  {
    icon: <UserCircle className="w-5 h-5" />,
    name: "Profil Akun",
    path: "/profile",
  },
];

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
    openSubmenu,
    toggleSubmenu,
  } = useSidebar();

  const location = useLocation();
  const currentUser = getCurrentUser();
  const userRoleNormalized = (currentUser?.role || "ADMIN").toUpperCase();

  const [subMenuHeight, setSubMenuHeight] = useState<any>({});
  const subMenuRefs = useRef<any>({});
  console.log('subMenuHeight', subMenuHeight)

  const filteredNavItems = allNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some(
      (allowedRole) => allowedRole.toUpperCase() === userRoleNormalized
    );
  });

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleMenuClick = () => {
    if (isMobileOpen) toggleMobileSidebar();
    if (!isExpanded && isHovered) setIsHovered(false);
  };

  useEffect(() => {
    let matchedSubmenu: string | null = null;

    filteredNavItems.forEach((nav) => {
      if (nav.subItems) {
        const hasActiveChild = nav.subItems.some((sub) => location.pathname === sub.path);
        if (hasActiveChild) {
          matchedSubmenu = nav.name;
        }
      }
  });

  // Hanya jalankan toggle jika menu yang aktif belum terbuka
  if (matchedSubmenu && openSubmenu !== matchedSubmenu) {
    toggleSubmenu(matchedSubmenu);
  }
  // HAPUS bagian 'else if (!matchedSubmenu && openSubmenu)' 
  // agar menu tidak tertutup otomatis saat navigasi ke halaman tanpa submenu.
}, [location.pathname]);
  // Hitung tinggi untuk animasi transisi slide-down
  useEffect(() => {
    if (openSubmenu) {
      const key = `main-${openSubmenu}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prev: any) => ({
          ...prev,
          [key]: el.scrollHeight,
        }));
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav) => {
        const isSubmenuOpen = openSubmenu === nav.name;
        const hasSubItems = !!nav.subItems;

        // Cek apakah ada anak yang aktif
        const hasActiveChild = nav.subItems?.some(sub => isActive(sub.path));

        return (
          <li key={nav.name}>
            {hasSubItems ? (
              <button
                type="button" // Pastikan type button agar tidak trigger submit form
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu(nav.name);
                }}
                className={`menu-item group w-full ${
                  isSubmenuOpen || hasActiveChild ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`menu-item-icon-size ${(isSubmenuOpen || hasActiveChild) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDown
                      className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                        isSubmenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              <Link
                to={nav.path!}
                className={`menu-item group ${
                  isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"
                }`}
                onClick={handleMenuClick}
              >
                <span className={`menu-item-icon-size ${isActive(nav.path!) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )}

            {/* Submenu Area */}
            {hasSubItems && (isExpanded || isHovered || isMobileOpen) && (
             <div
                ref={(el) => {
                  if (el) {
                    subMenuRefs.current[`main-${nav.name}`] = el;
                  }
                }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  // Logika: Tetap buka jika state openSubmenu sesuai, atau jika ada child yang aktif
                  height: isSubmenuOpen ? `${subMenuRefs.current[`main-${nav.name}`]?.scrollHeight}px` : "0px",
                }}
              >
                <ul className="mt-1 ml-9 flex flex-col gap-1 border-l border-gray-100 dark:border-gray-800">
                  {nav.subItems?.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item py-2 px-3 rounded-md text-sm block transition-colors ${
                          isActive(subItem.path)
                            ? "text-brand-600 bg-brand-50 dark:bg-brand-900/20 font-medium"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        }`}
                        onClick={handleMenuClick} // Menutup sidebar di mobile setelah klik
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className={`py-6 border-b border-gray-100 dark:border-gray-800 w-full flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/" onClick={handleMenuClick} className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-bold text-xl tracking-tight dark:text-white">KiraFarm</span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto pt-6 no-scrollbar flex-1">
        <nav className="mb-6">
          <h2 className={`mb-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 ${!isExpanded && !isHovered ? "text-center" : "px-2"}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menu Utama" : <HorizontaLDots className="w-5 h-5 mx-auto" />}
          </h2>
          {renderMenuItems(filteredNavItems)}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;