import { useCallback, useEffect } from "react";

import type { Order, PaginatedResponse } from "@modulus/types";

import { useOrdersStore } from "../store/ordersStore";

const LIMIT = 20;

export function useOrders() {
  const store = useOrdersStore();

  const fetchOrders = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);

    const params = new URLSearchParams({
      page:  String(store.page),
      limit: String(LIMIT),
    });

    if (store.search)       params.set("search", store.search);
    if (store.statusFilter) params.set("status", store.statusFilter);

    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json() as PaginatedResponse<Order>;
      store.setOrders(data.data, data.pagination.total, data.pagination.totalPages);
    } catch {
      store.setError("Failed to load orders. Please try again.");
    } finally {
      store.setLoading(false);
    }
  }, [store.page, store.search, store.statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return { refetch: fetchOrders };
}
