# Backend Structure Document

## 1. Backend Architecture

Our backend is built on a modern, serverless foundation that ties together Next.js and Supabase to deliver real-time, secure, and scalable functionality.

- **Frameworks and Patterns**
  - Next.js App Router with Server Components and Server Actions
  - TypeScript for end-to-end type safety
  - Drizzle ORM (optional) or native `@supabase/supabase-js` client for database access
  - Component-driven architecture keeps logic and UI modular and reusable

- **How It Supports Scalability, Maintainability, and Performance**
  - **Scalability**: Next.js serverless endpoints and Supabase Postgres scale horizontally as traffic grows
  - **Maintainability**: Clear separation of concerns (`app/`, `components/`, `lib/`, `db/`) and strong typing minimize bugs and simplify updates
  - **Performance**: Server Components fetch data on the server for fast page loads. Incremental Static Regeneration (ISR) and on-demand revalidation ensure fresh content with low latency. Vercel’s CDN caches static assets globally.

## 2. Database Management

We use Supabase’s managed PostgreSQL database to store all data. Supabase also provides built-in authentication, row-level security (RLS), and real-time subscriptions.

- **Type**: Relational (SQL)
- **System**: Supabase Postgres
- **Access Layer**:
  - Drizzle ORM models (or raw SQL via `@supabase/supabase-js`)
  - Centralized Supabase client in `lib/supabase.ts`

- **Data Management Practices**:
  - Automatic backups and point-in-time recovery via Supabase
  - Schema migrations managed through Supabase’s migration tools or Drizzle CLI
  - RLS policies enforce read/write permissions at the database level

## 3. Database Schema

Below is a human-readable overview of each table and its columns. A sample PostgreSQL schema follows.

### Human-Readable Schema

  • **todos**: to-do items or urgent tasks
    – id (UUID, primary key)
    – title (text)
    – description (text)
    – completed (boolean)
    – severity (enum: low, medium, high, critical)
    – due_date (timestamp)
    – created_at (timestamp)
    – updated_at (timestamp)

  • **news_items**: articles or announcements
    – id (UUID, primary key)
    – title (text)
    – content (text)
    – image_url (text)
    – author_id (UUID, foreign key → employees.id)
    – created_at (timestamp)
    – updated_at (timestamp)

  • **employees**: user profiles for Admins and Viewers
    – id (UUID, primary key)
    – name (text)
    – email (text, unique)
    – role (enum: admin, viewer)
    – avatar_url (text)
    – status (enum: online, offline, busy, away)
    – last_active (timestamp)

  • **attendance**: daily check-in records
    – id (UUID, primary key)
    – employee_id (UUID, foreign key → employees.id)
    – date (date)
    – status (enum: present, absent, late, on_leave)
    – check_in (timestamp)
    – check_out (timestamp)

  • **photos**: image carousel data
    – id (UUID, primary key)
    – url (text)
    – caption (text)
    – created_at (timestamp)

### PostgreSQL Schema

```sql
-- Table: todos
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  severity TEXT CHECK(severity IN ('low','medium','high','critical')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: news_items
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('admin','viewer')) DEFAULT 'viewer',
  avatar_url TEXT,
  status TEXT CHECK(status IN ('online','offline','busy','away')) DEFAULT 'offline',
  last_active TIMESTAMPTZ
);

-- Table: attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('present','absent','late','on_leave')) NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ
);

-- Table: photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```  

## 4. API Design and Endpoints

We don’t expose a separate REST or GraphQL server. Instead, we use Next.js Server Actions and the Supabase client directly.

- **Approach**: 
  - Server Components fetch data on the server side via Supabase queries
  - Server Actions handle create/update/delete mutations securely
  - Client Components subscribe to real-time changes and refresh UI

- **Key Endpoints (via Server Actions / supabase-js)**
  - `/api/auth` (handled by Supabase Auth helpers): sign-in, sign-up, sign-out
  - `getTodos()` / `createTodo()` / `updateTodo()` / `deleteTodo()`
  - `getNewsItems()` / `createNewsItem()` / `updateNewsItem()` / `deleteNewsItem()`
  - `getEmployees()` / `updateEmployeeStatus()` / `getAttendance()` / `updateAttendance()`
  - `getPhotos()` / `createPhoto()` / `deletePhoto()`

Each of these is wrapped in a Next.js Server Action or called directly from a React hook, ensuring credentials never reach the browser.

## 5. Hosting Solutions

- **Next.js Frontend & API**: Deployed on Vercel
  - Global Edge Network for instant static content delivery
  - Automatic scaling and zero-config deployments
  - Built-in load balancing and SSL termination

- **Database & Auth**: Hosted by Supabase
  - Fully managed PostgreSQL with built-in real-time and authentication
  - Automatic backups, monitoring, and security updates

- **Benefits**:
  - **Reliability**: Uptime SLAs from both Vercel and Supabase
  - **Scalability**: Serverless endpoints and managed Postgres scale on demand
  - **Cost-effectiveness**: Pay-as-you-go pricing with free tiers for prototypes

## 6. Infrastructure Components

- **Load Balancer**: Vercel’s global edge network handles routing and scaling automatically
- **CDN**: Vercel CDN caches all static assets (JS, CSS, images) at edge locations
- **Caching & Revalidation**:
  - ISR (Incremental Static Regeneration) for read-heavy pages in Display Portal
  - `revalidatePath()` calls after data mutations to update cached pages on demand
- **Realtime Layer**: Supabase Realtime subscriptions push database changes to clients instantly
- **Docker (local dev)**: Docker Compose defines Postgres emulation and local environment consistency

All components work together so users get fast page loads, instant updates, and minimal downtime.

## 7. Security Measures

- **Authentication & Authorization**:
  - Supabase Auth with JWT tokens
  - Next.js Middleware enforces route protection for `(admin)` paths
  - Custom `role` field or custom claims define Admin vs. Viewer
- **Row-Level Security**:
  - Policies in Supabase ensure viewers can only SELECT
  - Only users with `role = 'admin'` can INSERT, UPDATE, DELETE
- **Data Encryption**:
  - TLS for all requests between client, Vercel, and Supabase
  - Encrypted Postgres storage managed by Supabase
- **Environment Variables**:
  - All secrets (Supabase URL, anon key, service role key) stored in Vercel and local `.env`
- **Network Security**:
  - No direct database exposure—only access via Supabase API

## 8. Monitoring and Maintenance

- **Monitoring Tools**:
  - Vercel Analytics and logs for frontend and API performance
  - Supabase dashboard for database metrics (CPU, connections, query times)
  - Optional: Sentry or Datadog for error tracking and alerts
- **Maintenance Practices**:
  - Automated database migrations via CI (GitHub Actions) on push to `main`
  - Scheduled backups and point-in-time recovery in Supabase
  - Regular dependency updates and security audits
  - Periodic load testing for capacity planning

## 9. Conclusion and Overall Backend Summary

This backend structure combines Next.js serverless functions and Supabase’s managed Postgres to deliver a real-time, secure, and maintainable foundation for the Company Dashboard System. Key benefits:

- Dual interfaces (Display Portal and Admin Dashboard) served from one codebase
- Real-time updates via Supabase Realtime with 60-second fallback pull
- Strong security through Supabase Auth, Next.js Middleware, and RLS policies
- Fast performance powered by server-side rendering, ISR, and global CDNs
- Easy scaling and maintenance with managed services (Vercel & Supabase)

With this setup, developers and non-technical stakeholders alike can clearly see how each component contributes to a robust, user-friendly, and future-proof backend.