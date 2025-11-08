## Authentication Architecture with Custom Better Auth Adapter

This project uses a **custom Better Auth adapter** for Convex **with full Convex auth integration**. This provides more control, direct database access, better plugin compatibility, AND works with Convex's `ctx.auth.getUserIdentity()`.

### Why Custom Adapter?

**Problems with Component Adapter:**
- Component isolation prevents direct access to auth tables from main application
- Limited ability to use Better Auth plugins that modify auth collections
- Tables exist in separate namespace, requiring component API calls
- Less flexibility for custom authentication flows

**Benefits of Custom Adapter:**
- Full control over auth implementation
- Direct access to auth tables in main database schema
- Better compatibility with Better Auth plugins (e.g., admin plugin, organization plugin)
- Ability to customize and extend authentication flows
- All tables visible in Convex dashboard for debugging
- **CRITICAL:** Still integrates with Convex auth via `@convex-dev/better-auth` client plugins
- **CRITICAL:** `ctx.auth.getUserIdentity()` works in Convex functions

### Architecture Overview

The custom adapter uses a **two-layer architecture** to bridge between HTTP actions and database operations:

```
HTTP Request → httpAction (action context)
             ↓
         Better Auth Handler
             ↓
         Custom Adapter (~/convex/auth/adapter/index.ts)
             ↓
         Database Operations Layer (~/convex/auth/db.ts)
             ↓ ctx.runQuery/runMutation
         Queries & Mutations (query/mutation context)
             ↓
         Database Access (ctx.db)
```

**Why Two Layers?**
- HTTP actions provide `GenericActionCtx` with `runQuery()` and `runMutation()` methods
- They do NOT provide direct `ctx.db` access
- Queries and mutations have proper database context with `ctx.db`
- The adapter calls internal queries/mutations to perform database operations

### File Structure

```
~/convex/
├── http.ts                           # HTTP route registration (Convex backend)
├── auth/
│   ├── index.ts                      # Better Auth configuration (Convex backend)
│   ├── db.ts                         # Database operations layer (queries/mutations)
│   ├── sessions.ts                   # Session queries for server-side auth
│   ├── adapter/
│   │   ├── index.ts                  # Custom adapter implementation (action context)
│   │   └── utils.ts                  # Database utilities (ported from component)
│   └── plugins/
│       └── index.ts                  # Better Auth plugins configuration
└── schema.ts                         # Auth tables + indexes

~/app/api/auth/
└── [...all]/route.ts                 # Next.js API route for Better Auth (uses component handler)

~/auth/
├── client.tsx                        # Client-side auth setup (with convexClient plugin)
├── server.ts                         # Server-side auth utilities (getCurrentUser, getSession)
└── utils.ts                          # Auth utility functions (getSessionToken)

~/components/Providers/
└── convex.tsx                        # ConvexBetterAuthProvider integration
```

### Key Files Explained

#### `~/convex/http.ts`
Registers HTTP routes for Better Auth endpoints:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

const http = httpRouter();

const authRequestHandler = httpAction(async (ctx, request) => {
  // @ts-expect-error - Generic action context type mismatch, safe at runtime
  const auth = createAuth(ctx);
  return await auth.handler(request);
});

http.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: authRequestHandler,
});

http.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: authRequestHandler,
});

export default http;
```

**Important:** The HTTP action provides `GenericActionCtx`, not direct database access.

#### `~/convex/auth/index.ts`
Creates Better Auth instance with custom adapter:

```typescript
import type { GenericActionCtx } from "convex/server";
import { betterAuth } from "better-auth";
import { convexAdapter } from "./adapter/index";
import schema from "../schema";

