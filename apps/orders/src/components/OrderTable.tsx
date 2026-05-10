import { Table, Pagination, EmptyState, TableSkeleton } from "@modulus/ui";
import type { ColumnDef } from "@modulus/ui";
import type { Order } from "@modulus/types";

import { useOrdersStore } from "../store/ordersStore";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderTable() {
  const {
    orders, total, totalPages, page,
    isLoading, setPage, openDetail,
  } = useOrdersStore();

  const columns: ColumnDef<Order>[] = [
    {
      key:    "id",
      header: "Order ID",
      cell:   (row) => (
        <button
          data-testid={`order-row-${row.id}`}
          onClick={() => { openDetail(row); }}
          className="font-mono text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          #{row.id.slice(0, 8).toUpperCase()}
        </button>
      ),
    },
    {
      key:    "customerName",
      header: "Customer",
      cell:   (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.customerName}</p>
          <p className="text-xs text-gray-500">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key:    "status",
      header: "Status",
      cell:   (row) => <OrderStatusBadge status={row.status} />,
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
      key:    "items",
      header: "Items",
      align:  "center",
      cell:   (row) => (
        <span className="text-sm text-gray-600">{row.items.length}</span>
      ),
    },
    {
      key:    "createdAt",
      header: "Date",
      cell:   (row) => (
        <span className="text-sm text-gray-600">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  if (isLoading) {
    return <TableSkeleton rows={8} cols={6} />;
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
            description="Try adjusting your search or status filter."
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