# Convex Best Practices

## Context

Official best practices for Convex development. Follow these guidelines when working with queries, mutations, actions, and schema design.

## 1. Await All Promises

**Core Principle:** Every promise must be awaited to prevent unexpected behavior and ensure proper error handling.

**Why It Matters:**
If you don't await all your promises (e.g. `await ctx.scheduler.runAfter`, `await ctx.db.patch`), you may run into unexpected behavior (e.g. failing to schedule a function) or miss handling errors.

**Implementation:**
Enable the `no-floating-promises` ESLint rule with TypeScript to catch unwaited promises automatically.

```typescript
// ❌ Avoid - promise not awaited
ctx.db.patch(id, { updated: true });

// ✅ Correct - promise awaited
await ctx.db.patch(id, { updated: true });
```

---

## 2. Avoid `.filter` on Database Queries

**Core Principle:** Replace `.filter` with indexed queries or code-based filtering for better performance and readability.

**Why It Matters:**
Filtering in code instead of using the `.filter` syntax has the same performance, and is generally easier code to write.

**Better Approaches:**
- Use `.withIndex` or `.withSearchIndex` conditions (most efficient)
- Filter results in TypeScript code (flexible and readable)

```typescript
// ❌ Avoid
const tomsMessages = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), "Tom"))
  .collect();

// ✅ Prefer indexed approach
const tomsMessages = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", "Tom"))
  .collect();

// ✅ Or filter in code
const allMessages = await ctx.db.query("messages").collect();
const tomsMessages = allMessages.filter(m => m.author === "Tom");
```

**Exception:** Using `.filter` with paginated queries (`.paginate`) offers advantages since pagination respects filter results.

---

## 3. Only Use `.collect` with Small Result Sets

**Core Principle:** Limit `.collect` usage to cases with guaranteed small datasets; use indexes or pagination for larger result sets.

**Why It Matters:**
All results returned from `.collect` count towards database bandwidth (even ones filtered out by `.filter`). It also means that if any document in the result changes, the query will re-run or the mutation will hit a conflict.

**When Results May Be Large (1000+):**
- Add index conditions before calling `.collect`
- Implement pagination with `.paginate()`
- Denormalize data for counts
- Use `.take()` for limited results

```typescript
// ❌ Avoid - unbounded collect
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .collect();

// ✅ Use pagination
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .order("desc")
  .paginate(paginationOptions);

// ✅ Denormalize counts
const numberOfWatchedMovies = watchedMoviesCount.length === 100
  ? "99+"
  : watchedMoviesCount.length.toString();

// ✅ Use take() for limited results
const recentMessages = await ctx.db
  .query("messages")
  .order("desc")
  .take(50);
```

---

## 4. Check for Redundant Indexes

**Core Principle:** Remove duplicate index definitions that share prefix relationships.

**Why It Matters:**
Indexes like `by_foo` and `by_foo_and_bar` are usually redundant (you only need `by_foo_and_bar`). Reducing the number of indexes saves on database storage and reduces the overhead of writing to the table.

```typescript
// ❌ Redundant indexes
defineSchema({
  teams: defineTable({
    name: v.string(),
    owner: v.id("users"),
  })
    .index("by_owner", ["owner"])
    .index("by_owner_and_name", ["owner", "name"]), // This covers by_owner
});

// ✅ Keep only the composite index
defineSchema({
  teams: defineTable({
    name: v.string(),
    owner: v.id("users"),
  })
    .index("by_owner_and_name", ["owner", "name"]),
});
```

**Exception:** Retain separate indexes when sort order differs. An index on `foo` supports sorting by `_creationTime`, while `foo_bar` sorts by `bar` first—different orderings require both.

---

## 5. Use Argument Validators for Public Functions

**Core Principle:** All client-facing functions must validate inputs strictly.

**Why It Matters:**
Public functions can be called by anyone, including potentially malicious attackers trying to break your app.

**Validation Checklist:**
- Validate argument structure and types
- Validate database IDs to specific tables
- Restrict updateable fields explicitly
- Include return value validators when relevant

```typescript
// ❌ Loose validation
export const updateMessage = mutation({
  args: {
    id: v.string(),
    update: v.any(),
  },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id as Id<"messages">, update);
  },
});

// ✅ Strict validation
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    update: v.object({
      body: v.optional(v.string()),
      author: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});
```

