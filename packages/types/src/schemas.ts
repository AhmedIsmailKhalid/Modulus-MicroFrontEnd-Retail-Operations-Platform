import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Product ──────────────────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be under 120 characters"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(40, "SKU must be under 40 characters")
    .regex(/^[A-Z0-9\-_]+$/i, "SKU can only contain letters, numbers, hyphens and underscores"),
  category: z.string().min(1, "Category required"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(100_000_00, "Price exceeds maximum"),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial().omit({ sku: true });
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const UpdateProductStatusSchema = z.object({
  active: z.boolean(),
});

export type UpdateProductStatusInput = z.infer<typeof UpdateProductStatusSchema>;

// ─── Category ─────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(60, "Category name must be under 60 characters"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

// ─── Order ────────────────────────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  note: z.string().max(200).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ─── Analytics ────────────────────────────────────────────────────────────────

export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
});

export type DateRangeInput = z.infer<typeof DateRangeSchema>;
