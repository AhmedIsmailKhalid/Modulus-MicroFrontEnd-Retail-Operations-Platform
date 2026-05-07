import { http, HttpResponse } from "msw";

import {
  generateCustomers,
  generateDailyRevenue,
  generateOrders,
  generateProducts,
  SEED_CATEGORIES,
  SEED_CREDENTIALS,
  SEED_REGIONS,
  SEED_USERS,
} from "./seed";
import type { Category, Customer, Order, Product, StatusEvent } from "./types";
import { isValidTransition } from "./types";

// ─── In-memory state (resets on page refresh) ─────────────────────────────────

let products: Product[]  = generateProducts();
let categories: Category[] = [...SEED_CATEGORIES];
let customers: Customer[] = generateCustomers();
let orders: Order[]       = generateOrders(customers, products);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paginate<T>(items: T[], page: number, limit: number) {
  const total      = items.length;
  const totalPages = Math.ceil(total / limit);
  const start      = (page - 1) * limit;
  const data       = items.slice(start, start + limit);
  return { data, pagination: { page, limit, total, totalPages } };
}

function simulateError(request: Request): boolean {
  return request.headers.get("X-Simulate-Error") === "true";
}

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200));
}

function mockToken(userId: string): string {
  return `mock-jwt-${userId}-${Date.now()}`;
}

// ─── Auth Handlers ────────────────────────────────────────────────────────────

const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const body = await request.json() as { email?: string; password?: string };
    const email    = body.email ?? "";
    const password = body.password ?? "";

    const cred = SEED_CREDENTIALS[email];
    if (!cred || cred.password !== password) {
      return HttpResponse.json({ error: "Invalid credentials", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = SEED_USERS.find((u) => u.id === cred.userId);
    if (!user) return HttpResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });

    return HttpResponse.json({ token: mockToken(user.id), user });
  }),
];

// ─── Product Handlers ─────────────────────────────────────────────────────────

