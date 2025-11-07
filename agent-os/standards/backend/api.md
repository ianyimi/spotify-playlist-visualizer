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
- **Custom Adapter with Full Integration**: This project uses a custom Better Auth adapter WITH `@convex-dev/better-auth` client plugins (see `/agent-os/standards/backend/authentication.md`)
- **HTTP Routes**: Auth routes are registered in `~/convex/http.ts` via `httpAction`
- **Convex Auth Works**: `ctx.auth.getUserIdentity()` works in Convex functions thanks to `convexClient()` plugin
- **Protected Functions**: Use `ctx.auth.getUserIdentity()` or Better Auth session validation
- **Throw Errors**: Throw descriptive errors for unauthorized access
- **Role-Based Access**: Check user roles from Better Auth user data
- **Internal API**: Auth database operations use `internal.*` imports (not `api.*`) for security
- **Server-Side Auth**: Use `getCurrentUser()` and `getSession()` from `~/auth/server` in Next.js server components

### Error Handling
- **Throw Errors**: Use standard Error throwing - Convex handles error serialization
- **Descriptive Messages**: Provide clear error messages for debugging
- **Status Information**: Include relevant context in error messages

### Performance
- **Efficient Queries**: Use indexes defined in your schema for frequently queried fields
- **Pagination**: Implement cursor-based pagination for large result sets
- **Selective Fields**: Query only needed fields when possible
