# Project Requirements Document (PRD)

## 1. Project Overview

The **Company Dashboard System** is a dual-application web platform that provides both a read-only **Display Portal** for general viewers and a full-featured **Admin Dashboard** for company administrators. The Display Portal presents live company data—news items, urgent tasks, and employee status—in a clean, three-column layout. It updates in real time via Supabase Realtime subscriptions, with a 60-second fallback refresh, ensuring that all viewers see the latest information without manual page reloads. The Admin Dashboard offers create, read, update, and delete (CRUD) operations on the same data sets, backed by robust role-based access control (RBAC) and Supabase Row-Level Security (RLS) policies.

This system is built to accelerate internal communication and task management by making critical updates instantly visible to all stakeholders. Key objectives include: 1) seamless authentication and RBAC so that only authorized admins can modify data, 2) sub-second real-time data propagation to display users, 3) clear separation of viewer vs. admin interfaces, and 4) a maintainable, type-safe codebase using modern web frameworks. Success will be measured by end-to-end functionality (login, data updates, live refresh), sub-second update latency under typical load, and a secure deployment that prevents unauthorized data access.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1.0):**
- User authentication via Supabase Auth (email/password) with two roles: **Admin** and **Viewer**.
- Display Portal (read-only) with three modules:
  - **News Feed**: List of news items (title, body, timestamp).
  - **Urgent Tasks**: List of high-priority tasks (description, due date, severity).
  - **Employee Status**: Visual status indicators (online/offline/on leave) for each employee.
- Admin Dashboard (CRUD) pages for each module, protected by role checks and middleware.
- Real-time data updates on the Display Portal using Supabase Realtime subscriptions.
- 60-second fallback polling for reliability.
- Database schema definitions for `news_items`, `urgent_tasks`, and `employees` using Drizzle ORM.
- Supabase Row-Level Security (RLS) policies: Readers (all authenticated) vs. Writers (Admins only).
- Dockerized development environment and Vercel deployment configuration.

**Out-of-Scope (Deferred to Future Phases):**
- File uploads or photo gallery features.
- Attendance tracking or timesheet modules.
- Bulk import/export (CSV, Excel).
- Advanced analytics or charting.
- Multi-language (i18n) support.
- Mobile-native (React Native or Swift/Java) app.

## 3. User Flow

**Viewer Flow:** A viewer arrives at the application, lands on the public landing page, and clicks **Log In**. After entering their email and password, they are redirected to the **Display Portal** dashboard. The screen is split into three columns—News Feed, Urgent Tasks, and Employee Status. As soon as they log in, a WebSocket connection via Supabase Realtime is established. New events push into the UI instantly; if the connection drops, the page falls back to polling every 60 seconds. The viewer can scroll through lists but cannot edit anything.

**Admin Flow:** An admin user logs in the same way but is routed to the **Admin Dashboard**. Here, a left navigation menu lists **News**, **Tasks**, and **Employees**. Clicking **News** opens a management table with existing items, an **Add New** button, and edit/delete controls. Each form uses `shadcn/ui` components for input, select, and date pickers. On submit, a Next.js Server Action calls Supabase to update the database, triggers a real-time broadcast to all viewers, and revalidates the Display Portal cache. The admin receives immediate UI feedback on success or error.

## 4. Core Features

- **Authentication & RBAC**
  - Email/password login via Supabase Auth.
  - Two user roles: Admin (full access), Viewer (read-only).
  - Next.js Middleware to guard `/app/(admin)` routes.
- **Display Portal** (Read-Only)
  - Three-column layout: News Feed, Urgent Tasks, Employee Status.
  - Real-time subscription to Supabase tables.
  - 60-second polling fallback.
- **Admin Dashboard** (CRUD)
  - List, Create, Edit, Delete operations for each module.
  - Server Actions for secure database mutations.
  - Cache revalidation (`revalidatePath`) after writes.
- **Database Integration**
  - Drizzle ORM with TypeScript schemas.
  - Tables: `news_items`, `urgent_tasks`, `employees`.
- **Real-Time Updates**
  - Supabase Realtime subscriptions on tables.
  - Automatic UI refresh on payload.
- **Security & Compliance**
  - Supabase Row-Level Security policies.
  - HTTPS enforcement in production.
- **Developer Experience**
  - TypeScript-first, Docker support, Vercel deploy.
  - Organized file structure (`/app`, `/components`, `/lib`, `/db`).

## 5. Tech Stack & Tools

- **Frontend:** Next.js (App Router) with React and Turbopack
- **Styling & UI:** Tailwind CSS v4, shadcn/ui
- **Authentication & Realtime:** Supabase Auth & Realtime
- **Database & ORM:** PostgreSQL on Supabase, Drizzle ORM (TypeScript)
- **Server Actions:** Next.js Server Actions for secure mutations
- **Deployment:** Vercel (CI/CD), Docker (local dev)
- **Utilities:** `supabase-js` client in `/lib/supabase.ts`, Next.js Middleware in `/app/(admin)/middleware.ts`

## 6. Non-Functional Requirements

- **Performance**
  - Display Portal initial load <2 seconds on 3G.
  - Real-time update latency <1 second under 100 concurrent clients.
- **Security**
  - All API calls over HTTPS.
  - RLS policies enforce per-role access.
  - Environment secrets managed via Vercel / `.env` and never exposed.
- **Scalability**
  - Supabase handles up to 1,000 concurrent realtime subscribers.
- **Usability**
  - Fully responsive, accessible via desktop and tablet.
  - Consistent UI patterns and error messages.
- **Maintainability**
  - End-to-end TypeScript types.
  - Modular, component-driven architecture.

## 7. Constraints & Assumptions

- Supabase project and database already provisioned.
- Users must have confirmed email addresses before role claims assigned.
- Vercel account configured with environment variables for Supabase.
- Average concurrent clients expected under 100 for real-time subscriptions.
- Assumes stable internet connectivity; fallback polling covers brief outages.

## 8. Known Issues & Potential Pitfalls

- **Realtime Rate Limits**: Supabase may throttle if too many frequent writes or subscribers. Mitigation: batch updates or limit subscription scope.
- **Token Expiration**: Supabase JWTs expire; client must handle silent refresh or force re-login.
- **Network Flakiness**: Real-time socket disconnects; ensure polling fallback triggers reliably.
- **Browser Caching**: Over-aggressive caching could serve stale content; use `revalidatePath` carefully.
- **RLS Misconfigurations**: Incorrect policies can lock out Admins or expose data; test policies thoroughly with integration tests.

---
This document provides a clear blueprint for building the Company Dashboard System. All technical details, data flows, and security measures are explicitly defined so that subsequent technical specifications (tech stack docs, component guidelines, folder structure) can be generated without ambiguity.