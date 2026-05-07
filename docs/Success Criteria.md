# Modulus — Retail Operations Platform
## Success Criteria
`Version 1.0`

---

## Table of Contents
1. [Purpose](#1-purpose)
2. [Product Criteria](#2-product-criteria)
3. [Architecture Criteria](#3-architecture-criteria)
4. [Engineering Quality Criteria](#4-engineering-quality-criteria)
5. [Performance Criteria](#5-performance-criteria)
6. [CI/CD Criteria](#6-cicd-criteria)
7. [E2E Criteria](#7-e2e-criteria)
8. [Portfolio Presentation Criteria](#8-portfolio-presentation-criteria)
9. [One-Sentence and Three-Sentence Descriptions](#9-one-sentence-and-three-sentence-descriptions)

---

## 1. Purpose

This document defines the complete set of criteria that must be met for the Modulus project to be considered finished. Every criterion is binary — it either passes or it does not. The project is complete when every criterion in every category passes.

---

## 2. Product Criteria

| Criterion | Target |
|-----------|--------|
| Users can log in with all three defined credential sets | All three pass |
| Role-based access correctly restricts section navigation per role | Verified for all three roles |
| Inventory: products can be created, edited, deactivated, and reactivated | All four operations succeed |
| Inventory: search by name and SKU returns correct filtered results | Verified on seeded data |
| Inventory: stock badge colour is correct for all three stock ranges | Green, amber, red correct |
| Inventory: category management allows adding and renaming categories | Both operations succeed |
| Orders: order table filters correctly by all five status values | All five filters verified |
| Orders: order detail view shows customer info, line items, and timeline | All three sections render |
| Orders: valid status transitions succeed; invalid transitions are blocked | State machine enforced in UI and API |
| Analytics: all four charts render with data from the seeded set | All four charts render |
| Analytics: date range selector re-fetches and re-renders all charts | Verified on range change |
| Logout redirects to the login page and clears the auth session | Redirect confirmed, re-auth required |

---

## 3. Architecture Criteria

| Criterion | Target |
|-----------|--------|
| Each remote application has its own independent Vercel project | 4 separate Vercel projects |
| The shell loads remotes dynamically at runtime, not at build time | Verified via network tab: remoteEntry.js fetched on navigation |
| React runs as a single shared instance across all four applications | No duplicate React instance errors in console |
| Deploying a remote does not require redeploying the shell | Verified by deploying inventory independently |
| Error boundary renders fallback UI when a remote URL is unreachable | Verified by pointing to invalid URL |
| Auth context is accessible inside remote components via `useAuth` hook | Verified: user object accessible in all three remotes |
| Remote URLs are configured via environment variables, not hardcoded | Verified in shell build config |
| Shared packages are consumed via workspace references, not npm publish | Verified in `package.json` of each app |

---

## 4. Engineering Quality Criteria

| Criterion | Target |
|-----------|--------|
| TypeScript strict mode compiles with zero errors across all workspaces | 0 errors on `tsc --noEmit` |
| ESLint produces zero errors across all workspaces | 0 errors on `turbo run lint` |
| No `any` types exist in application code | Verified via `no-explicit-any` ESLint rule |
| No `console.log` statements exist in committed code | Verified via `no-console` ESLint rule |
| All API response types are sourced from `packages/types` | No inline API type definitions in app code |
| Vitest unit test coverage is above 80% for `packages/ui` and `packages/auth` | >80% on coverage report |
| All selectors in Playwright tests use `data-testid` attributes | No CSS or XPath selectors in page objects |
| Environment variables are validated at startup via Zod | App fails loudly on missing env var |
| MSW is initialised only in the shell, not in any remote | Verified: remotes contain no MSW initialisation code |

---

## 5. Performance Criteria

Measured using Lighthouse against each production Vercel URL in an incognito browser window with no extensions.

| Criterion | Target |
|-----------|--------|
| Shell Lighthouse Performance score | Above 85 |
| Inventory Lighthouse Performance score | Above 85 |
| Orders Lighthouse Performance score | Above 85 |
| Analytics Lighthouse Performance score | Above 85 |
| Shell Lighthouse Accessibility score | Above 90 |
| Inventory Lighthouse Accessibility score | Above 90 |
| Orders Lighthouse Accessibility score | Above 90 |
| Analytics Lighthouse Accessibility score | Above 90 |
| No layout shift visible during remote load transitions | CLS below 0.1 on shell |
| Remote loading skeleton appears within 200ms of navigation | Observed in browser devtools |

---

## 6. CI/CD Criteria

| Criterion | Target |
|-----------|--------|
| Four independent workflow files exist, one per application | 4 `.yml` files in `.github/workflows/` |
| A push to `apps/shell` triggers only `shell.yml`, not others | Verified via GitHub Actions run history |
| A push to `apps/inventory` triggers only `inventory.yml`, not others | Verified via GitHub Actions run history |
| A deliberate lint error fails the pipeline at the lint stage | Pipeline fails, subsequent stages do not run |
| A deliberate TypeScript error fails at the typecheck stage | Pipeline fails, subsequent stages do not run |
| A deliberate failing unit test fails at the unit test stage | Pipeline fails, subsequent stages do not run |
| Pull request pipelines run all stages except deploy | Verified on a test PR |
| Branch protection requires all four pipelines to pass before merge | Merge blocked on any pipeline failure |
| Each application deploys to its own distinct Vercel project | Verified in Vercel dashboard |
| All required secrets are configured in GitHub repository settings | All 8 secrets present |

---

## 7. E2E Criteria

| Criterion | Target |
|-----------|--------|
| All 14 test steps pass on the production composed application | 14/14 pass in Playwright report |
| A deliberately broken test step fails the shell pipeline | Pipeline marked failed on test failure |
| HTML report publishes to GitHub Pages after every pipeline run | Report URL accessible after each run |
| Report URL is unique per pipeline run (includes run ID in path) | Different URL per run verified |
| Slack alert fires on test failure with all required fields | Alert received with test name, MFE, report URL |
| Slack alert does not fire on a passing run | Verified: no alert on clean run |
| All selectors in test files use page object model methods only | No raw selectors in spec files |
| Test constants file defines all test data identifiers | No hardcoded IDs in spec files |

---

## 8. Portfolio Presentation Criteria

| Criterion | Target |
|-----------|--------|
| All four production URLs are live and accessible | URLs load without error |
| README covers: overview, architecture, local setup, env vars, production URLs | All five sections present |
| Architecture diagram is included in the README | Diagram present and legible |
| All six documentation files are complete and present in the repository | 6 files committed |
| Portfolio website card is updated with project name, stack, and live links | Card visible on portfolio site |
| LinkedIn project entry is written and published | Entry visible on LinkedIn profile |
| Screen capture walkthrough of the full user journey is recorded | Recording available |
| Project can be explained in one sentence a non-technical client understands | Sentence defined and tested |
| Project can be explained in three sentences a senior engineer respects | Technical summary defined |

---

## 9. One-Sentence and Three-Sentence Descriptions

### 9.1 For Non-Technical Clients

Modulus is an internal operations dashboard that lets retail staff manage products, process orders, and monitor sales performance — built so that each team can update and deploy their section of the system independently without affecting the others.

### 9.2 For Senior Engineers

Modulus is a micro-frontend platform built on Webpack 5 Module Federation, decomposed into four independently deployable React 18 applications sharing a singleton auth context and a shared Tailwind-based component library via a Turborepo monorepo.

Each application has its own GitHub Actions CI/CD pipeline running lint, typecheck, Vitest unit tests, build, and Vercel deployment in sequence, with the shell pipeline triggering a Playwright E2E suite after deploy.

Test failures block the pipeline, publish an HTML report to GitHub Pages at a run-scoped URL, and fire a Slack alert containing the failed test name, the affected MFE, and a direct link to the report.
