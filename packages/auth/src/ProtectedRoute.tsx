import type { UserRole } from "@modulus/types";

import { useAuth } from "./context";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = null,
  unauthorizedFallback = null,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <>{unauthorizedFallback}</>;
  }

  return <>{children}</>;
}
