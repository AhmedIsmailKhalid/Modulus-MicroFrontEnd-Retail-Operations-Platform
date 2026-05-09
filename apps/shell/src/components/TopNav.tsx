import { useState } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";

import type { User as UserType } from "@modulus/types";
import { cn } from "@modulus/ui";

// ─── Role labels ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserType["role"], string> = {
  ops_manager:      "Operations Manager",
  inventory_staff:  "Inventory Staff",
  fulfilment_staff: "Fulfilment Staff",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type TopNavProps = {
  user: UserType;
  onLogout: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TopNav({ user, onLogout }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left — breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Retail Operations Platform</span>
      </div>

      {/* Right — user menu */}
      <div className="relative" data-testid="user-display">
        <button
          onClick={() => { setMenuOpen((o) => !o); }}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          data-testid="user-menu-button"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="font-medium text-gray-900" data-testid="user-name">{user.name}</p>
            <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", menuOpen && "rotate-180")} />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => { setMenuOpen(false); }}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-xs font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}