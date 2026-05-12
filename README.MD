# Modulus — Retail Operations Platform

**Modulus** is a micro-frontend retail operations platform built on Webpack 5 Module Federation, decomposed into four independently deployable React 18 applications sharing a singleton auth context and a Tailwind-based component library via a Turborepo monorepo. Each application has its own GitHub Actions CI/CD pipeline running lint, typecheck, Vitest unit tests, build, and Vercel deployment in sequence. The shell pipeline triggers a Playwright E2E suite post-deploy, publishing an HTML report to GitHub Pages at a run-scoped URL and firing a Slack alert on failure.

---

## Table of Contents

1. [Live Demo](#live-demo)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Module Federation Design](#module-federation-design)
5. [Authentication Architecture](#authentication-architecture)
6. [Data Layer](#data-layer)
7. [Tech Stack](#tech-stack)
8. [Repository Structure](#repository-structure)
9. [Local Development](#local-development)
10. [Environment Variables](#environment-variables)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Role-Based Access Control](#role-based-access-control)
13. [E2E Test Architecture](#e2e-test-architecture)
14. [Architectural Decisions & Tradeoffs](#architectural-decisions--tradeoffs)
15. [Known Constraints](#known-constraints)
16. [Documentation](#documentation)

---

## Live Demo

| Application | URL | Port (local) |
|-------------|-----|:---:|
| **Shell (Host)** | https://modulus-retail-operations-platform.vercel.app | 3000 |
| **Inventory MFE** | https://modulus-retail-operations-platform-eight.vercel.app | 3001 |
| **Orders MFE** | https://modulus-retail-operations-platform-delta.vercel.app | 3002 |
| **Analytics MFE** | https://modulus-retail-operations-platform-ten.vercel.app | 3003 |

### Test Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Operations Manager | ops@modulus.com | password123 | Inventory, Orders, Analytics |
| Inventory Staff | inventory@modulus.com | password123 | Inventory only |
| Fulfilment Staff | fulfilment@modulus.com | password123 | Orders only |

---

## System Overview

Modulus simulates a retail back-office platform where independent engineering teams own separate operational domains. The architectural goal is **deployment independence**: the Inventory team can ship a hotfix without coordinating with the Orders or Analytics teams, and without requiring a shell redeploy. Each MFE is a fully functional standalone application that also composes into the shell at runtime.

**Domain breakdown:**

- **Inventory** — product catalogue management: paginated product table (120 seeded SKUs), search by name/SKU, filter by category and stock status, add/edit via SlideOver with Zod validation, deactivate/reactivate with confirmation modal, category CRUD, optimistic UI updates with rollback on error, stock level badge system (green > 20, amber 5–20, red < 5)
- **Orders** — order fulfilment workflow: paginated order table (500 seeded orders), search by order ID or customer email, status filter, order detail view with line items and status timeline, validated status transition state machine (pending → processing → shipped → delivered, any → cancelled), invalid transitions disabled in UI and rejected by handler
- **Analytics** — read-only BI dashboard: total revenue, total orders, average order value, return rate metric cards; daily revenue area chart (30 days); order volume by status pie chart; top 10 products by revenue horizontal bar chart; regional sales horizontal bar chart — all via Recharts with a date range selector that re-fetches on change

---

## Architecture
![Architectural Diagram](ASSETS/Architecture%20Diagram.png)

---

## Module Federation Design

### Host Configuration (Shell)

The shell is configured as a Module Federation host via `@module-federation/enhanced`. Remote URLs are injected at build time from environment variables, defaulting to localhost for local development:

```ts
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    inventory: `inventory@${inventoryUrl}/remoteEntry.js`,
    orders:    `orders@${ordersUrl}/remoteEntry.js`,
    analytics: `analytics@${analyticsUrl}/remoteEntry.js`,
  },
  shared: {
    react:              { singleton: true, requiredVersion: "^18.3.1", eager: true },
    "react-dom":        { singleton: true, requiredVersion: "^18.3.1", eager: true },
    "react-router-dom": { singleton: true, requiredVersion: "^7.0.2",  eager: true },
  },
})
```

`eager: true` on shared singletons avoids async chunk loading for React itself — without this, the host and remote can race to initialise separate React instances, causing hook violation errors across the module boundary.

### Remote Configuration (per MFE)

Each remote exposes a single entry point `./App` via its own `remoteEntry.js`:

```ts
new ModuleFederationPlugin({
  name: "inventory",
  filename: "remoteEntry.js",
  exposes: { "./App": "./src/App" },
  shared: {
    react:       { singleton: true, requiredVersion: "^18.3.1", eager: true },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1", eager: true },
  },
})
```

`react-router-dom` is intentionally **not** shared in remotes — remotes do not define their own routes. All routing lives in the shell; remotes receive their context via the module boundary.

### Runtime Loading

Remotes are loaded via `React.lazy()` wrapped in `Suspense` and a per-remote `RemoteErrorBoundary`. The `remoteEntry.js` script is fetched the first time a user navigates to that section — not on shell initialisation. This means:

- Initial shell load is not blocked by remote availability
- A remote can be taken offline without affecting other sections
- Deploying a remote only requires the remote's own pipeline to run — no shell redeploy

### Content-Hash Caching Strategy

All output chunks use `[name].[contenthash].js`. The `remoteEntry.js` URL is stable (required for shell to reference it), but all chunks it loads are content-hashed. This gives browsers long-lived caching on vendor and application chunks while `remoteEntry.js` remains short-lived. In production, the correct strategy is a CDN with `Cache-Control: max-age=0, must-revalidate` on `remoteEntry.js` and `Cache-Control: max-age=31536000, immutable` on all content-hashed chunks.

---

## Authentication Architecture

Auth state lives exclusively in the shell's `AuthProvider` (from `@modulus/auth`). Token and user are held in React state — **not** in `localStorage` or `sessionStorage`. This is a deliberate security decision: tokens do not survive page refresh, requiring re-authentication, which eliminates XSS token theft vectors that `localStorage` is susceptible to.

```
Shell (AuthProvider)
  └── AuthContext (React Context)
        ├── user: User | null
        ├── token: string | null
        ├── isAuthenticated: boolean
        ├── login(token, user) → setState
        └── logout() → setState({ null, null, false })
```

Because React and `AuthContext` are declared as shared singletons across the module boundary, remote components call `useAuth()` directly and receive the exact same context instance that the shell initialised. There is no token passing via props, URL params, or `postMessage`.

**Guard layers:**

1. `RequireAuth` — shell-level, redirects unauthenticated requests to `/login` before any remote loads
2. `GuardedSection` — role-level per route, renders `AccessDeniedPage` without loading the remote bundle
3. MSW handler — validates the mock JWT on every mutating request, returns 401 on invalid token

---

## Data Layer

### Mock Service Worker

All API calls are intercepted by MSW 2, initialised once in the shell's service worker (`/mockServiceWorker.js`). Remotes make standard `fetch` calls to `/api/*` — they have zero knowledge of MSW. This architectural constraint is critical: if each remote initialised its own MSW instance, service worker scopes would conflict and requests would be intercepted by the wrong handler.

The in-memory state initialises on first page load and resets on refresh. All mutations are reflected immediately and persist for the session.

**Simulated network delay:** each handler introduces a 400–600ms artificial delay to make loading and skeleton states visible under normal conditions.

**Simulated errors:** any request with `X-Simulate-Error: true` returns a 500, enabling error boundary and retry flow testing without modifying application code.

### API Surface

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Credential validation, returns mock JWT + User |
| `/api/auth/logout` | POST | Session termination |
| `/api/products` | GET | Paginated (20/page), searchable by name/SKU, filterable by category and stock status |
| `/api/products` | POST | Create product — Zod-validated request body |
| `/api/products/:id` | PUT | Update product fields |
| `/api/products/:id/status` | PATCH | Toggle active/inactive |
| `/api/categories` | GET | Full category list |
| `/api/categories` | POST | Create category |
| `/api/categories/:id` | PUT | Rename category |
| `/api/orders` | GET | Paginated (20/page), searchable by ID/email, filterable by status |
| `/api/orders/:id` | GET | Single order with full timeline |
| `/api/orders/:id/status` | PATCH | Status transition — validated against `VALID_TRANSITIONS` |
| `/api/customers` | GET | Customer list |
| `/api/analytics/summary` | GET | Aggregated metric card values |
| `/api/analytics/revenue` | GET | Daily revenue time series (30 days) |
| `/api/analytics/orders-by-status` | GET | Order count per status |
| `/api/analytics/top-products` | GET | Top 10 products by revenue |
| `/api/analytics/regional` | GET | Revenue and order count by region |

### Seed Data

Generated deterministically on first page load:

- **120 products** across 8 categories with deliberate stock distribution (~14% out of stock, ~14% low stock, ~72% healthy stock) to exercise all three badge states
- **60 customers** with realistic name/email data
- **500 orders** distributed across all 5 statuses, referencing seeded customers and products
- **30 days** of daily revenue data for the analytics time series

### Zod Validation

All mutation inputs are validated using Zod schemas from `@modulus/types`. `z.infer<typeof Schema>` eliminates type duplication — the TypeScript type and the runtime validator share a single source of truth:

- `LoginSchema` — email format, password presence
- `CreateProductSchema` — name (2–120 chars), SKU (alphanumeric + hyphens/underscores, regex-validated), price (positive, max $100k in cents), stock (non-negative integer), optional imageUrl
- `UpdateProductSchema` — partial of CreateProductSchema; SKU field omitted (immutable after creation)
- Status transitions — validated against the `VALID_TRANSITIONS` record before the MSW handler commits the update

---

## Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Monorepo | Turborepo | latest | Incremental builds with task graph caching; workspace-aware dependency resolution |
| MFE Runtime | `@module-federation/enhanced` | ^2.4.0 | First-class TypeScript support; improved runtime error reporting over the raw webpack MF plugin |
| Framework | React | ^18.3.1 | Concurrent features; `React.lazy` + `Suspense` for deferred remote loading |
| Language | TypeScript | ^5.7.2 | Strict mode across all workspaces; `no-explicit-any` enforced via ESLint |
| Styling | Tailwind CSS | ^3.4.16 | Utility-first with zero runtime overhead; shared base config via `@modulus/config` ensures design token consistency across MFEs |
| Routing | React Router DOM | ^7.0.2 | Shared singleton across module boundary; remotes consume the router context without defining routes |
| State | Zustand | ^5.0.2 | Minimal boilerplate; no Provider required; per-MFE stores are fully isolated |
| Charts | Recharts | ^2.x | Declarative SVG; composable chart primitives; strong TypeScript types |
| API Mocking | MSW | ^2.x | Service worker intercepts at network level — zero application code changes needed to replace with a real API |
| Validation | Zod | ^3.24.1 | `z.infer<>` eliminates type/validator duplication; schemas are the single source of truth |
| Unit Testing | Vitest | ^2.1.8 | Vite-native runner; Jest-compatible API; fast in monorepo context |
| E2E Testing | Playwright | ^1.44.0 | Reliable async handling; page object model; `data-testid` selector discipline |
| Build | Webpack | ^5.97.1 | Required for Module Federation; content-hash output for optimal CDN caching |
| CI/CD | GitHub Actions | — | Path-filtered triggers per app directory; independent pipelines enforce deployment isolation |
| Hosting | Vercel | Hobby | 4 independent projects; each remote has its own deployment history and rollback capability |

---

## Repository Structure

```
modulus/
├── apps/
│   ├── shell/                      # Host — auth, routing, layout (port 3000)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── RemoteErrorBoundary.tsx  # Per-remote error isolation
│   │   │   │   ├── RemoteLoader.tsx         # React.lazy wrappers for all 3 remotes
│   │   │   │   ├── ShellLayout.tsx          # Persistent sidebar + topnav layout
│   │   │   │   ├── Sidebar.tsx              # Role-filtered navigation links
│   │   │   │   └── TopNav.tsx               # User display + logout
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── AccessDeniedPage.tsx
│   │   │   ├── router/index.tsx             # RequireAuth + GuardedSection guards
│   │   │   └── store/authStore.ts           # Zustand auth state
│   │   ├── public/
│   │   │   └── mockServiceWorker.js         # MSW service worker (shell-only)
│   │   ├── vercel.json                      # SPA fallback rewrite → index.html
│   │   └── webpack.config.ts               # Host MF config + shared singletons
│   │
│   ├── inventory/                  # Remote — product catalogue (port 3001)
│   │   ├── src/
│   │   │   ├── components/         # ProductTable · Filters · SlideOvers · Modals · StockBadge
│   │   │   ├── hooks/useProducts.ts
│   │   │   ├── pages/InventoryPage.tsx
│   │   │   └── store/inventoryStore.ts
│   │   ├── vercel.json             # CORS headers for cross-origin remoteEntry.js loading
│   │   └── webpack.config.ts       # Remote MF config, exposes ./App
│   │
│   ├── orders/                     # Remote — order management (port 3002)
│   │   ├── src/
│   │   │   ├── components/         # OrderTable · Detail · Timeline · UpdateStatusModal
│   │   │   ├── hooks/useOrders.ts
│   │   │   ├── pages/OrdersPage.tsx
│   │   │   └── store/ordersStore.ts
│   │   ├── vercel.json
│   │   └── webpack.config.ts
│   │
│   └── analytics/                  # Remote — BI dashboard (port 3003)
│       ├── src/
│       │   ├── components/         # MetricCards · RevenueChart · PieChart · BarCharts · DateRangePicker
│       │   ├── hooks/useAnalytics.ts
│       │   ├── pages/AnalyticsPage.tsx
│       │   └── store/analyticsStore.ts
│       ├── vercel.json
│       └── webpack.config.ts
│
├── packages/
│   ├── ui/                         # Shared component library
│   ├── auth/                       # AuthProvider · useAuth · useAuthToken · ProtectedRoute
│   ├── types/                      # Types · Zod schemas · MSW handlers · Seed generators
│   └── config/                     # Shared tsconfig · ESLint · Tailwind base configs
│
├── playwright/                     # E2E suite
│   ├── tests/
│   │   ├── constants.ts            # TEST_CREDENTIALS, TEST_PRODUCT — no hardcoded IDs in specs
│   │   └── operations-workflow.spec.ts  # 14-step cross-MFE workflow
│   ├── pages/                      # Page object model
│   │   ├── LoginPage.ts
│   │   ├── ShellPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── OrdersPage.ts
│   │   └── AnalyticsPage.ts
│   └── playwright.config.ts
│
├── docs/                           # All 6 project documentation files
├── .github/
│   └── workflows/
│       ├── shell.yml               # Triggers on apps/shell/** — includes E2E + GH Pages stage
│       ├── inventory.yml           # Triggers on apps/inventory/**
│       ├── orders.yml              # Triggers on apps/orders/**
│       └── analytics.yml          # Triggers on apps/analytics/**
├── turbo.json                      # Task pipeline: build → typecheck → lint → test
└── package.json                    # npm workspaces root
```

---

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
git clone https://github.com/ahmedismailkhalid/Modulus-MicroFrontEnd-Retail-Operations-Platform.git
cd Modulus-MicroFrontEnd-Retail-Operations-Platform
npm install
```

### Run All Four Applications Concurrently

```bash
npx turbo dev
```

| Application | Local URL |
|-------------|-----------|
| Shell | http://localhost:3000 |
| Inventory | http://localhost:3001 |
| Orders | http://localhost:3002 |
| Analytics | http://localhost:3003 |

The shell webpack config defaults remote URLs to `localhost:300{1,2,3}` when `VITE_*_URL` environment variables are absent. No `.env` file is required for local development.

### Run a Single Application in Isolation

Each remote is a fully functional standalone application:

```bash
npx turbo dev --filter=@modulus/inventory
```

Navigate to http://localhost:3001. Note that MSW is not active in standalone mode — the service worker lives in the shell's `public/` directory. API calls will passthrough to the network and return 404. For isolated remote development, temporarily initialise MSW in the remote's entry point.

### Build All

```bash
npx turbo build
```

Turborepo caches build outputs based on input hashes. Unchanged packages are skipped. Force a full rebuild:

```bash
npx turbo build --force
```

### Quality Checks

```bash
npx turbo lint        # ESLint across all workspaces
npx turbo typecheck   # tsc --noEmit across all workspaces
npx turbo test        # Vitest across all workspaces
```

---

## Environment Variables

Required in the **shell** at build time. Webpack inlines these as string literals in the output bundle — they are not runtime environment variables and cannot be changed post-build.

| Variable | Description | Production Value |
|----------|-------------|-----------------|
| `VITE_INVENTORY_URL` | Inventory MFE base URL (no trailing slash) | `https://modulus-retail-operations-platform-eight.vercel.app` |
| `VITE_ORDERS_URL` | Orders MFE base URL | `https://modulus-retail-operations-platform-delta.vercel.app` |
| `VITE_ANALYTICS_URL` | Analytics MFE base URL | `https://modulus-retail-operations-platform-ten.vercel.app` |

Set these under shell Vercel project → Settings → Environment Variables (Production). The shell must be redeployed after any URL change.

Remotes have **no required environment variables** — they are purely static asset servers.

---

## CI/CD Pipeline

Four independent GitHub Actions pipelines, each scoped to its own `apps/<name>/**` path filter. A push that touches only `apps/orders/**` triggers `orders.yml` exclusively — the other three pipelines do not run.

### Pipeline Stages (all applications)

```
┌─────────┐    ┌──────┐    ┌───────────┐    ┌──────┐    ┌───────┐    ┌────────┐
│ Install │ →  │ Lint │ →  │ Typecheck │ →  │ Test │ →  │ Build │ →  │ Deploy │
└─────────┘    └──────┘    └───────────┘    └──────┘    └───────┘    └────────┘
   npm ci      eslint        tsc --noEmit    vitest     webpack       vercel --prod
```

Stage failure halts the pipeline. The deploy stage never runs on a failed build, typecheck, or test.

### Shell Pipeline — Additional E2E Stage

```
... → Deploy → Playwright E2E (chromium)
                     │
              ┌──────┴───────┐
              │              │
            Pass            Fail
              │              │
         GH Pages       GH Pages report
          report       + Slack alert with:
        published        · Failed test name
                         · Affected MFE
                         · Direct report URL
```

E2E report URL: `https://<user>.github.io/<repo>/e2e-reports/<github.run_id>/`

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API authentication |
| `VERCEL_ORG_ID` | Vercel organisation/team ID |
| `SHELL_PROJECT_ID` | Vercel project ID — shell |
| `INVENTORY_PROJECT_ID` | Vercel project ID — inventory |
| `ORDERS_PROJECT_ID` | Vercel project ID — orders |
| `ANALYTICS_PROJECT_ID` | Vercel project ID — analytics |
| `PAGES_TOKEN` | GitHub token with `pages:write` scope for report publication |
| `MAIL_USERNAME` | SMTP credential for failure alert delivery |

---

## Role-Based Access Control

Role assignments are defined in the shell router and evaluated before any remote bundle is fetched:

```ts
const SECTION_ROLES: Record<string, UserRole[]> = {
  inventory: ["ops_manager", "inventory_staff"],
  orders:    ["ops_manager", "fulfilment_staff"],
  analytics: ["ops_manager"],
};
```

| Section | ops_manager | inventory_staff | fulfilment_staff |
|---------|:-----------:|:---------------:|:----------------:|
| Inventory | ✅ | ✅ | ❌ |
| Orders | ✅ | ❌ | ✅ |
| Analytics | ✅ | ❌ | ❌ |

The `GuardedSection` component evaluates the user's role before `React.lazy()` resolves — an unauthorised user never triggers a `remoteEntry.js` network request. The sidebar renders only the sections accessible to the logged-in role.

---

## E2E Test Architecture

The Playwright suite enforces a strict page object model — zero raw selectors in spec files. All selectors use `data-testid` attributes applied directly to DOM elements in component code. No CSS class selectors, no XPath, no text-content matching.

### Page Objects

| Class | Covered Interactions |
|-------|---------------------|
| `LoginPage` | Credential entry, form submission, error states |
| `ShellPage` | Section navigation, user display assertion, logout |
| `InventoryPage` | Product table, add/edit/toggle, filter, stock badge assertion |
| `OrdersPage` | Order table, status filter, row navigation |
| `OrderDetailPage` | Status update modal, timeline entry assertion |
| `AnalyticsPage` | Chart data presence, metric card value assertions |

### 14-Step Cross-MFE Workflow

```
 1. Navigate to shell login page
 2. Login as Operations Manager (ops@modulus.com)
 3. Assert shell layout: sidebar visible, user display shows role
 4. Navigate to Inventory
 5. Add product: E2E-001 · Electronics · $29.99 · stock 100
 6. Assert product row appears in table with correct SKU
 7. Edit product — update name
 8. Assert stock badge renders green (stock 100 > 20)
 9. Navigate to Orders
10. Locate first order with status "pending" (dynamic ID)
11. Open order detail
12. Update status: Pending → Processing
13. Assert timeline shows Processing entry with timestamp
14. Navigate to Analytics
    Assert revenue chart renders with active data points
    Assert metric cards display non-zero values
    [Logout → assert redirect to /login]
```

### Running E2E Locally

```bash
cd playwright
npm install
npx playwright install chromium

# Against production
$env:PLAYWRIGHT_BASE_URL="https://modulus-retail-operations-platform.vercel.app"
npx playwright test

# Headed (visible browser)
npx playwright test --headed

# View HTML report
npx playwright show-report playwright-report
```

---

## Architectural Decisions & Tradeoffs

### Module Federation over iframes or single-SPA

**iframes** provide hard isolation but break shared state (auth context, routing, viewport-spanning modals) and carry significant performance overhead per frame. **single-SPA** is a framework abstraction layer that adds routing complexity without meaningful benefit when all four applications are owned by the same team and built with the same stack.

Module Federation shares the JavaScript runtime — React, the auth context, and the router are true singletons with no duplication. The cost is version coupling: all four apps must agree on `react@^18.3.1`. For an internal platform with a single owning team, this tradeoff is correct. For a true multi-team, multi-stack scenario, stronger isolation (iframes or separate subdomains with postMessage) would be appropriate.

### In-memory auth tokens over localStorage

`localStorage` tokens are readable by any JavaScript executing on the page, including third-party scripts and injected code. For an application that loads remote bundles from external Vercel URLs, this is a non-trivial attack surface — a compromised remote could exfiltrate tokens.

In-memory tokens are destroyed on tab close and page refresh. The usability cost (re-authentication on refresh) is acceptable for an internal operations tool. For a consumer-facing application with long session expectations, `HttpOnly` cookies via a BFF (Backend for Frontend) would be the correct pattern.

### Zustand over Redux Toolkit

Redux's overhead — reducers, action types, selectors, middleware, `createSlice`, `configureStore` — is disproportionate for per-MFE local UI state that never needs to be shared across the module boundary. Each MFE's Zustand store is fully isolated, zero-boilerplate, and requires no Provider wrapping that could conflict with the shell's React tree. RTK Query would add value with a real API (automatic cache invalidation, request deduplication), but is unnecessary with MSW's in-memory state.

### MSW over a dedicated mock server

A separate mock Express/Fastify server would require process management and introduce network latency variance in tests. MSW intercepts at the service worker level inside the browser process — the same fetch infrastructure the application uses in production. Switching to a real API requires removing the service worker registration and updating no other application code. This is the correct abstraction boundary.

### Four independent Vercel projects over a monorepo deploy

Vercel's monorepo support deploys all apps from one project but links their deployment lifecycles. A build failure in any app blocks all others. Four independent projects enforce true deployment independence: each app has its own deployment history, rollback target, environment variable set, and build log. The operational overhead (four sets of project IDs and secrets) is justified by the architectural guarantee.

---

## Known Constraints

**MSW in standalone remote mode** — the service worker is registered at the shell domain. Running a remote directly at `localhost:3001` does not activate MSW; API calls return network errors. For isolated remote development, temporarily add MSW initialisation to the remote's entry point and remove before committing.

**Token lifetime** — auth tokens do not survive page refresh by design (see authentication architecture). Users must re-authenticate after a full reload. This is not a bug.

**Seed data reset on refresh** — all mutations (added products, status updates) exist only in the MSW handler's in-memory state. A page refresh resets to the original generated seed. Concurrent browser tabs do not share state.

**Vercel Hobby deployment protection** — Vercel Hobby plan re-enables authentication protection on each new deployment. After deploying a remote MFE, verify that Settings → Deployment Protection → Require Log In remains disabled. This is a platform constraint of the Hobby tier; Vercel Pro's Deployment Protection Exceptions feature would make this permanent.

**remoteEntry.js cache** — `remoteEntry.js` is served without a content hash and can be cached by browsers. If a remote redeploys and the browser has a cached `remoteEntry.js`, the old bundle is loaded. In production, set `Cache-Control: no-cache` on `remoteEntry.js` at the CDN level while keeping `max-age=31536000, immutable` on content-hashed chunks.

---

## Documentation

All project documentation is in `/docs`:

| Document | Description |
|----------|-------------|
| [`01_System_Design_Document.md`](docs/01_System_Design_Document.md) | Component boundaries, data flow, module federation topology, shared package contracts |
| [`02_Implementation_Roadmap.md`](docs/02_Implementation_Roadmap.md) | 9-phase build plan with per-phase task list, exit criteria, and dependency graph |
| [`03_API_Contract.md`](docs/03_API_Contract.md) | Full MSW handler specification — request shapes, response schemas, error codes, validation rules |
| [`04_CICD_Pipeline_Specification.md`](docs/04_CICD_Pipeline_Specification.md) | Pipeline stage definitions, path filter rules, secret inventory, failure behaviour |
| [`05_Playwright_E2E_Test_Plan.md`](docs/05_Playwright_E2E_Test_Plan.md) | E2E test step definitions, page object method signatures, selector conventions, assertion strategies |
| [`06_Success_Criteria.md`](docs/06_Success_Criteria.md) | Binary pass/fail criteria across product, architecture, engineering quality, performance, CI/CD, E2E, and portfolio dimensions |
