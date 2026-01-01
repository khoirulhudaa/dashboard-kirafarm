import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  BarChart3,
  Home,
  Package,
  Scale,
  ShoppingCart,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
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
  roles?: string[]; // jika ingin role-based access di masa depan
  subItems?: {
    name: string;
    path: string;
    new?: boolean;
    pro?: boolean;
    roles?: string[];
  }[];
};

// Daftar menu baru sesuai dengan halaman penjualan produk
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
    name: "Produk",
    path: "/manajemen-produk",
  },
  {
    icon: <Tags className="w-5 h-5" />,
    name: "Kategori",
    path: "/manajemen-kategori",
  },
  {
    icon: <Scale className="w-5 h-5" />,
    name: "Satuan",
    path: "/manajemen-satuan",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Pelanggan",
    path: "/pelanggan",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    name: "Laporan",
    path: "/laporan",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Pegawai",
    path: "/manajemen-pegawai",
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

  // Normalisasi role (untuk masa depan jika pakai RBAC)
  const userRoleNormalized = (currentUser?.role || "ADMIN").toUpperCase();

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Saat ini tidak ada filter role, semua menu ditampilkan
  // Jika ingin RBAC, cukup tambahkan properti roles di allNavItems
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
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
    if (!isExpanded && isHovered) {
      setIsHovered(false);
    }
  };

  // Auto-open submenu jika salah satu subitem aktif
  useEffect(() => {
    let matchedSubmenu: string | null = null;

    filteredNavItems.forEach((nav) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            matchedSubmenu = nav.name;
          }
        });
      }
    });

    if (matchedSubmenu && openSubmenu !== matchedSubmenu) {
      toggleSubmenu(matchedSubmenu);
    } else if (!matchedSubmenu && openSubmenu) {
      toggleSubmenu(openSubmenu);
    }
  }, [location.pathname, isActive, openSubmenu, toggleSubmenu, filteredNavItems]);

  // Update tinggi submenu saat dibuka
  useEffect(() => {
    if (openSubmenu) {
      const key = `main-${openSubmenu}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: el.scrollHeight,
        }));
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => {
        const isSubmenuOpen = openSubmenu === nav.name;
        const hasSubItems = !!nav.subItems;

        // Filter subitems (jika ada role di masa depan)
        const visibleSubItems = nav.subItems?.filter((sub) => {
          if (!sub.roles) return true;
          return sub.roles.some(
            (allowedRole) => allowedRole.toUpperCase() === userRoleNormalized
          );
        });

        // Jika parent punya subitems tapi tidak ada yang visible → sembunyikan
        if (hasSubItems && (!visibleSubItems || visibleSubItems.length === 0)) {
          return null;
        }

        return (
          <li key={nav.name}>
            {hasSubItems && visibleSubItems && visibleSubItems.length > 0 ? (
              <button
                onClick={() => toggleSubmenu(nav.name)}
                className={`menu-item group ${
                  isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isSubmenuOpen
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              <Link
                to={nav.path!}
                className={`menu-item group ${
                  isActive(nav.path!)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
                onClick={handleMenuClick}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path!)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )}

            {/* Submenu */}
            {hasSubItems &&
              visibleSubItems &&
              visibleSubItems.length > 0 &&
              (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el: any) =>
                    (subMenuRefs.current[`main-${nav.name}`] = el)
                  }
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height: isSubmenuOpen
                      ? `${subMenuHeight[`main-${nav.name}`] || 0}px`
                      : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {visibleSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                          onClick={handleMenuClick}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span className="menu-dropdown-badge menu-dropdown-badge-inactive">
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span className="menu-dropdown-badge menu-dropdown-badge-inactive">
                                pro
                              </span>
                            )}
                          </span>
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
      <div
        className={`py-6 border-b border-gray-200 w-full flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" onClick={handleMenuClick}>
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3 w-full">
              <a href="https://www.flaticon.com/free-icons/vegetable" title="vegetable icons">
                <img src="/logo.png" className="h-[30px] text-white dark:text-blue-400" /> {/* Icon perisai melambangkan integritas & pemasyarakatan */}
              </a>
              <span className="relative top-[1px] font-bold text-xl text-gray-900 dark:text-white">
                KiraFarm
              </span>
            </div>
          ) : (
            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 pt-8 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu Utama"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;