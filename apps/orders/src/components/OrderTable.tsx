import { Pagination, EmptyState, TableSkeleton } from "@modulus/ui";

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
    orders, total, totalPages, page,
    isLoading, setPage, openDetail,
  } = useOrdersStore();

  if (isLoading) {
    return <TableSkeleton rows={8} cols={6} />;
  }

  return (
    <>
      <div
        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
        data-testid="order-table"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No orders found"
                      description="Try adjusting your search or status filter."
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    onClick={() => { openDetail(order); }}
                    className={[
                      "cursor-pointer border-b border-gray-100 transition-colors last:border-0 hover:bg-blue-50",
                      idx % 2 === 1 ? "bg-gray-50/50" : "",
                    ].join(" ")}
                    data-testid={`order-row-${order.id}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-blue-600">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

