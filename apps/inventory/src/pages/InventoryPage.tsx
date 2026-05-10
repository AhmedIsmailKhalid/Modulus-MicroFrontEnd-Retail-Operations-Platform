import { Plus, Tag, AlertCircle } from "lucide-react";

import { Button, ToastContainer, useToast } from "@modulus/ui";
import type { Product } from "@modulus/types";

import { useProducts } from "../hooks/useProducts";
import { useInventoryStore } from "../store/inventoryStore";
import { ProductFilters } from "../components/ProductFilters";
import { ProductTable } from "../components/ProductTable";
import { AddProductSlideOver } from "../components/AddProductSlideOver";
import { EditProductSlideOver } from "../components/EditProductSlideOver";
import { CategoryModal } from "../components/CategoryModal";

export function InventoryPage() {
  const { openAdd, openCategory, error } = useInventoryStore();
  const { refetch } = useProducts();
  const toast = useToast();

  function handleSuccess(_product: Product, message: string) {
    toast.success(message);
    void refetch();
  }

  function handleError(message: string) {
    toast.error(message);
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="inventory-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage your product catalogue and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openCategory}
            leftIcon={<Tag className="h-4 w-4" />}
            data-testid="manage-categories-btn"
          >
            Categories
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAdd}
            leftIcon={<Plus className="h-4 w-4" />}
            data-testid="add-product-btn"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => { void refetch(); }}
            className="ml-auto font-medium underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <ProductFilters />

      {/* Table */}
      <ProductTable onSuccess={handleSuccess} onError={handleError} />

      {/* Panels & Modals */}
      <AddProductSlideOver  onSuccess={handleSuccess} onError={handleError} />
      <EditProductSlideOver onSuccess={handleSuccess} onError={handleError} />
      <CategoryModal onSuccess={(msg) => { toast.success(msg); }} onError={handleError} />

      {/* Toasts */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}