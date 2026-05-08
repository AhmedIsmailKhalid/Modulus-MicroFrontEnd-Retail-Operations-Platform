import { Suspense, lazy } from "react";

import { TableSkeleton, ChartSkeleton } from "@modulus/ui";

import { RemoteErrorBoundary } from "./RemoteErrorBoundary";

// ─── Loading Fallbacks ────────────────────────────────────────────────────────

function InventoryFallback() {
  return (
    <div className="flex flex-col gap-4 p-6" data-testid="remote-loading">
      <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

function OrdersFallback() {
  return (
    <div className="flex flex-col gap-4 p-6" data-testid="remote-loading">
      <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}

function AnalyticsFallback() {
  return (
    <div className="flex flex-col gap-6 p-6" data-testid="remote-loading">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
    </div>
  );
}

// ─── Remote lazy imports ──────────────────────────────────────────────────────

// These resolve at runtime via Module Federation
const InventoryApp = lazy(async () => {
  const mod = await import("inventory/App" as string) as { default: React.ComponentType };
  return { default: mod.default };
});

const OrdersApp = lazy(async () => {
  const mod = await import("orders/App" as string) as { default: React.ComponentType };
  return { default: mod.default };
});

const AnalyticsApp = lazy(async () => {
  const mod = await import("analytics/App" as string) as { default: React.ComponentType };
  return { default: mod.default };
});

// ─── Remote Loader Components ─────────────────────────────────────────────────

export function InventoryRemote() {
  return (
    <RemoteErrorBoundary remoteName="Inventory">
      <Suspense fallback={<InventoryFallback />}>
        <InventoryApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

export function OrdersRemote() {
  return (
    <RemoteErrorBoundary remoteName="Orders">
      <Suspense fallback={<OrdersFallback />}>
        <OrdersApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

export function AnalyticsRemote() {
  return (
    <RemoteErrorBoundary remoteName="Analytics">
      <Suspense fallback={<AnalyticsFallback />}>
        <AnalyticsApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
