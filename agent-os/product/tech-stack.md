# Tech Stack

This document reflects the actual tech stack used in this Next.js SaaS starter template. This is a minimal hello world SaaS template focusing on core functionality.

## Framework & Runtime

- **Application Framework:** Next.js 16 (App Router with Turbopack)
- **Language/Runtime:** TypeScript 5.8 on Node.js
- **Package Manager:** pnpm 10.11.0

## Frontend

- **JavaScript Framework:** React 19
- **CSS Framework:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Styling Utilities:** clsx, tailwind-merge, class-variance-authority
- **Animations:** tw-animate-css

## Backend & Database

- **Database & Backend:** Convex (real-time database with edge functions)
- **Data Fetching:** Convex React hooks (useQuery, useMutation, useAction)
- **Real-Time:** Automatic subscriptions via Convex
- **Server-Side Data Fetching:** preloadQuery, fetchQuery, fetchMutation
- **Authentication:** Better Auth 1.3.2 with @convex-dev/better-auth integration
- **Validation:** Zod 4.0 (for input validation)

## Authentication

- **Auth Library:** Better Auth 1.3.2
- **Integration:** @convex-dev/better-auth for Convex integration
- **Auth Providers:**
  - Google OAuth (configured)
  - Email/Password (configured)
- **Features:** Role-based access control, session management, account linking
- **Storage:** Sessions and users stored in Convex tables

## Development & Quality

- **Linting:** ESLint 9 with Next.js config
- **Formatting:** Prettier 3.5.3 with Tailwind plugin
- **Type Checking:** TypeScript strict mode
- **Type Generation:** Convex auto-generates types from schema
- **Compiler Optimizations:** React Compiler (experimental)
- **Environment Validation:** @t3-oss/env-nextjs

## Testing

- **E2E Testing:** Playwright (for end-to-end browser testing)
- **Load Testing:** k6 (for performance and load testing)
- **Unit/Integration Testing:** To be configured per-project

## Image Processing

- **Image Optimization:** Sharp 0.34.1

## Deployment & Infrastructure

- **Hosting:** Vercel-ready (or any Node.js host for Next.js)
- **Database Hosting:** Convex Cloud (managed)
- **Future Deployment:** SST for self-hosted AWS deployment (planned)
- **CI/CD:** GitHub Actions (automated workflows for testing and deployment)
- **Environment:** Node.js runtime for Next.js, Edge runtime for Convex

## Key Dependencies Summary

### Core Framework
- next@16.0.1
- react@19.1.0
- typescript@5.8.2

### Database & Backend
- convex@1.25.0+
- @convex-dev/better-auth@latest

### Authentication
- better-auth@1.3.2
- @convex-dev/better-auth@latest

### UI & Styling
- tailwindcss@4.0.15
- lucide-react@0.525.0
- @radix-ui/react-dialog@1.1.15
- @radix-ui/react-slot@1.2.3

### Utilities
- zod@4.0.5
- clsx@2.1.1

## Notes

- **No CMS**: Minimal template with no content management system
- **No tRPC**: Removed in favor of direct Convex queries and mutations
- **Real-Time by Default**: Convex provides automatic reactivity - UI updates when data changes
- **Type Safety**: Full end-to-end type safety from Convex schema to UI
- **Modern React**: Uses React 19 with experimental compiler
- **Performance**: Turbopack for fast dev builds, Convex edge functions for low latency
- **Monorepo-Ready**: Uses pnpm with workspace support
- **Testing Ready**: Playwright for E2E tests, k6 for load testing
- **Optimistic Updates**: Built-in with Convex mutations
- **Self-Hosted Deployment**: SST integration planned for one-command AWS deployment
