import { Navigate, Route, Routes } from "react-router-dom";

import type { UserRole } from "@modulus/types";

import { ShellLayout } from "../components/ShellLayout";
import { InventoryRemote, OrdersRemote, AnalyticsRemote } from "../components/RemoteLoader";
import { AccessDeniedPage } from "../pages/AccessDeniedPage";
import { LoginPage } from "../pages/LoginPage";
import { useAuthStore } from "../store/authStore";

// ─── Role-gated section component ────────────────────────────────────────────

const SECTION_ROLES: Record<string, UserRole[]> = {
  inventory: ["ops_manager", "inventory_staff"],
  orders:    ["ops_manager", "fulfilment_staff"],
  analytics: ["ops_manager"],
};

type GuardedSectionProps = {
  section: keyof typeof SECTION_ROLES;
  children: React.ReactNode;
};

function GuardedSection({ section, children }: GuardedSectionProps) {
  const user = useAuthStore((s) => s.user);
  const allowedRoles = SECTION_ROLES[section] ?? [];

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function AppRouter() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/inventory" replace /> : <LoginPage />}
      />

      {/* Authenticated shell */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <ShellLayout>
              <Routes>
                <Route index element={<Navigate to="/inventory" replace />} />
                <Route
                  path="inventory"
                  element={
                    <GuardedSection section="inventory">
                      <InventoryRemote />
                    </GuardedSection>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <GuardedSection section="orders">
                      <OrdersRemote />
                    </GuardedSection>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <GuardedSection section="analytics">
                      <AnalyticsRemote />
                    </GuardedSection>
                  }
                />
                <Route path="*" element={<Navigate to="/inventory" replace />} />
              </Routes>
            </ShellLayout>
          </RequireAuth>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/inventory" : "/login"} replace />} />
    </Routes>
  );
}
