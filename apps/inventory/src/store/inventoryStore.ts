import { create } from "zustand";

import type { Product, Category } from "@modulus/types";

type InventoryStore = {
  // Data
  products: Product[];
  categories: Category[];
  total: number;
  totalPages: number;

  // Filters
  page: number;
  search: string;
  categoryFilter: string;
  stockFilter: string;

  // UI state
  selectedProduct: Product | null;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isCategoryOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[], total: number, totalPages: number) => void;
  setCategories: (categories: Category[]) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setCategoryFilter: (category: string) => void;
  setStockFilter: (stock: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  openAdd: () => void;
  closeAdd: () => void;
  openEdit: (product: Product) => void;
  closeEdit: () => void;
  openCategory: () => void;
  closeCategory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  products: [],
  categories: [],
  total: 0,
  totalPages: 1,
  page: 1,
  search: "",
  categoryFilter: "",
  stockFilter: "",
  selectedProduct: null,
  isAddOpen: false,
  isEditOpen: false,
  isCategoryOpen: false,
  isLoading: false,
  error: null,

  setProducts: (products, total, totalPages) =>
    set({ products, total, totalPages }),

  setCategories: (categories) => set({ categories }),

  setPage: (page) => set({ page }),

  setSearch: (search) => set({ search, page: 1 }),

  setCategoryFilter: (categoryFilter) => set({ categoryFilter, page: 1 }),

  setStockFilter: (stockFilter) => set({ stockFilter, page: 1 }),

  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  openAdd: () => set({ isAddOpen: true }),
  closeAdd: () => set({ isAddOpen: false }),

  openEdit: (product) => set({ selectedProduct: product, isEditOpen: true }),
  closeEdit: () => set({ isEditOpen: false, selectedProduct: null }),

  openCategory: () => set({ isCategoryOpen: true }),
  closeCategory: () => set({ isCategoryOpen: false }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  upsertProduct: (product) =>
    set((state) => {
      const idx = state.products.findIndex((p) => p.id === product.id);
      if (idx === -1) {
        return { products: [product, ...state.products] };
      }
      const next = [...state.products];
      next[idx] = product;
      return { products: next };
    }),

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === category.id ? category : c,
      ),
    })),
}));
