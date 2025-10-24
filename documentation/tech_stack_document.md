# Tech Stack Document for Company Dashboard System

This document outlines the technologies chosen to build a dual-application Company Dashboard System. It consists of a read-only Display Portal for viewers and a full-featured Admin Dashboard. The goal is to explain each choice in everyday terms so anyone can understand why and how they work together.

## 1. Frontend Technologies

These tools shape everything users see and interact with in their browser.

- **Next.js (App Router & Server Components)**
  - A React-based framework by Vercel that handles page routing, server-side data fetching, and fast page loads.
  - Helps deliver pre-built HTML for better performance and search engine friendliness.

- **TypeScript**
  - A superset of JavaScript that adds simple checks before running code.
  - Reduces errors by catching mistakes early, making the code more reliable.

- **Tailwind CSS v4**
  - A utility-first styling library that lets developers apply small reusable style classes directly in markup.
  - Speeds up custom design work and ensures consistent spacing, colors, and layouts.

- **shadcn/ui**
  - A collection of ready-made UI components like cards, tables, badges, forms, and buttons.
  - Ensures a polished look straight out of the box while letting developers tweak designs as needed.

- **Turbopack**
  - The modern bundler behind Next.js that speeds up build and reload times during development.

- **Next.js Server Actions**
  - A way to run secure data updates (create, update, delete) directly on the server without exposing credentials.

How it improves the experience:
- Fast initial loading and smooth navigation.
- Consistent, responsive design across devices.
- Reusable components speed up new feature development.
- Fewer bugs thanks to early type checks and server-side safeguards.

## 2. Backend Technologies

These tools power data storage, user authentication, and real-time updates behind the scenes.

- **Supabase (PostgreSQL Database & Auth)**
  - A hosted database solution built on PostgreSQL, offering a familiar SQL interface.
  - Includes a built-in authentication system to sign in users and manage their roles (Admin vs. Viewer).

- **Supabase Realtime**
  - Push-based updates that notify the Display Portal instantly when data changes.
  - Ensures all viewers see the latest information without manual refresh.

- **Drizzle ORM**
  - A lightweight library to interact with PostgreSQL in a type-safe way, matching your database schema to your code.
  - Minimizes runtime errors by enforcing structure at compile time.

- **Next.js Server Actions & API Routes**
  - Built-in mechanisms for handling data mutations (adding, editing, deleting records) securely on the server.
  - They call the Supabase client to modify the database, leveraging server-side trust.

How these fit together:
- Supabase stores and secures all data.
- Drizzle lets your code read and write data with confidence.
- Server Actions act as a safe bridge between the browser and the database.
- Realtime subscriptions push updates to the Display Portal as soon as changes occur.

## 3. Infrastructure and Deployment

This section covers where and how the code runs in production and development.

- **Vercel**
  - Hosting platform optimized for Next.js projects.
  - Provides automatic builds, global content delivery (CDN), and instant rollbacks.

- **GitHub & GitHub Actions (CI/CD)**
  - GitHub stores the code and tracks changes.
  - GitHub Actions automatically runs tests and deploys to Vercel when code is merged.

- **Docker**
  - Containerizes the development environment so everyone on the team works with the same setup.
  - Removes the classic “it works on my machine” problem.

- **Environment Variables**
  - Secret keys (like Supabase credentials) are stored securely outside of the codebase.

How this supports the project:
- Reliable, repeatable deployments with minimal manual steps.
- Fast global performance via Vercel’s CDN.
- Safe handling of sensitive credentials.
- Consistent developer experience across machines.

## 4. Third-Party Integrations

We leverage external services that slot seamlessly into our project:

- **Supabase** (Auth, Database, Realtime)
  - All-in-one backend solution.

- **supabase-auth-helpers-nextjs** (optional)
  - Simplifies wiring Supabase Auth into Next.js pages and middleware.

- **SWR or TanStack Query** (for fallback refresh)
  - Client-side libraries that can auto-refresh data on a set interval (e.g., every 60 seconds) if realtime fails.

- **Playwright or Cypress**
  - Automated testing tools to simulate user workflows (like an admin editing an item and viewers seeing it update).  

These integrations boost functionality by:
- Providing battle-tested authentication and data sync.
- Ensuring data remains fresh even if realtime breaks.
- Validating core features with automated tests.

## 5. Security and Performance Considerations

We’ve baked in measures to keep the system safe and fast:

- **Row-Level Security (RLS) in Supabase**
  - Database policies that ensure only Admins can modify data, and Viewers can only read.

- **Supabase Auth**
  - Manages user identity, sign-in, and role-based claims.

- **Next.js Middleware**
  - Protects Admin routes by checking user roles before granting access.

- **Server Actions for Mutations**
  - All sensitive database writes happen on the server, never exposing secrets to the browser.

- **TypeScript & Drizzle ORM**
  - Early error detection and a single source of truth for data shapes.

- **Caching & Revalidation**
  - `revalidatePath()` calls ensure that after data changes, pages show up-to-date information.

- **Error Handling & Fallbacks**
  - The UI gracefully shows a friendly message if data can’t load and retries automatically.

- **Turbopack & Code Splitting**
  - Reduces bundle sizes and speeds up page loads by only sending the code needed for each page.

## 6. Conclusion and Overall Tech Stack Summary

Our Company Dashboard System stands out by combining modern, proven tools:

- **Next.js + Turbopack** for blazing-fast page loads and a smooth developer experience.
- **Supabase** for an all-in-one backend: database, auth, real-time updates.
- **TypeScript + Drizzle ORM** for type-safe, reliable data handling.
- **Tailwind CSS + shadcn/ui** for rapid, consistent UI design.
- **Vercel + GitHub Actions** for painless, automated deployments.

This stack aligns perfectly with the project goals:
- **Real-time data** pushes to viewers.
- **Secure, role-based access** for Admins and Viewers.
- **Modular component-driven architecture** for maintainability.
- **Scalable and reliable** deployments on a global CDN.

In short, these technologies work together to deliver a fast, secure, and easy-to-maintain dual-dashboard experience for both administrators and end users.