---

## 6. Implement Access Control in All Public Functions

**Core Principle:** Every public function requires explicit authorization checks.

**Why It Matters:**
Public functions can be called by anyone, including potentially malicious attackers trying to break your app.

**Authorization Requirements:**
- Use `ctx.auth.getUserIdentity()` for user verification
- Never rely on spoofable arguments (email, username)
- Create granular functions for different permission levels
- Consider Row Level Security patterns for systematic checks

```typescript
// ❌ No authorization
export const updateTeam = mutation({
  args: { id: v.id("teams"), update: v.object({...}) },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

// ✅ Proper authorization
export const updateTeam = mutation({
  args: { id: v.id("teams"), update: v.object({ name: v.string() }) },
  handler: async (ctx, { id, update }) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) throw new Error("Unauthorized");

    const team = await ctx.db.get(id);
    if (!team) throw new Error("Team not found");

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", id).eq("userId", user.subject)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(id, update);
  },
});
```

---

## 7. Schedule and Call Only Internal Functions

**Core Principle:** Restrict scheduled tasks and internal execution paths to `internal.*` functions.

**Why It Matters:**
Public functions can be called by anyone. Functions that are only called within Convex can be marked as internal, and relax these checks.

**Application Rules:**
- Use `internal.foo.bar` with `ctx.scheduler`
- Use `internal.foo.bar` with `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction`
- Mark scheduled cron jobs to call `internal` functions
- Never expose `api.foo.bar` in Convex backend code

```typescript
// ❌ Incorrect - exposes public function
export default crons.daily(
  "reminder",
  { hourUTC: 8, minuteUTC: 0 },
  api.messages.sendMessage,
  { message: "Daily reminder" }
);

// ✅ Correct - uses internal function
export default crons.daily(
  "reminder",
  { hourUTC: 8, minuteUTC: 0 },
  internal.messages.sendMessage,
  { message: "Daily reminder" }
);

// ❌ Incorrect - scheduling public function
await ctx.scheduler.runAfter(0, api.notifications.send, { userId });

// ✅ Correct - scheduling internal function
await ctx.scheduler.runAfter(0, internal.notifications.send, { userId });
```

---

## 8. Use Helper Functions for Shared Code

**Core Principle:** Organize most logic in plain TypeScript helper functions; keep wrapped functions minimal.

**Why It Matters:**
Most logic should be written as plain TypeScript functions, with the `query`, `mutation`, and `action` wrapper functions being a thin wrapper around one or more helper function.

**Recommended Structure:**
- Place helpers in `convex/model/` or `convex/lib/` directory
- Keep wrapper functions brief and focused
- Return consistent types from helpers
- Share helpers between public and internal functions

```typescript
// convex/lib/users.ts - Plain TypeScript helpers
import { QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx) {
  const userIdentity = await ctx.auth.getUserIdentity();
  if (userIdentity === null) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", userIdentity.tokenIdentifier)
    )
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getUserSettings(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("userSettings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

// convex/users.ts - Thin wrappers
import { query } from "./_generated/server";
import * as Users from "./lib/users";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await Users.getCurrentUser(ctx);
  },
});

export const getCurrentUserWithSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx);
    const settings = await Users.getUserSettings(ctx, user._id);
    return { user, settings };
  },
});
```

---

## 9. Use `runAction` Only for Different Runtimes

**Core Principle:** Avoid `runAction` for internal calls; use plain TypeScript functions instead.

**Why It Matters:**
Calling `runAction` has more overhead than calling a plain TypeScript function. It counts as an extra function call with its own memory and CPU usage, while the parent action is doing nothing except waiting for the result.

**When to Use `runAction`:**
- Calling code that requires Node.js from non-Node.js runtime
- Leveraging Node.js-specific libraries

