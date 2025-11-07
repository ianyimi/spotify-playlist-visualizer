## Authentication Quick Reference

**TL;DR:** Custom Better Auth adapter for database control + component client plugins for Convex auth integration = Best of both worlds

### The Hybrid Architecture

```
Custom Adapter (Backend)           Component Plugins (Client)
        ↓                                    ↓
Auth tables in main schema         convexClient() + ConvexBetterAuthProvider
Direct database access                       ↓
Full control                        ctx.auth.getUserIdentity() works
Better Auth plugins work           Automatic token management
```

### Critical Files (Don't Remove!)

#### Backend (Convex)
- `~/convex/http.ts` - HTTP routes for auth
- `~/convex/auth/index.ts` - Better Auth config (uses custom adapter)
- `~/convex/auth/adapter/index.ts` - Custom adapter (action context → db operations)
- `~/convex/auth/db.ts` - Database operations layer (queries/mutations)
- `~/convex/auth/sessions.ts` - Session queries for server-side auth

#### Client (Next.js + React)
- `~/app/api/auth/[...all]/route.ts` - **CRITICAL:** Provides `/api/auth/convex/token` endpoint
- `~/auth/client.tsx` - **MUST include `convexClient()` plugin**
- `~/components/Providers/convex.tsx` - **MUST use `ConvexBetterAuthProvider`**
- `~/auth/server.ts` - Server-side auth utilities

### Required Packages

```json
{
  "better-auth": "^1.3.2",
  "@convex-dev/better-auth": "latest"  // Still needed!
}
```

### How to Use Auth

#### Client-Side (React)
```typescript
import { useSession } from "~/auth/client";

const session = useSession();
if (session.data?.user) {
  console.log(session.data.user.name);
}
```

#### Server-Side (Next.js)
```typescript
import { getCurrentUser } from "~/auth/server";

const user = await getCurrentUser();
if (user) {
  console.log(user.name);
}
```

#### Convex Functions
```typescript
export const myQuery = query({
  handler: async (ctx) => {
    // Works because of convexClient() plugin!
    const identity = await ctx.auth.getUserIdentity();

    // Also works - direct database access!
    const user = await ctx.db.query("user")
      .withIndex("by_email", q => q.eq("email", identity.email))
      .first();
  }
});
```

### Environment Variables

```bash
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3001"  # NOT Convex URL!
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
BETTER_AUTH_SECRET="your-secret"
SPOTIFY_CLIENT_ID="your-id"
SPOTIFY_CLIENT_SECRET="your-secret"
```

### Common Issues & Solutions

#### Issue: `ctx.auth.getUserIdentity()` returns null
**Solution:** Make sure:
- `convexClient()` plugin is in `~/auth/client.tsx`
- `ConvexBetterAuthProvider` is used in `~/components/Providers/convex.tsx`
- `/api/auth/[...all]/route.ts` uses `nextJsHandler()`

#### Issue: 404 on `/api/auth/convex/token`
**Solution:** Don't panic! This endpoint is provided automatically by `nextJsHandler()`. Check:
- `~/app/api/auth/[...all]/route.ts` exists and exports `{ GET, POST } = nextJsHandler()`
- Next.js dev server is running
- You haven't accidentally removed the file

#### Issue: Can't access auth tables in Convex
**Solution:** Auth tables are in main schema:
- Check `~/convex/schema.ts` for table definitions
- Tables: `user`, `account`, `session`, `verification`, `jwks`
- All have required indexes (check `by_token`, `by_email`, etc.)

### What NOT to Do

❌ Remove `@convex-dev/better-auth` package
❌ Remove `convexClient()` plugin
❌ Use regular `ConvexProvider` instead of `ConvexBetterAuthProvider`
❌ Remove `/api/auth/[...all]/route.ts`
❌ Set `NEXT_PUBLIC_BETTER_AUTH_URL` to Convex URL

### What TO Do

✅ Keep both `better-auth` AND `@convex-dev/better-auth`
✅ Use custom adapter in `~/convex/auth/adapter/index.ts`
✅ Use component client plugins
✅ Keep Next.js API route for token generation
✅ Read full docs at `/agent-os/standards/backend/authentication.md`
