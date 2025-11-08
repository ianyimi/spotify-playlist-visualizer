## Database Query Best Practices with Convex

Convex uses a different query model than traditional SQL databases. Follow these patterns:

### Query Security
- **No SQL Injection Risk**: Convex's query API is type-safe and doesn't use string concatenation
- **Input Validation**: Always validate function arguments with proper validators in the `args` object using `v.*` helpers
- **Authentication Checks**: Use `ctx.auth.getUserIdentity()` to verify user identity before data access
- **Authorization**: Implement proper access control checks in all public functions

### Query Performance

#### Indexing Strategy
- **Use Indexes**: Define indexes in your schema for fields used in filters and ordering
- **Avoid Redundant Indexes**: Remove duplicate indexes that share prefix relationships (e.g., if you have `by_owner_and_name`, you don't need `by_owner`)
- **Index Ordering**: Consider sort order when designing indexes

#### Filtering Best Practices
- **Prefer `.withIndex`**: Use `.withIndex()` for filtering instead of `.filter()` when possible
- **Code-Based Filtering**: Filter results in TypeScript code after fetching for better readability
- **Exception**: Use `.filter()` with `.paginate()` for paginated filtered results

```typescript
// ❌ Avoid
const results = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), userId))
  .collect();

// ✅ Prefer indexed queries
const results = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", userId))
  .collect();

// ✅ Or filter in code
const allMessages = await ctx.db.query("messages").collect();
const results = allMessages.filter(m => m.author === userId);
```

#### Fetching Patterns
- **Single Document**: Use `.get(id)` when fetching by ID for fastest access
- **Limited Results**: Use `.take(n)` instead of `.collect()` when you only need a fixed number of documents
- **Single Match**: Use `.first()` or `.unique()` instead of `.collect()` when expecting one document
- **Pagination**: Implement cursor-based pagination with `.paginate()` for large result sets (1000+)

#### Avoid Over-Fetching
- **Limit `.collect()` Usage**: Only use `.collect()` when you're confident the result set is small (<1000 documents)
- **Use Pagination**: For potentially large datasets, always use `.paginate()` or `.take()`
- **Denormalize Counts**: Store counts in documents rather than fetching large collections to count them

```typescript
// ❌ Avoid - unbounded collect
const allUserPosts = await ctx.db
  .query("posts")
  .withIndex("by_author", (q) => q.eq("author", userId))
  .collect();

// ✅ Use pagination
const posts = await ctx.db
  .query("posts")
  .withIndex("by_author", (q) => q.eq("author", userId))
  .order("desc")
  .paginate(paginationOpts);

// ✅ Or use take() for recent items
const recentPosts = await ctx.db
  .query("posts")
  .withIndex("by_author", (q) => q.eq("author", userId))
  .order("desc")
  .take(20);
```

### Data Fetching Patterns
- **Related Data**: Fetch related documents in the same function to avoid multiple round-trips
- **Transaction Consistency**: Keep related queries in the same query/mutation to ensure data consistency
- **Helper Functions**: Use plain TypeScript helper functions for shared query logic instead of `ctx.runQuery`

### Real-Time Considerations
- **Reactive Queries**: Queries automatically update in real-time when data changes
- **Selective Subscriptions**: Only subscribe to data that needs real-time updates
- **Client-Side Caching**: Convex automatically caches query results on the client
- **Query Invalidation**: Queries re-run when any document in the result set changes

### Schema Design
- **Denormalization**: Consider denormalizing data for read performance (Convex is optimized for this)
- **Indexes**: Define indexes on fields used for filtering, sorting, and relationships
- **Field Types**: Use appropriate Convex field types (v.string(), v.number(), v.id(), etc.) for type safety
- **Relationships**: Use `v.id("tableName")` for type-safe foreign keys

### Additional Best Practices

For comprehensive Convex best practices including promise handling, internal vs public functions, helper function patterns, and more, see [convex-best-practices.md](./convex-best-practices.md).
