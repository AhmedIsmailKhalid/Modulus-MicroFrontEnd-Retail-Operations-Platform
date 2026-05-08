import { useState } from "react";

import { Modal, Button } from "@modulus/ui";
import type { Product } from "@modulus/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeactivateModalProps = {
  product: Product | null;
  onClose: () => void;
  onSuccess: (product: Product, message: string) => void;
  onError: (message: string) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DeactivateModal({ product, onClose, onSuccess, onError }: DeactivateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const willDeactivate = product.active;

  async function handleConfirm() {
    if (!product) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${product.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Request failed");
      }

      const updated = await res.json() as Product;
      const action  = updated.active ? "reactivated" : "deactivated";
      onSuccess(updated, `"${updated.name}" has been ${action}.`);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed. Please try again.";
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={willDeactivate ? "Deactivate Product" : "Reactivate Product"}
      size="sm"
      data-testid="deactivate-modal"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={willDeactivate ? "destructive" : "primary"}
            onClick={() => { void handleConfirm(); }}
            loading={isSubmitting}
          >
            {willDeactivate ? "Deactivate" : "Reactivate"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        {willDeactivate
          ? `Are you sure you want to deactivate "${product.name}"? It will no longer appear in active product listings.`
          : `Are you sure you want to reactivate "${product.name}"? It will become visible in active product listings.`}
      </p>
    </Modal>
  );
}
