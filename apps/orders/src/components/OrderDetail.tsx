import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@modulus/ui";
import type { Order } from "@modulus/types";

import { useOrdersStore } from "../store/ordersStore";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderDetailProps = {
  onUpdateStatus: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetail({ onUpdateStatus }: OrderDetailProps) {
  const { selectedOrder, closeDetail } = useOrdersStore();

  if (!selectedOrder) return null;

  const order: Order = selectedOrder;

  return (
    <div className="flex flex-col gap-6" data-testid="order-detail">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDetail}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="h-8"
            data-testid="back-to-orders"
          >
            Back to Orders
          </Button>
          <span className="text-gray-300">|</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{order.id}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500">Placed {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onUpdateStatus}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          data-testid="update-status-btn"
        >
          Update Status
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col — order info */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</p>
                  <p className="mt-1 text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                  <p className="mt-1 text-gray-900">{order.customerEmail}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Shipping Address</p>
                  <p className="mt-1 text-gray-900">{order.shippingAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                    <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Unit Price</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </td>
                      <td className="py-2.5 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-4 flex flex-col gap-1.5 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right col — timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline timeline={order.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