```typescript
// ❌ Unnecessary runAction overhead
export const scrapeWebsite = action({
  args: { siteMapUrl: v.string() },
  handler: async (ctx, { siteMapUrl }) => {
    const pages = /* parse sitemap */

    // Each page scrape spawns a new action unnecessarily
    await Promise.all(
      pages.map((page) =>
        ctx.runAction(internal.scrape.scrapeSinglePage, { url: page })
      )
    );
  },
});

// ✅ Use plain TypeScript helper
export async function scrapeSinglePage(
  ctx: ActionCtx,
  { url }: { url: string },
) {
  const response = await fetch(url);
  const text = await response.text();
  await ctx.runMutation(internal.scrape.addPage, { url, text });
}

export const scrapeWebsite = action({
  args: { siteMapUrl: v.string() },
  handler: async (ctx, { siteMapUrl }) => {
    const pages = /* parse sitemap */

    // Direct function calls - much more efficient
    await Promise.all(
      pages.map((page) => scrapeSinglePage(ctx, { url: page }))
    );
  },
});
```

---

## 10. Avoid Sequential `ctx.runMutation`/`ctx.runQuery` from Actions

**Core Principle:** Combine sequential calls into single transaction-aware operations.

**Why It Matters:**
Each `ctx.runMutation` or `ctx.runQuery` runs in its own transaction, which means if they're called separately, they may not be consistent with each other.

```typescript
// ❌ Inconsistent data - separate transactions
const team = await ctx.runQuery(internal.teams.getTeam, { teamId });
const teamOwner = await ctx.runQuery(internal.teams.getTeamOwner, { teamId });
// team.owner might not equal teamOwner._id if data changed between queries!

// ✅ Combine into single query
const teamAndOwner = await ctx.runQuery(
  internal.teams.getTeamAndOwner,
  { teamId }
);
// Guaranteed consistency within same transaction

// ❌ Multiple mutations in loop
for (const member of teamMembers) {
  await ctx.runMutation(internal.teams.insertUser, member);
}

// ✅ Single mutation for batch operation
await ctx.runMutation(internal.teams.insertUsers, { members: teamMembers });
```

**Exceptions:**
- Intentional multi-transaction processing (migrations, aggregations)
- Actions performing external side effects between operations

---

## 11. Use `ctx.runQuery`/`ctx.runMutation` Sparingly in Queries/Mutations

**Core Principle:** Prefer plain TypeScript helper functions over internal function calls in queries and mutations.

**Why It Matters:**
While these queries and mutations run in the same transaction, they have extra overhead compared to plain TypeScript functions.

**When Plain Functions Suffice:**
- Shared query logic
- Reusable validation
- Common data transformations

**When to Use Internal Calls:**
- Component integration (required)
- Intentional partial rollback on errors

```typescript
// ❌ Unnecessary overhead
export const createPost = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const postId = await ctx.db.insert("posts", { ...args, authorId: user._id });
    return postId;
  },
});

// ✅ Use helper function instead
import { getCurrentUser } from "./lib/users";

export const createPost = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const postId = await ctx.db.insert("posts", { ...args, authorId: user._id });
    return postId;
  },
});

// ✅ Exception: Partial rollback on error
export const trySendMessage = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    try {
      await ctx.runMutation(internal.messages.sendMessage, { body, author });
      return { success: true };
    } catch (e) {
      // Rollback sendMessage writes while recording failure
      await ctx.db.insert("failures", {
        operation: "sendMessage",
        error: String(e),
        timestamp: Date.now(),
      });
      return { success: false, error: String(e) };
    }
  },
});
```

---

## Implementation Checklist

Use this checklist when reviewing or writing Convex code:

- [ ] Enable `no-floating-promises` ESLint rule
- [ ] Audit and replace `.filter` calls with indexes or code-based filtering
- [ ] Review `.collect` usage for large datasets (use pagination or `.take()`)
- [ ] Consolidate redundant indexes in schema
- [ ] Add strict validators to all public functions
- [ ] Implement access checks with `ctx.auth` in all public functions
- [ ] Convert public scheduled tasks to `internal` functions
- [ ] Organize shared logic into helper functions in `convex/lib/` or `convex/model/`
- [ ] Replace unnecessary `runAction` calls with plain TypeScript functions
- [ ] Consolidate sequential mutations/queries from actions
- [ ] Remove excess `ctx.runQuery`/`ctx.runMutation` calls from queries/mutations

---

## Additional Resources

- [Official Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex Schema Design](https://docs.convex.dev/database/schemas)
- [Authentication & Authorization](https://docs.convex.dev/auth)
- [Query Performance](https://docs.convex.dev/database/reading-data)
