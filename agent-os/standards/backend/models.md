## Schema and data model best practices with Convex

Convex uses schema definitions instead of traditional models. Follow these patterns:

### Schema Definition
- **Clear Naming**: Use plural names for tables (e.g., `users`, `posts`) following Convex conventions
- **Timestamps**: Include `createdAt` and `updatedAt` as `v.number()` (timestamp in ms) for auditing
- **Type Safety**: Use Convex's validator system (`v.string()`, `v.number()`, etc.) for type enforcement
- **Optional Fields**: Use `v.optional()` for nullable fields to maintain type safety

### Data Integrity
- **Required Fields**: Mark essential fields as required (non-optional) in your schema
- **Field Validation**: Use Zod validation in function `args` for complex validation rules
- **Unique Constraints**: Create unique indexes for fields that must be unique (e.g., email)
- **Relationships**: Store document IDs as strings to reference related documents

### Schema Organization
- **Centralized Schema**: Define all tables in `src/convex/schema.ts` for consistency
- **Index Definitions**: Define indexes on frequently queried fields for performance
- **Compound Indexes**: Use compound indexes for queries that filter on multiple fields
- **Generated Types**: Let Convex auto-generate TypeScript types from your schema

### Best Practices
- **Denormalization**: Consider embedding related data instead of always using references
- **Flexible Schema**: Convex allows schema evolution - you can add fields without migrations
- **Appropriate Types**: Use correct Convex value types (v.id(), v.string(), v.number(), v.boolean(), etc.)
- **Document References**: Use `v.id("tableName")` for type-safe references to other tables