const productHandlers = [
  http.get("/api/products", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url         = new URL(request.url);
    const page        = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit       = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
    const search      = url.searchParams.get("search")?.toLowerCase() ?? "";
    const category    = url.searchParams.get("category") ?? "";
    const stockStatus = url.searchParams.get("stockStatus") ?? "";
    const activeParam = url.searchParams.get("active");

    let filtered = [...products];

    if (activeParam !== null) {
      const active = activeParam === "true";
      filtered = filtered.filter((p) => p.active === active);
    } else {
      filtered = filtered.filter((p) => p.active);
    }

    if (search) {
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search),
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (stockStatus === "in_stock")  filtered = filtered.filter((p) => p.stock > 20);
    if (stockStatus === "low_stock") filtered = filtered.filter((p) => p.stock >= 5 && p.stock <= 20);
    if (stockStatus === "out_of_stock") filtered = filtered.filter((p) => p.stock < 5);

    return HttpResponse.json(paginate(filtered, page, limit));
  }),

  http.post("/api/products", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const body = await request.json() as {
      name?: string; sku?: string; category?: string;
      price?: number; stock?: number; imageUrl?: string;
    };

    if (!body.name || !body.sku || !body.category || body.price === undefined || body.stock === undefined) {
      return HttpResponse.json({ error: "Missing required fields", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const exists = products.find((p) => p.sku.toLowerCase() === (body.sku ?? "").toLowerCase());
    if (exists) {
      return HttpResponse.json({ error: "SKU already exists", code: "CONFLICT" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `p${String(products.length + 1).padStart(3, "0")}`,
      name: body.name,
      sku: body.sku,
      category: body.category,
      price: body.price,
      stock: body.stock,
      active: true,
      ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.get("/api/products/:id", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const product = products.find((p) => p.id === params["id"]);
    if (!product) return HttpResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.patch("/api/products/:id", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const idx = products.findIndex((p) => p.id === params["id"]);
    if (idx === -1) return HttpResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const body = await request.json() as Partial<Product>;
    const existing = products[idx];
    if (!existing) return HttpResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const updated: Product = { ...existing, ...body, id: existing.id, sku: existing.sku, updatedAt: new Date().toISOString() };
    products[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.patch("/api/products/:id/status", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const idx = products.findIndex((p) => p.id === params["id"]);
    if (idx === -1) return HttpResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const body = await request.json() as { active?: boolean };
    const existing = products[idx];
    if (!existing) return HttpResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const updated: Product = { ...existing, active: body.active ?? existing.active, updatedAt: new Date().toISOString() };
    products[idx] = updated;
    return HttpResponse.json(updated);
  }),
];

// ─── Category Handlers ────────────────────────────────────────────────────────

const categoryHandlers = [
  http.get("/api/categories", async ({ request }) => {
    await delay(200);
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });
    return HttpResponse.json({ data: categories });
  }),

  http.post("/api/categories", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const body = await request.json() as { name?: string };
    if (!body.name?.trim()) {
      return HttpResponse.json({ error: "Name is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const exists = categories.find((c) => c.name.toLowerCase() === body.name!.toLowerCase());
    if (exists) return HttpResponse.json({ error: "Category already exists", code: "CONFLICT" }, { status: 409 });

    const newCat: Category = { id: `cat${String(categories.length + 1)}`, name: body.name };
    categories.push(newCat);
    return HttpResponse.json(newCat, { status: 201 });
  }),

  http.patch("/api/categories/:id", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const idx = categories.findIndex((c) => c.id === params["id"]);
    if (idx === -1) return HttpResponse.json({ error: "Category not found", code: "NOT_FOUND" }, { status: 404 });

    const body = await request.json() as { name?: string };
    if (!body.name?.trim()) {
      return HttpResponse.json({ error: "Name is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const existing = categories[idx];
    if (!existing) return HttpResponse.json({ error: "Category not found", code: "NOT_FOUND" }, { status: 404 });

    const oldName = existing.name;
    categories[idx] = { ...existing, name: body.name };

    products = products.map((p) =>
      p.category === oldName ? { ...p, category: body.name! } : p,
    );

    return HttpResponse.json(categories[idx]);
  }),
];

// ─── Order Handlers ───────────────────────────────────────────────────────────

const orderHandlers = [
  http.get("/api/orders", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url        = new URL(request.url);
    const page       = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit      = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
    const status     = url.searchParams.get("status") ?? "";
    const search     = url.searchParams.get("search")?.toLowerCase() ?? "";
    const customerId = url.searchParams.get("customerId") ?? "";

    let filtered = [...orders];
    if (status)     filtered = filtered.filter((o) => o.status === status);
    if (customerId) filtered = filtered.filter((o) => o.customerId === customerId);
    if (search) {
      filtered = filtered.filter(
        (o) => o.id.toLowerCase().includes(search) || o.customerEmail.toLowerCase().includes(search),
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return HttpResponse.json(paginate(filtered, page, limit));
  }),

  http.get("/api/orders/:id", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const order = orders.find((o) => o.id === params["id"]);
    if (!order) return HttpResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });
    return HttpResponse.json(order);
  }),

  http.patch("/api/orders/:id/status", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const idx = orders.findIndex((o) => o.id === params["id"]);
    if (idx === -1) return HttpResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });

    const existing = orders[idx];
    if (!existing) return HttpResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });

    const body = await request.json() as { status?: string; note?: string };
    const newStatus = body.status as Order["status"] | undefined;

    if (!newStatus) {
      return HttpResponse.json({ error: "Status is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    if (!isValidTransition(existing.status, newStatus)) {
      return HttpResponse.json(
        { error: "Invalid transition", code: "INVALID_TRANSITION", from: existing.status, to: newStatus },
        { status: 422 },
      );
    }

    const now = new Date().toISOString();
    const newEvent: StatusEvent = {
      status: newStatus,
      timestamp: now,
      ...(body.note ? { note: body.note } : {}),
    };

    const updated: Order = {
      ...existing,
      status: newStatus,
      updatedAt: now,
      timeline: [...existing.timeline, newEvent],
    };

    orders[idx] = updated;
    return HttpResponse.json(updated);
  }),
];

// ─── Customer Handlers ────────────────────────────────────────────────────────

const customerHandlers = [
  http.get("/api/customers", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url    = new URL(request.url);
    const email  = url.searchParams.get("email")?.toLowerCase() ?? "";
    const filtered = email
      ? customers.filter((c) => c.email.toLowerCase().includes(email))
      : customers;

    return HttpResponse.json({ data: filtered });
  }),

  http.get("/api/customers/:id", async ({ params, request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const customer = customers.find((c) => c.id === params["id"]);
    if (!customer) return HttpResponse.json({ error: "Customer not found", code: "NOT_FOUND" }, { status: 404 });
    return HttpResponse.json(customer);
  }),
];

// ─── Analytics Handlers ───────────────────────────────────────────────────────

const analyticsHandlers = [
  http.get("/api/analytics/summary", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url       = new URL(request.url);
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate   = url.searchParams.get("endDate") ?? "";

    const filtered = orders.filter((o) => {
      const date = o.createdAt.split("T")[0] ?? "";
      return date >= startDate && date <= endDate;
    });

    const totalRevenue      = filtered.reduce((s, o) => s + o.total, 0);
    const totalOrders       = filtered.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const cancelled         = filtered.filter((o) => o.status === "cancelled").length;
    const returnRate        = totalOrders > 0 ? parseFloat((cancelled / totalOrders).toFixed(3)) : 0;

    return HttpResponse.json({ totalRevenue, totalOrders, averageOrderValue, returnRate });
  }),

  http.get("/api/analytics/revenue", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });
    return HttpResponse.json({ data: generateDailyRevenue(orders) });
  }),

  http.get("/api/analytics/orders-by-status", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url       = new URL(request.url);
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate   = url.searchParams.get("endDate") ?? "";

    const filtered = orders.filter((o) => {
      const date = o.createdAt.split("T")[0] ?? "";
      return date >= startDate && date <= endDate;
    });

    const statusMap = new Map<string, number>();
    for (const o of filtered) {
      statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
    }

    const data = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    return HttpResponse.json({ data });
  }),

  http.get("/api/analytics/top-products", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url       = new URL(request.url);
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate   = url.searchParams.get("endDate") ?? "";

    const filtered = orders.filter((o) => {
      const date = o.createdAt.split("T")[0] ?? "";
      return date >= startDate && date <= endDate;
    });

    const productMap = new Map<string, { name: string; sku: string; revenue: number; unitsSold: number }>();

    for (const order of filtered) {
      for (const item of order.items) {
        const existing = productMap.get(item.productId) ?? { name: item.productName, sku: item.sku, revenue: 0, unitsSold: 0 };
        existing.revenue   += item.total;
        existing.unitsSold += item.quantity;
        productMap.set(item.productId, existing);
      }
    }

    const data = Array.from(productMap.entries())
      .map(([productId, val]) => ({ productId, ...val }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return HttpResponse.json({ data });
  }),

  http.get("/api/analytics/regional", async ({ request }) => {
    await delay();
    if (simulateError(request)) return HttpResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });

    const url       = new URL(request.url);
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate   = url.searchParams.get("endDate") ?? "";

    const filtered = orders.filter((o) => {
      const date = o.createdAt.split("T")[0] ?? "";
      return date >= startDate && date <= endDate;
    });

    const regionMap = new Map<string, { revenue: number; orders: number }>();
    for (const region of SEED_REGIONS) {
      regionMap.set(region, { revenue: 0, orders: 0 });
    }

    filtered.forEach((order, i) => {
      const region = SEED_REGIONS[i % SEED_REGIONS.length];
      if (region !== undefined) {
        const entry = regionMap.get(region);
        if (entry !== undefined) {
          entry.revenue += order.total;
          entry.orders  += 1;
        }
      }
    });

    const data = Array.from(regionMap.entries())
      .map(([region, val]) => ({ region, ...val }))
      .sort((a, b) => b.revenue - a.revenue);

    return HttpResponse.json({ data });
  }),
];

// ─── All Handlers ─────────────────────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...categoryHandlers,
  ...orderHandlers,
  ...customerHandlers,
  ...analyticsHandlers,
];

// ─── Reset function for testing ───────────────────────────────────────────────

export function resetHandlerState(): void {
  products   = generateProducts();
  categories = [...SEED_CATEGORIES];
  customers  = generateCustomers();
  orders     = generateOrders(customers, products);
}
