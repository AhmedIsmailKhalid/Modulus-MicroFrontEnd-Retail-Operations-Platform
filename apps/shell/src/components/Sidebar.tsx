import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, BarChart3 } from "lucide-react";

import { cn } from "@modulus/ui";
import type { UserRole } from "@modulus/types";

// ─── Nav Items ────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
  testId: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Inventory",
    path: "/inventory",
    icon: <Package className="h-5 w-5" />,
    roles: ["ops_manager", "inventory_staff"],
    testId: "nav-inventory",
  },
  {
    label: "Orders",
    path: "/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["ops_manager", "fulfilment_staff"],
    testId: "nav-orders",
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["ops_manager"],
    testId: "nav-analytics",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarProps = {
  userRole: UserRole;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({ userRole }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className="flex h-full w-56 flex-col border-r border-gray-200 bg-white"
      data-testid="shell-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <LayoutDashboard className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-gray-900">Modulus</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1" role="list">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                data-testid={item.testId}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <p className="px-3 text-xs text-gray-400">Retail Operations v1.0</p>
      </div>
    </aside>
  );
}