export const createAuth = (
  ctx: GenericActionCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    socialProviders: {
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID!,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectURI: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/callback/spotify`
      },
    },
    advanced: {
      generateId: false,  // Convex generates IDs
    },
    database: convexAdapter(ctx, schema),
    plugins: betterAuthPlugins,
    // ... other Better Auth config
  });
};
```

**Key Points:**
- Only accepts `GenericActionCtx<DataModel>` (from HTTP actions)
- Passes action context to custom adapter
- Uses `generateId: false` because Convex generates document IDs

#### `~/convex/auth/db.ts`
Database operations layer with proper query/mutation context:

```typescript
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { listOne, paginate, checkUniqueFields } from "./adapter/utils";

// Create operation - has mutation context with ctx.db access
export const dbCreate = mutation({
  args: {
    model: v.string(),
    data: v.any(),
    select: v.optional(v.array(v.string())),
    betterAuthSchema: v.string(),
  },
  handler: async (ctx, { model, data, select, betterAuthSchema }) => {
    const authSchema = JSON.parse(betterAuthSchema);

    // Check unique fields before insert
    await checkUniqueFields(ctx, schema, authSchema, model, data);

    const id = await ctx.db.insert(model as any, data);
    const doc = await ctx.db.get(id);

    return selectFields(doc, select);
  },
});

// Find one operation - has query context with ctx.db access
export const dbFindOne = query({
  args: {
    model: v.string(),
    where: v.array(v.any()),
    select: v.optional(v.array(v.string())),
    betterAuthSchema: v.string(),
  },
  handler: async (ctx, { model, where, select, betterAuthSchema }) => {
    const authSchema = JSON.parse(betterAuthSchema);
    // @ts-expect-error - Convex query context type incompatible with generic parameter
    return await listOne(ctx, schema, authSchema, {
      model,
      where: where as WhereClause[],
      select,
    });
  },
});

// Similar for: dbFindMany, dbCount, dbUpdate, dbUpdateMany, dbDelete, dbDeleteMany
```

**Key Points:**
- Each operation is a query or mutation with proper database context
- Called by adapter via `ctx.runQuery()` / `ctx.runMutation()`
- Uses utilities from `utils.ts` for complex operations
- Validates unique fields, handles pagination, OR queries, etc.

#### `~/convex/auth/adapter/index.ts`
Custom adapter that bridges action context to database operations:

```typescript
import { createAdapterFactory } from "better-auth/adapters";
import { getAuthTables } from "better-auth/db";
import { internal } from "../../_generated/api";

export const convexAdapter = (
  ctx: GenericActionCtx<DataModel>,
  _schema: SchemaDefinition<any, any>,
  config = {}
) => {
  return createAdapterFactory({
    adapter: ({ options }) => {
      const betterAuthSchema = getAuthTables(options);
      const betterAuthSchemaJson = JSON.stringify(betterAuthSchema);

      return {
        id: "convex",

        create: async ({ model, data, select }) => {
          // @ts-expect-error - Internal API
          return await ctx.runMutation(internal.auth.db.dbCreate, {
            model,
            data,
            select,
            betterAuthSchema: betterAuthSchemaJson,
          });
        },

        findOne: async ({ model, where, select }) => {
          const parsedWhere = parseWhere(where);
          // @ts-expect-error - Internal API
          return await ctx.runQuery(internal.auth.db.dbFindOne, {
            model,
            where: parsedWhere,
            select,
            betterAuthSchema: betterAuthSchemaJson,
          });
        },

        // Similar for: findMany, count, update, updateMany, delete, deleteMany
      };
    },
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter (Action-based - Full Featured)",
      disableIdGeneration: true,
      mapKeysTransformInput: { id: "_id" },
      mapKeysTransformOutput: { _id: "id" },
      supportsDates: false,
      supportsJSON: false,
      transaction: false,
    },
  });
};
```

**Key Points:**
- Uses `internal.auth.db.*` to call database operations
- Passes serialized Better Auth schema to operations
- Transforms Date objects to timestamps (Convex doesn't support Date)
- Maps `id` ↔ `_id` for Better Auth compatibility

#### `~/convex/auth/adapter/utils.ts`
Database utilities ported from `@convex-dev/better-auth` component:

**Features (Full Parity with Component):**
- Index selection and optimization
- Unique field validation
- OR connector support
- Cursor-based pagination
- "in" operator handling
- Field selection

**Key Functions:**
- `listOne()` - Find single document with where clause
- `paginate()` - Cursor-based pagination with index optimization
- `checkUniqueFields()` - Validate unique constraints before insert/update
- `findIndex()` - Select optimal index for query
- `selectFields()` - Return only requested fields

### Internal vs API Imports

**Why `internal.*` instead of `api.*`?**

In Convex, all queries and mutations are available in TWO places:
- `api.auth.db.*` - Public API (callable from client-side)
- `internal.auth.db.*` - Internal API (only callable server-to-server)

The adapter MUST use `internal.*` because:
1. It runs in action context (server-side)
2. Convex security prevents client code from calling internal operations
3. Only `internal.*` can be used with `ctx.runQuery()` / `ctx.runMutation()` from actions

This is intentional - it prevents clients from bypassing your auth layer and directly manipulating auth tables.

### Schema Configuration

All auth tables are defined in `~/convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  TABLE_SLUG_USERS,
  TABLE_SLUG_ACCOUNTS,
  TABLE_SLUG_SESSIONS,
  TABLE_SLUG_VERIFICATIONS,
  TABLE_SLUG_JWKS,
} from "~/db/constants";

export default defineSchema({
  [TABLE_SLUG_USERS]: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    role: v.union(v.array(v.string()), v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // ... other fields
  }).index("by_email", ["email"]),

  [TABLE_SLUG_ACCOUNTS]: defineTable({
    userId: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    // ... other fields
  })
    .index("by_userId", ["userId"])
    .index("by_accountId", ["accountId"]),

  [TABLE_SLUG_SESSIONS]: defineTable({
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    // ... other fields
  }).index("by_token", ["token"]),

  [TABLE_SLUG_VERIFICATIONS]: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    // ... other fields
  })
    .index("by_identifier", ["identifier"])
    .index("by_expiresAt", ["expiresAt"]),

  [TABLE_SLUG_JWKS]: defineTable({
    publicKey: v.string(),
    privateKey: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
```

**Critical Indexes:**
- `user.email` - For user lookup by email
- `accounts.userId` - For finding accounts by user
- `accounts.accountId` - For OAuth account lookup
- `session.token` - For session validation
- `verification.identifier` - For email/phone verification
- `verification.expiresAt` - For expired verification cleanup

**Why JWKS Table?**
- Used for JWT token signing/verification
- Required for OAuth flows and OIDC support
- Stores public/private key pairs

### Type Safety

**Common TypeScript Patterns:**

1. **Generic Context Type Mismatch** (in db.ts):
```typescript
// @ts-expect-error - Convex query context type (specific DataModel) incompatible with generic GenericDataModel parameter
const result = await listOne(ctx, schema, authSchema, { ... });
```
Why: Utils expect generic context, but queries have specific typed context. Safe at runtime.

2. **Internal API Access** (in adapter):
```typescript
// @ts-expect-error - Internal API
return await ctx.runMutation(internal.auth.db.dbCreate, { ... });
```
Why: Internal API not exposed in generated types. Safe and required pattern.

3. **Generic Action Context** (in http.ts):
```typescript
// @ts-expect-error - Generic action context type mismatch, safe at runtime
const auth = createAuth(ctx);
```
Why: Generic type inference issue. Safe at runtime.

### Better Auth Plugins

The custom adapter enables full Better Auth plugin support. To add plugins:

1. Install the plugin package
2. Configure in `~/convex/auth/plugins/index.ts`
3. Add required fields/tables to `~/convex/schema.ts`
4. Add indexes if the plugin requires unique constraints

Example plugins that work:
- Admin plugin (user management)
- Organization plugin (multi-tenant)
- Two-factor authentication
- Anonymous users
- Magic link authentication

### Testing Auth

**Local Development:**
1. Run `npx convex dev` (starts Convex backend)
2. Run `pnpm dev` (starts Next.js)
3. Navigate to `/api/auth/*` routes
4. Check Convex dashboard for table updates

**Debugging:**
- View auth tables directly in Convex dashboard
- Check HTTP action logs for Better Auth errors
- Use `console.log` in db.ts operations for debugging
- Verify indexes exist for all unique fields

### Migration from Component

If migrating from `@convex-dev/better-auth` component:

1. **Remove component dependency**: Uninstall `@convex-dev/better-auth`
2. **Copy adapter code**: Implement custom adapter as documented above
3. **Update schema**: Move auth tables from component to main schema
4. **Add indexes**: Ensure all required indexes are defined
5. **Update imports**: Change from component API to custom adapter
6. **Test thoroughly**: Verify all auth flows work (login, logout, OAuth, etc.)

### Maintenance Notes

**When modifying auth:**
- Keep `utils.ts` in sync with upstream component changes
- Test unique field validation when adding new fields
- Verify indexes exist for any new unique fields
- Update Better Auth schema serialization if schema changes

**Feature Parity:**
The custom adapter has **full feature parity** with the `@convex-dev/better-auth` component:
- ✅ Index selection and optimization
- ✅ Unique field validation
- ✅ OR connector support
- ✅ Cursor-based pagination
- ✅ "in" operator handling
- ✅ Field selection
- ✅ All CRUD operations
- ✅ Transaction stubs (Convex doesn't support traditional transactions)
- ✅ Convex auth integration (`ctx.auth.getUserIdentity()` works)

## Convex Auth Integration

### Critical Understanding

**Even though we use a custom adapter, we STILL use the `@convex-dev/better-auth` client plugins!**

This is the key to making everything work:
- Custom adapter = Database operations layer (where auth data is stored)
- Component client plugins = Convex auth token generation (makes `ctx.auth` work)

### Complete Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT-SIDE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  authClient (~/auth/client.tsx)                             │
│  ├─ convexClient() plugin ──────────────────┐               │
│  └─ apiKeyClient() plugin                   │               │
│                                              │               │
│  ConvexBetterAuthProvider                    │               │
│  (~/components/Providers/convex.tsx)         │               │
│                                              │               │
└──────────────────────────────────────────────┼───────────────┘
                                               │
                    ┌──────────────────────────┘
                    │ Requests /api/auth/convex/token
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/auth/[...all]/route.ts                                │
│  └─ nextJsHandler() from @convex-dev/better-auth/nextjs    │
│     ├─ Handles auth requests (login, logout, etc)          │
│     └─ Provides /api/auth/convex/token endpoint            │
│                                                              │
│  /api/auth/convex/token (implicit, provided by handler)    │
│  └─ Returns Convex auth token for authenticated users      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ Token passed to Convex client
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    CONVEX BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Convex Functions can use:                                  │
│  ├─ ctx.auth.getUserIdentity() ✅                           │
│  │  (Works because of token from convexClient plugin)       │
│  │                                                           │
│  └─ Direct database queries on auth tables ✅               │
│     (Works because of custom adapter)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Required Client-Side Setup

#### `~/auth/client.tsx`
```typescript
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    convexClient(),  // CRITICAL: Enables ctx.auth in Convex functions
    apiKeyClient(),
  ]
});

export const { signIn, signOut, useSession } = authClient;
```

**Key Points:**
- `convexClient()` plugin requests `/api/auth/convex/token` endpoint
- This endpoint returns a Convex auth token
- Token is passed to all Convex queries/mutations
- Enables `ctx.auth.getUserIdentity()` to work

#### `~/components/Providers/convex.tsx`
```typescript
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "~/auth/client";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  expectAuth: true  // Optional: expects auth token
});

export default function ConvexClientProvider({ children }) {
  return (
    <ConvexBetterAuthProvider authClient={authClient} client={convex}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
```

**Key Points:**
- Uses `ConvexBetterAuthProvider` (NOT regular `ConvexProvider`)
- Automatically fetches and refreshes Convex tokens
- Syncs Better Auth session changes with Convex client

### Required Next.js API Route

#### `~/app/api/auth/[...all]/route.ts`
```typescript
import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

export const { GET, POST } = nextJsHandler();
```

**What this does:**
1. Creates a Better Auth instance in Next.js
2. Handles all auth requests (`/api/auth/*`)
3. **Provides `/api/auth/convex/token` endpoint** (this is the critical part!)
4. Validates Better Auth sessions and generates Convex tokens

**The `/api/auth/convex/token` endpoint:**
- Called by `convexClient()` plugin on client
- Validates Better Auth session from cookies
- Returns a Convex-compatible auth token
- This token makes `ctx.auth.getUserIdentity()` work

### Server-Side Auth Access

#### `~/auth/server.ts`
```typescript
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { getSessionToken } from "./utils";

// Get current user in Next.js server components/actions
export const getCurrentUser = async () => {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const session = await fetchQuery(api.auth.sessions.getSessionWithUser, {
    sessionToken,
  });

  return session?.user ?? null;
};

// Get full session
export const getSession = async () => {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  return await fetchQuery(api.auth.sessions.getSessionWithUser, {
    sessionToken,
  });
};
```

#### `~/auth/utils.ts`
```typescript
import { cookies } from "next/headers";

export const getSessionToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("better-auth.session_token")?.value;
};
```

#### `~/convex/auth/sessions.ts`
```typescript
import { v } from "convex/values";
import { query } from "../_generated/server";

export const getSessionWithUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query(TABLE_SLUG_SESSIONS)
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      session: {
        id: session._id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        token: session.token,
      },
      user: {
        id: user.userId ?? user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };
  },
});
```

### Usage Examples

#### Client-Side (React Components)
```typescript
import { useSession } from "~/auth/client";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

export default function MyComponent() {
  const session = useSession();

  // Session from Better Auth
  if (session.data?.user) {
    return <div>Hello {session.data.user.name}</div>;
  }

  return <div>Not logged in</div>;
}
```

#### Server-Side (Next.js Server Components)
```typescript
import { getCurrentUser, getSession } from "~/auth/server";

export default async function ServerComponent() {
  const user = await getCurrentUser();

  if (user) {
    return <div>Hello {user.name}</div>;
  }

  return <div>Not logged in</div>;
}

// Or get full session
export async function myServerAction() {
  const session = await getSession();
  if (session) {
    console.log("User:", session.user);
    console.log("Session expires:", new Date(session.session.expiresAt));
  }
}
```

#### Convex Functions
```typescript
import { query } from "./_generated/server";

export const myProtectedQuery = query({
  args: {},
  handler: async (ctx) => {
    // Option 1: Use ctx.auth (works because of convexClient plugin!)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    console.log("User email:", identity.email);
    console.log("User name:", identity.name);

    // Option 2: Query auth tables directly (works because of custom adapter!)
    const users = await ctx.db.query("user")
      .withIndex("by_email", q => q.eq("email", identity.email))
      .collect();

    return { identity, users };
  }
});
```

### Why This Architecture Works

**The Best of Both Worlds:**

1. **Custom Adapter** = Control over database
   - Auth tables in main schema (not component)
   - Direct access to auth data
   - Full plugin compatibility
   - Visible in Convex dashboard

2. **Component Client Plugins** = Convex auth integration
   - `ctx.auth.getUserIdentity()` works
   - Automatic token management
   - Session syncing with Convex client

**You get:**
- ✅ Full control over auth database
- ✅ Direct access to auth tables
- ✅ Better Auth plugin support
- ✅ `ctx.auth.getUserIdentity()` works
- ✅ Server-side session access
- ✅ Client-side session access

### Common Mistakes to Avoid

❌ **Don't remove `convexClient()` plugin** - Without it, `ctx.auth` won't work

❌ **Don't remove `ConvexBetterAuthProvider`** - Use this, not regular `ConvexProvider`

❌ **Don't remove Next.js API route** - The `/api/auth/convex/token` endpoint is required

❌ **Don't set `NEXT_PUBLIC_BETTER_AUTH_URL` to Convex URL** - Keep it as `http://localhost:3001`

✅ **Keep `@convex-dev/better-auth` package** - Still needed for client plugins and handlers

✅ **Use custom adapter in Convex backend** - For database operations

✅ **Use component plugins on client** - For Convex auth integration
