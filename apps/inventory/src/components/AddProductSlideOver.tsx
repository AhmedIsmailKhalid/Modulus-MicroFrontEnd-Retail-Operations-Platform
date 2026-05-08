import { useState } from "react";

import { SlideOver } from "@modulus/ui";
import type { Product } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";
import { ProductForm } from "./ProductForm";

type AddProductSlideOverProps = {
  onSuccess: (product: Product, message: string) => void;
  onError: (message: string) => void;
};

export function AddProductSlideOver({ onSuccess, onError: _onError }: AddProductSlideOverProps) {
  const { isAddOpen, closeAdd, upsertProduct } = useInventoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);  function handleSuccess(product: Product) {
    upsertProduct(product);
    closeAdd();
    onSuccess(product, `"${product.name}" has been added to inventory.`);
  }

  return (
    <SlideOver
      open={isAddOpen}
      onClose={closeAdd}
      title="Add Product"
      description="Add a new product to the inventory catalogue."
      data-testid="add-product-panel"
    >
      <ProductForm
        onSuccess={handleSuccess}
        onCancel={closeAdd}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </SlideOver>
  );
}
