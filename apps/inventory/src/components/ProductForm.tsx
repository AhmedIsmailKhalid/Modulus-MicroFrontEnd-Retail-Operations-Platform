import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input, Select } from "@modulus/ui";
import { CreateProductSchema, type CreateProductInput } from "@modulus/types";
import type { Product } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductFormProps = {
  product?: Product;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({
  product,
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: ProductFormProps) {
  const categories = useInventoryStore((s) => s.categories);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: product.price / 100,
          stock: product.stock,
          imageUrl: product.imageUrl ?? "",
        }
      : { stock: 0, price: 0 },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price / 100,
        stock: product.stock,
        imageUrl: product.imageUrl ?? "",
      });
    }
  }, [product, reset]);

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  async function onSubmit(data: CreateProductInput) {
    setIsSubmitting(true);
    const priceInCents = Math.round(data.price * 100);
    const payload = { ...data, price: priceInCents };

    try {
      const url    = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Request failed");
      }

      const saved = await res.json() as Product;
      onSuccess(saved);
    } catch (err) {
      // Error handled by caller via toast
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Product Name"
        placeholder="Wireless Headphones"
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="SKU"
        placeholder="ELEC-001"
        required
        disabled={!!product}
        error={errors.sku?.message}
        hint={product ? "SKU cannot be changed after creation" : undefined}
        {...register("sku")}
      />

      <Select
        label="Category"
        required
        options={categoryOptions}
        placeholder="Select a category"
        error={errors.category?.message}
        {...register("category")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          min="0"
          placeholder="29.99"
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          placeholder="100"
          required
          error={errors.stock?.message}
          {...register("stock", { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Image URL"
        type="url"
        placeholder="https://..."
        error={errors.imageUrl?.message}
        {...register("imageUrl")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
