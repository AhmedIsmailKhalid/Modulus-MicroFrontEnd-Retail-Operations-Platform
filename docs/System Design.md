# Modulus — Retail Operations Platform
## System Design Document
`Version 1.0`

---

## Table of Contents
1. [Overview](#1-overview)
2. [System Context](#2-system-context)
3. [Architecture](#3-architecture)
4. [Application Specifications](#4-application-specifications)
5. [Shared Packages](#5-shared-packages)
6. [Authentication](#6-authentication)
7. [Data Layer](#7-data-layer)
8. [Deployment Topology](#8-deployment-topology)
9. [Technology Stack](#9-technology-stack)
10. [Design Principles](#10-design-principles)

---

## 1. Overview

Modulus is a micro-frontend retail operations platform designed to simulate the internal tooling used by operations teams at large retailers. It is not a customer-facing application. It is the back-office — the place where staff manage products, process orders, and monitor business performance.

The platform is decomposed into four independently deployable frontend applications, each owned by a separate team and each handling a distinct business domain. This decomposition reflects the organisational and technical constraints that justify micro-frontend architecture in production environments at scale.

The engineering goal is to demonstrate that the four applications can be composed into a single coherent user experience, share authentication state and design primitives, and yet deploy completely independently. A change in the Orders application should never require a redeployment of the Inventory or Analytics applications.

---

## 2. System Context

### 2.1 The Fictional Organisation

Modulus Retail is a mid-to-large fictional retailer with three distinct operations teams. Each team owns a separate business domain and has independent release cadences.

| Team | Domain | Application | Deployment URL |
|------|--------|-------------|----------------|
| Shell Team | Platform infrastructure | modulus-shell | modulus-shell.vercel.app |
| Inventory Team | Product catalogue and stock | modulus-inventory | modulus-inventory.vercel.app |
| Orders Team | Order processing and fulfilment | modulus-orders | modulus-orders.vercel.app |
| Analytics Team | Business intelligence | modulus-analytics | modulus-analytics.vercel.app |

### 2.2 What the Product Is Not

- A customer-facing storefront or e-commerce site
- A system with real backend infrastructure or a live database
- A mobile application or PWA
- A multi-tenant SaaS product

Authentication is handled via a mock JWT system with hardcoded credentials. Data is served from a lightweight mock API layer using Mock Service Worker (MSW). These decisions are deliberate: the portfolio objective is to demonstrate frontend architecture, not backend engineering.

---

## 3. Architecture

### 3.1 Micro-Frontend Topology

The architecture follows the Host-Remote pattern of Webpack Module Federation. The shell application acts as the host. The three feature applications act as remotes. No remote loads another remote. No remote knows about other remotes. All composition happens in the shell.

```
Browser
  |
  +-- modulus-shell (Host)
        |-- Loads: AuthContext, Layout, Router
        |-- Route /inventory --> loads modulus-inventory Remote
        |-- Route /orders    --> loads modulus-orders Remote
        +-- Route /analytics --> loads modulus-analytics Remote
```

Each remote is loaded asynchronously at runtime from its own deployed Vercel URL. The shell does not bundle remote code at build time. If a remote is updated and redeployed, the shell picks up the new version on the next navigation to that route without requiring its own redeployment.

### 3.2 Module Federation Configuration

#### Shell (Host) Configuration

```js
// webpack.config.js (shell)
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    inventory: "inventory@[INVENTORY_URL]/remoteEntry.js",
    orders:    "orders@[ORDERS_URL]/remoteEntry.js",
    analytics: "analytics@[ANALYTICS_URL]/remoteEntry.js",
  },
  shared: {
    react:       { singleton: true, requiredVersion: "^18.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
  },
})
```

#### Remote Configuration (per MFE)

```js
// webpack.config.js (inventory, orders, analytics)
new ModuleFederationPlugin({
  name: "inventory",          // unique per remote
  filename: "remoteEntry.js", // standard entry point
  exposes: {
    "./App": "./src/App",     // root component exposed
  },
  shared: {
    react:       { singleton: true, requiredVersion: "^18.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
  },
})
```

### 3.3 Shared Singleton React Instance

React must run as a single instance across all four applications. Duplicate React instances cause hook violations and context isolation failures. The `singleton: true` flag in the shared configuration enforces this: whichever application loads first provides the React instance, and all subsequent applications reuse it.

If React version constraints conflict between applications, Module Federation throws a runtime error. All four applications must declare the same React version range in their shared configuration.

### 3.4 Monorepo Structure

```
modulus/
  apps/
    shell/           # Host application
    inventory/       # Inventory MFE
    orders/          # Orders MFE
    analytics/       # Analytics MFE
  packages/
    ui/              # Shared component library
    auth/            # Shared auth context and hooks
    types/           # Shared TypeScript types
    config/          # Shared tsconfig, eslint, tailwind
  .github/
    workflows/       # CI/CD pipeline definitions
  playwright/        # E2E test suite
  turbo.json         # Turborepo pipeline config
  package.json       # Root workspace config
```

---

## 4. Application Specifications

### 4.1 Shell — modulus-shell

The shell is the host application. It is the only application the user navigates to directly. It owns:

- **Authentication:** login page, JWT token storage, route protection
- **Persistent layout:** top navigation bar with user profile, sidebar with section links
- **Routing:** maps URL paths to remote MFE components
- **Shared context:** provides AuthContext to all remotes via React context propagation
- **Error boundaries:** catches remote load failures and renders fallback UI
- **Loading states:** skeleton placeholder while remote module loads

### 4.2 Inventory MFE — modulus-inventory

- Paginated product table with search by name or SKU
- Filter by category (Electronics, Apparel, Home, Sports, Other)
- Stock level indicator: green (> 20 units), amber (5–20 units), red (< 5 units)
- Add new product form: name, SKU, category, price, stock quantity, image URL
- Edit product via slide-over panel
- Deactivate and reactivate product listings
- Category management: add and rename categories

### 4.3 Orders MFE — modulus-orders

- Order table filterable by status: pending, processing, shipped, delivered, cancelled
- Search by order ID or customer email
- Order detail view with customer information, line items, and totals
- Status update workflow with a confirmation step before committing
- Order timeline showing the full status history with timestamps
- Customer lookup returning all orders for a given email

Status transitions follow a defined state machine. Valid transitions: pending to processing, processing to shipped, shipped to delivered, and any status to cancelled.

### 4.4 Analytics MFE — modulus-analytics

- Daily revenue chart for the last 30 days (Recharts LineChart)
- Order volume by status (Recharts PieChart with labels)
- Top 10 selling products by revenue (Recharts BarChart, horizontal)
- Regional sales breakdown (Recharts BarChart, horizontal)
- Metric cards: total revenue, total orders, average order value, return rate
- Date range selector affecting all charts simultaneously

---

## 5. Shared Packages

### 5.1 packages/ui

| Component | Description |
|-----------|-------------|
| Button | Primary, secondary, destructive, and ghost variants with loading state |
| Table | Sortable, paginated data table with configurable column definitions |
| Badge | Status indicator with colour variants mapped to domain statuses |
| Modal | Accessible dialog with focus trap and keyboard dismissal |
| SlideOver | Side panel for edit forms, slides in from the right |
| Skeleton | Loading placeholder matching the shape of common content blocks |
| Card | Content container with header, body, and optional footer |
| Input, Select, Textarea | Controlled form inputs with error state support |
| Toast | Non-blocking notification with success, error, and info variants |
| EmptyState | Illustrated empty state with configurable message and action |

### 5.2 packages/auth

Exports an `AuthContext` provider and a `useAuth` hook. The shell wraps the entire application with the `AuthContext` provider. Each remote consumes `useAuth` to access the current user and token.

```ts
// Usage inside any remote
import { useAuth } from "@modulus/auth";

const { user, token, logout } = useAuth();
```

### 5.3 packages/types

```ts
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl?: string;
};

type Order = {
  id: string;
  customerId: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  timeline: StatusEvent[];
};

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
```

### 5.4 packages/config

- `tsconfig.base.json`: strict mode, path aliases, ESNext target
- `.eslintrc.base.js`: React, TypeScript, and import rules
- `tailwind.config.base.js`: shared design tokens (colours, spacing, typography)

---

## 6. Authentication

Authentication uses a mock JWT system. There is no external identity provider. On login, the mock API validates credentials against a hardcoded user set and returns a signed JWT. The shell stores the token in memory (not localStorage) and passes it via the `AuthContext`.

| Credential | Role | Access |
|-----------|------|--------|
| ops@modulus.com / password123 | Operations Manager | All sections |
| inventory@modulus.com / password123 | Inventory Staff | Inventory only |
| orders@modulus.com / password123 | Fulfilment Staff | Orders only |

---

## 7. Data Layer

All data is served by a Mock Service Worker (MSW) instance running in the browser. MSW intercepts fetch requests and returns seeded JSON responses. There is no backend server, no database, and no network egress required.

The seeded data set includes:
- 120 products across 5 categories
- 500 orders in varied statuses, spanning the last 90 days
- 60 customers with associated order histories
- Pre-aggregated analytics data for the last 30 days

---

## 8. Deployment Topology

| Application | Vercel Project | Production URL | Deployed By |
|-------------|---------------|----------------|-------------|
| modulus-shell | modulus-shell | modulus-shell.vercel.app | shell.yml |
| modulus-inventory | modulus-inventory | modulus-inventory.vercel.app | inventory.yml |
| modulus-orders | modulus-orders | modulus-orders.vercel.app | orders.yml |
| modulus-analytics | modulus-analytics | modulus-analytics.vercel.app | analytics.yml |

Remote URLs are configured via environment variables in the shell Vercel project: `VITE_INVENTORY_URL`, `VITE_ORDERS_URL`, `VITE_ANALYTICS_URL`.

---

## 9. Technology Stack

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Monorepo management | Turborepo | Incremental builds, task caching, parallel execution |
| Module Federation | Webpack 5 | Mature, production-proven MFE implementation |
| Frontend framework | React 18 | Concurrent features, stable ecosystem |
| Language | TypeScript (strict) | Shared types catch interface mismatches at compile time |
| Styling | Tailwind CSS | Shared design token system, no CSS-in-JS runtime overhead |
| Charts | Recharts | React-native, composable |
| Client state | Zustand | Lightweight, isolated per MFE |
| Data layer | MSW | Browser-native request interception, no backend required |
| Unit testing | Vitest | Vite-native, fast |
| E2E testing | Playwright | Cross-browser, reliable |
| CI/CD | GitHub Actions | Native to repository, matrix builds, Slack integration |
| Deployment | Vercel | Zero-config static deploy, environment variable management |

---

## 10. Design Principles

### 10.1 Team Autonomy
Each team owns their application end to end: source code, build configuration, deployment pipeline, and test coverage. No team requires another team's approval to ship.

### 10.2 Fault Isolation
A failure in one remote must not bring down the shell or other remotes. Each remote load is wrapped in a React error boundary. If a remote fails to load, the shell renders a fallback UI for that section only.

### 10.3 Independent Deployability
Every application can be built, tested, and deployed without depending on the other applications. The only coupling is shared package versions and runtime URL references in the shell environment variables.

### 10.4 Shared Primitives, Not Shared Logic
Shared packages contain design tokens, UI components, type definitions, and auth utilities. They do not contain business logic. Inventory logic lives only in modulus-inventory. Orders logic lives only in modulus-orders.
