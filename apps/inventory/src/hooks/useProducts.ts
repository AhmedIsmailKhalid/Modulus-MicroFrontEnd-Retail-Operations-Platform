import { useCallback, useEffect } from "react";

import type { Product, Category, PaginatedResponse } from "@modulus/types";

import { useInventoryStore } from "../store/inventoryStore";

const LIMIT = 20;

export function useProducts() {
  const store = useInventoryStore();

  const fetchProducts = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);

    const params = new URLSearchParams({
      page: String(store.page),
      limit: String(LIMIT),
    });

    if (store.search)         params.set("search", store.search);
    if (store.categoryFilter) params.set("category", store.categoryFilter);
    if (store.stockFilter)    params.set("stockStatus", store.stockFilter);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json() as PaginatedResponse<Product>;
      store.setProducts(data.data, data.pagination.total, data.pagination.totalPages);
    } catch {
      store.setError("Failed to load products. Please try again.");
    } finally {
      store.setLoading(false);
    }
  }, [store.page, store.search, store.categoryFilter, store.stockFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return;
      const data = await res.json() as { data: Category[] };
      store.setCategories(data.data);
    } catch {
      // Non-critical — categories just won't populate the filter
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return { refetch: fetchProducts };
}
