// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = "ops_manager" | "inventory_staff" | "fulfilment_staff";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthToken = {
  token: string;
  user: User;
};

// ─── Product & Category ───────────────────────────────────────────────────────

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export function getStockStatus(stock: number): StockStatus {
  if (stock > 20) return "in_stock";
  if (stock >= 5) return "low_stock";
  return "out_of_stock";
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type StatusEvent = {
  status: OrderStatus;
  timestamp: string;
  note?: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  timeline: StatusEvent[];
};

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered", "cancelled"],
  delivered:  [],
  cancelled:  [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  returnRate: number;
};

export type DailyRevenue = {
  date: string;
  revenue: number;
  orders: number;
};

export type OrdersByStatus = {
  status: OrderStatus;
  count: number;
};

export type TopProduct = {
  productId: string;
  name: string;
  sku: string;
  revenue: number;
  unitsSold: number;
};

export type RegionalSales = {
  region: string;
  revenue: number;
  orders: number;
};

// ─── API Pagination ───────────────────────────────────────────────────────────

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

// ─── API Error ────────────────────────────────────────────────────────────────

export type ApiError = {
  error: string;
  code: string;
};
