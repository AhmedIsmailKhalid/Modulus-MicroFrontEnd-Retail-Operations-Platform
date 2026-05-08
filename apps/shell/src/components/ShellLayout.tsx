import { useNavigate } from "react-router-dom";

import { ToastContainer, useToast } from "@modulus/ui";

import { useAuthStore } from "../store/authStore";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShellLayoutProps = {
  children: React.ReactNode;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ShellLayout({ children }: ShellLayoutProps) {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const logout    = useAuthStore((s) => s.logout);
  const toast     = useToast();

  if (!user) return null;

  function handleLogout() {
    logout();
    toast.info("You have been signed out.");
    void navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" data-testid="shell-layout">
      <Sidebar userRole={user.role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto scrollbar-thin" data-testid="shell-main">
          {children}
        </main>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
