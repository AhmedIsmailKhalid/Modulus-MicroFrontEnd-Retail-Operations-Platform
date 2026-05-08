import { create } from "zustand";

import type { Order } from "@modulus/types";

type OrdersStore = {
  // Data
  orders: Order[];
  selectedOrder: Order | null;
  total: number;
  totalPages: number;

  // Filters
  page: number;
  search: string;
  statusFilter: string;

  // UI state
  isDetailOpen: boolean;
  isStatusModalOpen: boolean;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;

  // Actions
  setOrders: (orders: Order[], total: number, totalPages: number) => void;
  setSelectedOrder: (order: Order | null) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  openDetail: (order: Order) => void;
  closeDetail: () => void;
  openStatusModal: () => void;
  closeStatusModal: () => void;
  setLoading: (loading: boolean) => void;
  setDetailLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateOrder: (order: Order) => void;
};

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  selectedOrder: null,
  total: 0,
  totalPages: 1,
  page: 1,
  search: "",
  statusFilter: "",
  isDetailOpen: false,
  isStatusModalOpen: false,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  setOrders: (orders, total, totalPages) =>
    set({ orders, total, totalPages }),

  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),

  setPage: (page) => set({ page }),

  setSearch: (search) => set({ search, page: 1 }),

  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),

  openDetail: (order) => set({ selectedOrder: order, isDetailOpen: true }),

  closeDetail: () => set({ isDetailOpen: false, selectedOrder: null }),

  openStatusModal: () => set({ isStatusModalOpen: true }),

  closeStatusModal: () => set({ isStatusModalOpen: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setDetailLoading: (isDetailLoading) => set({ isDetailLoading }),

  setError: (error) => set({ error }),

  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? order : o)),
      selectedOrder:
        state.selectedOrder?.id === order.id ? order : state.selectedOrder,
    })),
}));
