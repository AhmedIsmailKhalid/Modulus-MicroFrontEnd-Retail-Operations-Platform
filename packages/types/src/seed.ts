import type {
  Category,
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  StatusEvent,
  User,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) throw new Error("randomItem called on empty array");
  return item;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dateString(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0] ?? "";
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  { id: "u1", email: "ops@modulus.com",       name: "Operations Manager", role: "ops_manager" },
  { id: "u2", email: "inventory@modulus.com", name: "Inventory Staff",    role: "inventory_staff" },
  { id: "u3", email: "orders@modulus.com",    name: "Fulfilment Staff",   role: "fulfilment_staff" },
];

export const SEED_CREDENTIALS: Record<string, { userId: string; password: string }> = {
  "ops@modulus.com":       { userId: "u1", password: "password123" },
  "inventory@modulus.com": { userId: "u2", password: "password123" },
  "orders@modulus.com":    { userId: "u3", password: "password123" },
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const SEED_CATEGORIES: Category[] = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Apparel" },
  { id: "cat3", name: "Home & Garden" },
  { id: "cat4", name: "Sports & Outdoors" },
  { id: "cat5", name: "Toys & Games" },
];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCT_TEMPLATES = [
  { name: "Wireless Noise-Cancelling Headphones", sku: "ELEC-001", category: "Electronics",      price: 29999, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
  { name: "Mechanical Keyboard TKL",              sku: "ELEC-002", category: "Electronics",      price: 14999, imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
  { name: "4K Webcam Pro",                        sku: "ELEC-003", category: "Electronics",      price: 8999,  imageUrl: "https://images.unsplash.com/photo-1623949556303-b0d17e0ece3b?w=400" },
  { name: "USB-C Hub 7-in-1",                     sku: "ELEC-004", category: "Electronics",      price: 4999,  imageUrl: "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400" },
  { name: "Wireless Charging Pad",                sku: "ELEC-005", category: "Electronics",      price: 2999,  imageUrl: "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=400" },
  { name: "Men's Running Jacket",                 sku: "APPR-001", category: "Apparel",           price: 8999,  imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
  { name: "Women's Yoga Leggings",                sku: "APPR-002", category: "Apparel",           price: 5999,  imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400" },
  { name: "Unisex Hoodie Classic",                sku: "APPR-003", category: "Apparel",           price: 6499,  imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400" },
  { name: "Trail Running Shoes",                  sku: "APPR-004", category: "Apparel",           price: 13999, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
  { name: "Bamboo Cutting Board Set",             sku: "HOME-001", category: "Home & Garden",     price: 3499,  imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" },
  { name: "Cast Iron Dutch Oven 5qt",             sku: "HOME-002", category: "Home & Garden",     price: 9999,  imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" },
  { name: "Ceramic Plant Pots Set of 3",          sku: "HOME-003", category: "Home & Garden",     price: 2799,  imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400" },
  { name: "Memory Foam Pillow",                   sku: "HOME-004", category: "Home & Garden",     price: 4999,  imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
  { name: "Adjustable Dumbbell Set 20kg",         sku: "SPRT-001", category: "Sports & Outdoors", price: 24999, imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400" },
  { name: "Foam Roller Recovery",                 sku: "SPRT-002", category: "Sports & Outdoors", price: 2999,  imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400" },
  { name: "Camping Tent 2-Person",                sku: "SPRT-003", category: "Sports & Outdoors", price: 18999, imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
  { name: "Hydration Backpack 15L",               sku: "SPRT-004", category: "Sports & Outdoors", price: 7999,  imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
  { name: "LEGO Architecture Set",                sku: "TOYS-001", category: "Toys & Games",      price: 5999,  imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400" },
  { name: "Board Game Strategy Pack",             sku: "TOYS-002", category: "Toys & Games",      price: 3499,  imageUrl: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=400" },
  { name: "Remote Control Car Pro",               sku: "TOYS-003", category: "Toys & Games",      price: 7999,  imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400" },
] as const;

export function generateProducts(): Product[] {
  const products: Product[] = [];
  let counter = 0;

  for (let i = 0; i < 6; i++) {
    for (const template of PRODUCT_TEMPLATES) {
      counter++;
      const stock =
        counter % 7 === 0 ? 0
        : counter % 5 === 0 ? randomInt(1, 4)
        : counter % 3 === 0 ? randomInt(5, 20)
        : randomInt(21, 200);

      products.push({
        id: `p${String(counter).padStart(3, "0")}`,
        name: i === 0 ? template.name : `${template.name} v${String(i + 1)}`,
        sku:  i === 0 ? template.sku  : `${template.sku}-${String(i + 1)}`,
        category: template.category,
        price: template.price,
        stock,
        active: counter % 11 !== 0,
        imageUrl: template.imageUrl,
        createdAt: daysAgo(randomInt(30, 365)),
        updatedAt: daysAgo(randomInt(0, 30)),
      });
    }
  }

  return products;
}

// ─── Customers ────────────────────────────────────────────────────────────────

const CUSTOMER_NAMES = [
  "Alice Chen", "Bob Martinez", "Carol Williams", "David Kim", "Emma Johnson",
  "Frank Lee", "Grace Liu", "Henry Brown", "Isabella Davis", "James Wilson",
  "Karen Taylor", "Liam Anderson", "Mia Thomas", "Noah Jackson", "Olivia White",
  "Peter Harris", "Quinn Martin", "Rachel Thompson", "Sam Garcia", "Tina Moore",
  "Uma Patel", "Victor Rodriguez", "Wendy Lewis", "Xavier Hall", "Yuki Young",
  "Zoe Adams", "Aaron Baker", "Beth Carter", "Chris Evans", "Diana Foster",
  "Evan Green", "Fiona Hall", "George Ingram", "Hannah Jones", "Ivan King",
  "Julia Lane", "Kevin Morgan", "Laura Nelson", "Mike Oliver", "Nancy Parker",
  "Oscar Quinn", "Patricia Reed", "Quincy Scott", "Rebecca Turner", "Steve Underwood",
  "Teresa Vance", "Ulrich Walsh", "Vera Xavier", "William Young", "Xena Zimmerman",
  "Yusuf Ali", "Zara Bishop", "Aaron Cole", "Betty Dixon", "Charlie Edwards",
  "Dorothy Flynn", "Elliot Grant", "Flora Hayes", "Grant Irving", "Holly James",
] as const;

export function generateCustomers(): Customer[] {
  return CUSTOMER_NAMES.map((name, i) => {
    const parts = name.split(" ");
    const first = parts[0] ?? "user";
    const last  = parts[1] ?? "user";
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
    return {
      id: `c${String(i + 1).padStart(3, "0")}`,
      name,
      email,
      phone: `+1 555 ${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
      totalOrders: 0,
      totalSpent:  0,
      createdAt: daysAgo(randomInt(30, 730)),
    };
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

const ADDRESSES = [
  "123 Main St, New York, NY 10001",
  "456 Oak Ave, Los Angeles, CA 90001",
  "789 Pine Rd, Chicago, IL 60601",
  "321 Elm St, Houston, TX 77001",
  "654 Maple Dr, Phoenix, AZ 85001",
  "987 Cedar Ln, Philadelphia, PA 19101",
] as const;

const STATUS_DISTRIBUTION: readonly OrderStatus[] = [
  "pending", "pending",
  "processing", "processing",
  "shipped", "shipped", "shipped",
  "delivered", "delivered", "delivered", "delivered", "delivered",
  "cancelled",
];

export function generateOrders(customers: Customer[], products: Product[]): Order[] {
  const orders: Order[] = [];
  const activeProducts = products.filter((p) => p.active);

  for (let i = 0; i < 500; i++) {
    const customer    = randomItem(customers);
    const daysBack    = randomInt(0, 90);
    const createdAt   = daysAgo(daysBack);
    const status      = randomItem(STATUS_DISTRIBUTION);

    const itemCount   = randomInt(1, 4);
    const items: OrderItem[] = [];
    const usedProducts = new Set<string>();

    for (let j = 0; j < itemCount; j++) {
      let product: Product;
      let attempts = 0;
      do {
        product = randomItem(activeProducts);
        attempts++;
      } while (usedProducts.has(product.id) && attempts < 10);

      usedProducts.add(product.id);
      const quantity  = randomInt(1, 3);
      const unitPrice = product.price;
      items.push({
        productId:   product.id,
        productName: product.name,
        sku:         product.sku,
        quantity,
        unitPrice,
        total: unitPrice * quantity,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax      = Math.round(subtotal * 0.08);
    const total    = subtotal + tax;

    const timeline: StatusEvent[] = [{ status: "pending", timestamp: createdAt }];

    if (status !== "pending") {
      timeline.push({ status: "processing", timestamp: daysAgo(daysBack - 1) });
    }
    if (status === "shipped" || status === "delivered") {
      timeline.push({ status: "shipped", timestamp: daysAgo(daysBack - 3) });
    }
    if (status === "delivered") {
      timeline.push({ status: "delivered", timestamp: daysAgo(daysBack - 7) });
    }
    if (status === "cancelled") {
      timeline.push({ status: "cancelled", timestamp: daysAgo(daysBack - 1) });
    }

    orders.push({
      id: `o-seed-${String(i + 1).padStart(3, "0")}`,
      customerId:      customer.id,
      customerName:    customer.name,
      customerEmail:   customer.email,
      status,
      items,
      subtotal,
      tax,
      total,
      shippingAddress: randomItem(ADDRESSES),
      createdAt,
      updatedAt: timeline[timeline.length - 1]?.timestamp ?? createdAt,
      timeline,
    });
  }

  for (const order of orders) {
    const customer = customers.find((c) => c.id === order.customerId);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent  += order.total;
    }
  }

  return orders;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const SEED_REGIONS = [
  "Northeast", "Southeast", "Midwest", "Southwest", "West", "Northwest",
] as const;

export function generateDailyRevenue(
  orders: Order[],
): Array<{ date: string; revenue: number; orders: number }> {
  const map = new Map<string, { revenue: number; orders: number }>();

  for (let i = 29; i >= 0; i--) {
    map.set(dateString(i), { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const date = order.createdAt.split("T")[0];
    if (date !== undefined && map.has(date)) {
      const entry = map.get(date);
      if (entry !== undefined) {
        entry.revenue += order.total;
        entry.orders  += 1;
      }
    }
  }

  return Array.from(map.entries()).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    orders:  val.orders,
  }));
}
