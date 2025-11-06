## Tech stack

This is a minimal Next.js SaaS starter template. The tech stack is intentionally focused and opinionated.

### Framework & Runtime
- **Application Framework:** Next.js 16 (App Router with Turbopack)
- **Language/Runtime:** TypeScript 5.8 on Node.js
- **Package Manager:** pnpm 10.11.0

### Frontend
- **JavaScript Framework:** React 19
- **CSS Framework:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)

### Database & Backend
- **Database & Backend:** Convex (real-time database with edge functions)
- **Data Fetching:** Convex React hooks (useQuery, useMutation, useAction)
- **Real-Time:** Automatic subscriptions via Convex
- **Server-Side Fetching:** preloadQuery, fetchQuery, fetchMutation
- **Validation:** Zod 4.0

### Testing & Quality
- **E2E Testing:** Playwright (for end-to-end browser testing)
- **Load Testing:** k6 (for performance and load testing)
- **Linting/Formatting:** ESLint 9, Prettier 3.5.3

### Deployment & Infrastructure
- **Hosting:** Vercel-ready (or any Node.js host)
- **Database Hosting:** Convex Cloud (managed)
- **Future:** SST for self-hosted AWS deployment (planned)
- **CI/CD:** GitHub Actions (automated workflows)

### Third-Party Services
- **Authentication:** Better Auth 1.3.2 with @convex-dev/better-auth (Google OAuth + email/password)
- **Email:** Not configured (add per-project)
- **Monitoring:** Not configured (add per-project)

### Notes
- See `/agent-os/product/tech-stack.md` for complete dependency details
- No CMS - minimal template with real-time database
- No tRPC - using direct Convex queries and mutations
