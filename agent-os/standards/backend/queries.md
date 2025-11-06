## Database query best practices with Convex

Convex uses a different query model than traditional SQL databases. Follow these patterns:

### Query Security
- **No SQL Injection Risk**: Convex's query API is type-safe and doesn't use string concatenation
- **Input Validation**: Always validate function arguments with Zod schemas in the `args` object
- **Authentication Checks**: Use `authComponent.getAuthUser(ctx)` to verify user identity before data access

### Query Performance
- **Use Indexes**: Define indexes in your schema for fields used in filters and ordering
- **Efficient Filtering**: Use `.filter()` with indexed fields when possible for optimal performance
- **Avoid Over-Fetching**: Use `.first()` instead of `.collect()` when you only need one document
- **Pagination**: Implement cursor-based pagination with `.paginate()` for large result sets

### Data Fetching Patterns
- **Single Document**: Use `.get(id)` when fetching by ID for fastest access
- **Filtered Lists**: Use `.query(table).filter(...).collect()` for filtered lists
- **Ordered Results**: Use `.order("asc")` or `.order("desc")` with indexed fields
- **Related Data**: Fetch related documents in the same function to avoid multiple round-trips

### Real-Time Considerations
- **Reactive Queries**: Queries automatically update in real-time when data changes
- **Selective Subscriptions**: Only subscribe to data that needs real-time updates
- **Client-Side Caching**: Convex automatically caches query results on the client

### Schema Design
- **Denormalization**: Consider denormalizing data for read performance (Convex is optimized for this)
- **Indexes**: Define indexes on fields used for filtering, sorting, and relationships
- **Field Types**: Use appropriate Convex field types (v.string(), v.number(), etc.) for type safety
