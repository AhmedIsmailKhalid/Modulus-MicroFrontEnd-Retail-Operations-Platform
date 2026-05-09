import { Table, Pagination, EmptyState, TableSkeleton } from "@modulus/ui";
import type { ColumnDef } from "@modulus/ui";
import type { Order } from "@modulus/types";

import { useOrdersStore } from "../store/ordersStore";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderTable() {
  const {
    orders, total, totalPages, page, isLoading,
    setPage, openDetail,
  } = useOrdersStore();

  const columns: ColumnDef<Order>[] = [
    {
      key:    "id",
      header: "Order ID",
      cell:   (row) => (
        <button
          className="font-mono text-sm font-medium text-blue-600 hover:underline text-left"
          onClick={() => { openDetail(row); }}
          data-testid={`order-row-${row.id}`}
        >
          {row.id}
        </button>
      ),
    },
    {
      key:    "customer",
      header: "Customer",
      cell:   (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.customerName}</p>
          <p className="text-xs text-gray-500">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key:    "items",
      header: "Items",
      align:  "center",
      cell:   (row) => (
        <span className="text-sm text-gray-700">{row.items.length}</span>
      ),
    },
    {
      key:    "total",
      header: "Total",
      align:  "right",
      cell:   (row) => (
        <span className="font-medium text-gray-900">{formatPrice(row.total)}</span>
      ),
    },
    {
      key:    "status",
      header: "Status",
      cell:   (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key:    "createdAt",
      header: "Date",
      cell:   (row) => (
        <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  if (isLoading) {
    return <TableSkeleton rows={10} cols={6} />;
  }

  return (
    <>
      <Table<Order>
        columns={columns}
        data={orders}
        keyExtractor={(row) => row.id}
        emptyState={
          <EmptyState
            title="No orders found"
            description="Try adjusting your search or filters."
          />
        }
        data-testid="order-table"
      />

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={20}
          onPageChange={setPage}
        />
      )}
    </>
  );
}