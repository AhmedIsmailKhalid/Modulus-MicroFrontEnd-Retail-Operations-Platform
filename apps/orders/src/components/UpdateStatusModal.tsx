import { useState } from "react";

import { Modal, Button } from "@modulus/ui";
import type { Order, OrderStatus } from "@modulus/types";
import { VALID_TRANSITIONS } from "@modulus/types";

import { useOrdersStore } from "../store/ordersStore";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

type UpdateStatusModalProps = {
  onSuccess: (order: Order, message: string) => void;
  onError: (message: string) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function UpdateStatusModal({ onSuccess, onError }: UpdateStatusModalProps) {
  const {
    isStatusModalOpen, closeStatusModal,
    selectedOrder, updateOrder,
  } = useOrdersStore();

  const [newStatus, setNewStatus]   = useState<OrderStatus | "">("");
  const [note, setNote]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedOrder) return null;

  const validNextStatuses = VALID_TRANSITIONS[selectedOrder.status] ?? [];

  function handleClose() {
    setNewStatus("");
    setNote("");
    closeStatusModal();
  }

  async function handleConfirm() {
    if (!selectedOrder || !newStatus) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...(note ? { note } : {}) }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to update status");
      }

      const updated = await res.json() as Order;
      updateOrder(updated);
      onSuccess(updated, `Order ${updated.id} updated to "${STATUS_LABELS[updated.status]}".`);
      handleClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={isStatusModalOpen}
      onClose={handleClose}
      title="Update Order Status"
      size="sm"
      data-testid="update-status-modal"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => { void handleConfirm(); }}
            loading={isSubmitting}
            disabled={!newStatus}
          >
            Confirm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Current status */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-xs text-gray-500">Current:</span>
          <OrderStatusBadge status={selectedOrder.status} />
        </div>

        {/* New status selector */}
        {validNextStatuses.length === 0 ? (
          <p className="text-sm text-gray-500">
            This order is in a terminal state and cannot be updated further.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              New Status <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1.5">
              {validNextStatuses.map((status) => (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={newStatus === status}
                    onChange={() => { setNewStatus(status); }}
                    className="text-blue-600"
                  />
                  <OrderStatusBadge status={status} />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Optional note */}
        {validNextStatuses.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); }}
              placeholder="Add a note about this status change..."
              rows={2}
              maxLength={200}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
