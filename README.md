# Meridian University — Frontend

A role-based university portal built with **Next.js 16 (App Router)**, TypeScript and Tailwind CSS 4. It is the frontend for the
[University Management System backend](https://github.com/redoyghoshantu/University-Management-System-Backend) (Express + Prisma + PostgreSQL + Stripe).

> **B7A7 Frontend Assignment** · Domain: University Management System

## Live

| | |
|---|---|
| Frontend | _add your Vercel URL_ |
| Backend API | https://university-management-system-backend-dm3a.onrender.com |
| API docs | https://redoyghoshantu-2279765.docs.buildwithfern.com/api-reference/university-management-system |

> The backend runs on a free Render instance: the **first request after idle can take 30–60 seconds**. The login page tells you when it is waking up.

## Demo accounts (one-click on the login page)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@antu.com` | `admin123` |
| Faculty | `faculty@rahman.com` | `123456` |
| Student | `student@gmail.com` | `123456` |

Payments use **Stripe test mode**: card `4242 4242 4242 4242`, any future expiry, any CVC.

## Roles & workflows

| Role | What they do |
|---|---|
| **Student** | Browse offerings, enroll through a 3-step wizard, pay tuition via Stripe, cancel unpaid enrollments (optimistic UI), view results and payment history |
| **Faculty** | See assigned classes and confirmed rosters, create midterm/final exams, enter marks with instant (optimistic) grading, view grade analytics |
| **Admin** | Platform charts, user search + role changes + soft delete, course catalog CRUD, department/semester management, multi-step wizard to schedule course offerings, audit logs |

## Pages (28 routes)

```
Public       /  /about  /courses  /faq  /contact
Auth         /login (one-click demo roles)  /register
Admin        /admin  /admin/users  /admin/courses  /admin/offerings  /admin/academics  /admin/reports
Student      /student  /student/enroll  /student/results  /student/payments  /student/profile
Faculty      /faculty  /faculty/offerings/[id]  /faculty/analytics  /faculty/profile
Payment      /payment/success  /payment/cancel
Utility      not-found.tsx  error.tsx  global-error.tsx  loading.tsx (per section)
```

## Architecture

```
Browser ──► Next.js (Server Components, Route Handlers, proxy.ts) ──► Express API (Render)
```

- **Server Components by default.** List pages (users, courses, offerings, audit logs, results, payments, catalog) fetch on the server and
  stream a `loading.tsx` skeleton. `"use client"` is only used where interaction is needed (forms, dialogs, charts, wizards, optimistic mutations).
- **Auth.** Login/register go through Route Handlers that store the JWTs in **HTTP-only, SameSite=Lax cookies** — tokens never touch JavaScript.
  `proxy.ts` (Next 16's replacement for `middleware.ts`) protects `/admin`, `/student`, `/faculty`, redirects wrong-role users to their own dashboard,
  and silently renews an expired access token from the refresh token. The backend re-checks the role on every call.
- **BFF proxy.** Client-side TanStack Query calls hit `/api/bff/*`, which attaches the Bearer token server-side. No CORS configuration needed and the
  backend URL stays private.
- **State.** TanStack Query for server state (caching, optimistic updates, invalidation); Zustand for UI state (mobile nav, persisted enrollment-wizard progress);
  the URL for filters/search/pagination (`useSearchParams`) so every view is shareable.
- **Forms.** React Hook Form + Zod everywhere, with the same rules as the backend (e.g. credits 1–6, password ≥ 6).
- **Payments.** `POST /payments/initiate` returns a Stripe Checkout URL; `/payment/success` and `/payment/cancel` verify the session **server-side** with the backend.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn-style components on Radix UI · TanStack Query · Zustand · React Hook Form · Zod · Recharts · Sonner · Lucide

## Getting started

```bash
npm install
cp .env.example .env.local   # BACKEND_API_URL points to the deployed API by default
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |

### Environment variables

| Name | Where | Purpose |
|---|---|---|
| `BACKEND_API_URL` | Vercel (server) | Backend base URL, e.g. `https://…onrender.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Public site URL for Open Graph metadata |

### Backend settings needed for payments (Render)

Set these on the backend so Stripe redirects back to this frontend:

```
CLIENT_URL=https://<your-frontend>.vercel.app
CLIENT_SUCCESS_URL=https://<your-frontend>.vercel.app/payment/success
CLIENT_CANCEL_URL=https://<your-frontend>.vercel.app/payment/cancel
```

## Project structure

```
src/
  app/            routes (marketing, auth, admin, student, faculty, payment, api)
  components/     ui/ (primitives) · shared/ (DataTable, Pagination, SearchInput…) · layout/ · feature folders
  hooks/          use-url-state, use-debounce, use-api-mutation, use-auth
  lib/            api (server/client/public fetchers), session, jwt, constants
  store/          Zustand stores
  proxy.ts        route protection + role redirects
```
