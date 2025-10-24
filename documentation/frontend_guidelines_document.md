# Frontend Guideline Document

This document describes the frontend setup for the **Company Dashboard System**. It covers architecture, design principles, styling, component structure, state management, routing, performance, testing, and more. By following these guidelines, anyone can understand, maintain, and extend the frontend without a deep technical background.

## 1. Frontend Architecture

**Frameworks & Libraries**
- **Next.js (App Router)** with Turbopack for fast builds and routing.  
- **TypeScript** for type safety across the entire codebase.  
- **Tailwind CSS v4** (utility-first styling) + **shadcn/ui** for prebuilt, themeable UI components.  
- **Drizzle ORM** for type-safe database queries against PostgreSQL.  
- **Supabase SDK** for authentication, real-time subscriptions, and data mutations.  
- **Docker** for consistent local development environments.  

**How It Scales & Stays Maintainable**
- **Component-Based**: Pieces of UI live in their own folders and can be reused across both portals.  
- **Server & Client Components**: Data fetching can happen on the server, keeping bundle sizes small.  
- **Route Groups**: `(viewer)` and `(admin)` sections live side by side under `/app`, each with its own layout and access rules.  
- **Type Safety**: Shared types between your Supabase schema, Drizzle ORM, and React components reduce runtime bugs.  

**Performance**
- **Turbopack** for near-instant rebuilds.  
- **Next.js ISR & Caching**: `revalidatePath()` calls ensure fresh data without slowing page loads.  
- **Tree-shaking & PurgeCSS** from Tailwind to keep CSS minimal.  

## 2. Design Principles

1. **Usability**: Simple, self-explanatory interfaces (clear labels, intuitive layouts).  
2. **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation, and color contrast meeting WCAG 2.1 AA.  
3. **Responsiveness**: Mobile-first design with Tailwind’s responsive utilities to adapt to all screen sizes.  
4. **Consistency**: Shared component library (`shadcn/ui` and custom UI) ensures uniform look and behavior.  
5. **Feedback**: User actions (form submits, real-time updates) show spinners or toast messages so users know the app is working.  

_Application of Principles_  
- Buttons have clear focus states and `aria-labels`.  
- Layouts adjust from a single column on mobile to three columns on desktop in the Display Portal.  
- Error messages appear inline next to form fields and in a consistent toast area.  

## 3. Styling and Theming

**Styling Approach**  
- **Utility-First (Tailwind CSS)**: Write classes like `px-4 py-2 bg-blue-600 text-white` directly in JSX.  
- **No BEM/SMACSS** – Tailwind covers our CSS structure needs.  
- **Theme Variables**: Defined in `tailwind.config.js` for colors, fonts, and spacing.  

**Design Style**
- **Modern Flat Design** with subtle **glassmorphism** on dashboard cards: semi-transparent panels with soft shadows and rounded corners.  

**Color Palette**
- **Primary**: #2563EB (Blue 600)  
- **Primary Dark**: #1E40AF (Blue 800)  
- **Secondary**: #F59E0B (Amber 500)  
- **Background**: #F3F4F6 (Gray 100)  
- **Surface**: #FFFFFF (White)  
- **Success**: #16A34A (Green 600)  
- **Error**: #DC2626 (Red 600)  
- **Text Primary**: #111827 (Gray 900)  
- **Text Secondary**: #6B7280 (Gray 500)  

**Font**
- **Inter** (system-font stack fallback): clean, highly legible for dashboards and forms.  

## 4. Component Structure

**Folder Layout**
```
/components
  /common     # shared UI elements (buttons, modals)
  /viewer     # read-only display portal components
  /admin      # forms, tables, editors for admin CRUD
  /ui         # wrappers around shadcn/ui primitives
```

**Best Practices**
- Each component lives in its own folder with `index.tsx`, styles (if any), and tests.  
- Use clear, descriptive names (`TodoList`, `NewsFeed`, `EmployeeStatusBar`, `TodoForm`, etc.).  
- Small, focused components: one job each (Single Responsibility Principle).  

**Why Component-Based Helps**
- **Reusability**: Build once, reuse everywhere (e.g., a `Card` component).  
- **Maintainability**: Fix a bug in one place and all usages update automatically.  
- **Team Collaboration**: Clear boundaries let multiple people work in parallel without conflicts.  

## 5. State Management

**Authentication & User State**
- Centralized in a React Context (`AuthContext`) using the Supabase Auth client.  
- Provides `user`, `session`, and `signIn/ signOut` methods to the app.  

**Server Data Fetching**
- **Server Components** fetch initial data securely, minimizing client bundle size.  

**Real-Time & Client State**
- **Supabase Realtime** subscriptions via a custom hook (`useRealtimeSubscription`) to push updates into component state.  
- **SWR (TanStack Query)** as a fallback for polling and cache management (`refreshInterval: 60000`).  

**Why This Works**
- Avoids global mutable state: each component manages its own slice, updated via subscriptions or SWR.  
- Real-time events merge into SWR’s cache, triggering smooth UI re-renders.  

## 6. Routing and Navigation

**Next.js App Router**
- `/app/(viewer)/...` for the Display Portal (read-only).  
- `/app/(admin)/...` for the Admin Dashboard (protected CRUD).  
- Nested layouts in each group for shared sidebars or headers.  

**Protecting Routes**
- **Middleware** in `/app/(admin)/middleware.ts` checks `user` and `is_admin` claim before granting access.  

**Navigation**
- Use Next.js `<Link>` for client-side navigation.  
- Active link styling via `usePathname()` hook to highlight the current section.  

## 7. Performance Optimization

**Code Splitting & Lazy Loading**
- Dynamic imports (`next/dynamic`) for heavy components (charts, rich text editors).  

**Asset Optimization**
- Built-in `<Image>` optimization for avatars and photos.  
- Purge unused CSS with Tailwind’s JIT/purge settings.  

**Caching & Data Freshness**
- ISR with `revalidatePath()` in Server Actions to push fresh data on updates.  
- SWR’s `refreshInterval` as a fallback for connectivity issues.  

**Build & Deploy**
- **Turbopack** for blazing-fast incremental builds in development.  
- **Vercel** for production: edge caching, automatic HTTPS, global CDN.  

## 8. Testing and Quality Assurance

**Unit Tests**
- **Vitest** + **React Testing Library** for components and hooks.  
- Mock Supabase methods with **msw** (Mock Service Worker).  

**Integration Tests**
- Test Server Actions and the Supabase client against a test database.  
- Verify Drizzle queries return expected shapes.  

**End-to-End (E2E) Tests**
- **Playwright** (or Cypress) scripts covering key flows:  
  - Admin logs in, adds/edits a news item, and reader sees it in <1s.  
  - Viewer experience when the database is unreachable (fallback refresh).  

**Linting & Type Checking**
- **ESLint** with recommended Next.js & TypeScript rules.  
- **Prettier** for consistent formatting.  
- **Strict TS Config** to catch errors at compile time.  

## 9. Conclusion and Overall Frontend Summary

This Document lays out a clear, maintainable, and high-performance frontend for the Company Dashboard System. By combining Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase:

- We achieve a **scalable architecture** that supports two distinct portals (Display and Admin).  
- **Design principles** (usability, accessibility, responsiveness) ensure a great user experience.  
- A **modern, flat design** with glassmorphic accents keeps the UI fresh and consistent.  
- **Component-based structure**, real-time subscriptions, and server actions deliver instant updates and secure data handling.  
- **Performance optimizations** and **robust testing** guarantee reliability in production.  

With these guidelines, any developer or designer can jump in and understand how the frontend works, how to extend it, and how to maintain a quality user experience over time.