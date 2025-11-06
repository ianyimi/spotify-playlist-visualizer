## API patterns with Convex

This project uses Convex for backend functions instead of traditional REST APIs. Follow these patterns:

### Function Organization
- **Group by Feature**: Organize Convex functions by feature/domain (e.g., `auth/`, `posts/`, `users/`)
- **Clear Naming**: Use descriptive function names that indicate their purpose (e.g., `getCurrentUser`, `createPost`, `listPosts`)
- **Export Pattern**: Export all functions that need to be called from the client

### Function Types
- **Queries**: Use `query()` for read-only operations that can be cached and subscribed to
- **Mutations**: Use `mutation()` for write operations that modify data
- **Actions**: Use `action()` for operations that need to call external APIs or perform side effects

### Argument Validation
- **Zod Validation**: Use Zod schemas in the `args` object for all function inputs
- **Type Safety**: Leverage Convex's auto-generated types from your schema
- **Error Messages**: Provide clear validation error messages for client debugging

### Authentication
- **Check Auth**: Use `authComponent.getAuthUser(ctx)` at the start of protected functions
- **Throw Errors**: Throw descriptive errors for unauthorized access
- **Role-Based Access**: Check user roles when needed for fine-grained permissions

### Error Handling
- **Throw Errors**: Use standard Error throwing - Convex handles error serialization
- **Descriptive Messages**: Provide clear error messages for debugging
- **Status Information**: Include relevant context in error messages

### Performance
- **Efficient Queries**: Use indexes defined in your schema for frequently queried fields
- **Pagination**: Implement cursor-based pagination for large result sets
- **Selective Fields**: Query only needed fields when possible
