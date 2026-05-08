import { useState } from "react";

import { SlideOver } from "@modulus/ui";
import type { Product } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";
import { ProductForm } from "./ProductForm";

type EditProductSlideOverProps = {
  onSuccess: (product: Product, message: string) => void;
  onError: (message: string) => void;
};

export function EditProductSlideOver({ onSuccess, onError: _onError }: EditProductSlideOverProps) {
  const { isEditOpen, closeEdit, selectedProduct, upsertProduct } = useInventoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSuccess(product: Product) {
    upsertProduct(product);
    closeEdit();
    onSuccess(product, `"${product.name}" has been updated.`);
  }

  if (!selectedProduct) return null;

  return (
    <SlideOver
      open={isEditOpen}
      onClose={closeEdit}
      title="Edit Product"
      description={`Editing ${selectedProduct.name}`}
      data-testid="edit-product-panel"
    >
      <ProductForm
        product={selectedProduct}
        onSuccess={handleSuccess}
        onCancel={closeEdit}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </SlideOver>
  );
}
