import { useState } from "react";
import { Pencil, ToggleLeft, ToggleRight, ImageOff } from "lucide-react";

import { Table, Pagination, Badge, Button, EmptyState, TableSkeleton } from "@modulus/ui";
import type { ColumnDef } from "@modulus/ui";
import type { Product } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";
import { StockBadge } from "./StockBadge";
import { DeactivateModal } from "./DeactivateModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductTableProps = {
  onSuccess: (product: Product, message: string) => void;
  onError: (message: string) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductTable({ onSuccess, onError }: ProductTableProps) {
  const {
    products, total, totalPages, page, isLoading,
    setPage, openEdit, upsertProduct,
  } = useInventoryStore();

  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      key: "image",
      header: "",
      width: "56px",
      align: "center",
      cell: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="h-10 w-10 rounded-md object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
            <ImageOff className="h-4 w-4 text-gray-400" />
          </div>
        ),
    },
    {
      key: "name",
      header: "Product",
      cell: (row) => (
        <div data-testid={`product-row-${row.sku}`}>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <Badge variant="default">{row.category}</Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      cell: (row) => (
        <span className="font-medium text-gray-900">{formatPrice(row.price)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => <StockBadge stock={row.stock} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.active ? "success" : "default"}>
          {row.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { openEdit(row); }}
            aria-label={`Edit ${row.name}`}
            data-testid={`edit-product-${row.sku}`}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setDeactivateTarget(row); }}
            aria-label={row.active ? `Deactivate ${row.name}` : `Reactivate ${row.name}`}
            data-testid={`toggle-product-${row.sku}`}
            className="h-8 w-8 p-0"
          >
            {row.active
              ? <ToggleRight className="h-4 w-4 text-green-500" />
              : <ToggleLeft className="h-4 w-4 text-gray-400" />
            }
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <TableSkeleton rows={8} cols={6} />;
  }

  return (
    <>
      <Table<Product>
        columns={columns}
        data={products}
        keyExtractor={(row) => row.id}
        emptyState={
          <EmptyState
            title="No products found"
            description="Try adjusting your search or filters, or add a new product."
          />
        }
        data-testid="product-table"
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

      <DeactivateModal
        product={deactivateTarget}
        onClose={() => { setDeactivateTarget(null); }}
        onSuccess={(product, message) => {
          upsertProduct(product);
          setDeactivateTarget(null);
          onSuccess(product, message);
        }}
        onError={onError}
      />
    </>
  );
}
