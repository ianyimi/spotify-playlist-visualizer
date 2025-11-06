## Schema evolution with Convex

Convex handles schema changes differently than traditional databases. No manual migrations are needed:

### Schema Changes
- **Automatic Evolution**: Convex automatically handles schema changes when you update your schema file
- **Additive Changes**: Adding new fields is safe and doesn't require migrations
- **Optional Fields**: New fields should typically be `v.optional()` for backwards compatibility
- **Zero-Downtime**: Schema changes deploy without downtime automatically

### Data Transformations
- **Use Mutations**: For data transformations, write Convex mutations to update existing documents
- **Incremental Updates**: Update documents incrementally rather than all at once for large datasets
- **Default Values**: Handle missing fields with default values in your query/mutation logic
- **Backwards Compatibility**: Write code that handles both old and new data shapes during transitions

### Breaking Changes
- **Field Removal**: Before removing a field, ensure no code references it
- **Type Changes**: Change field types carefully - may require data transformation mutations
- **Testing**: Test schema changes in development environment before production deployment
- **Rollback Safety**: Keep old code compatible with new schema for safe rollbacks

### Best Practices
- **Version Control**: Commit schema changes to git like any other code
- **Document Changes**: Comment significant schema changes for team awareness
- **Gradual Rollout**: For major changes, deploy in stages (add optional field → populate data → make required)
- **No Manual SQL**: Convex manages schema automatically - no manual migration files needed
