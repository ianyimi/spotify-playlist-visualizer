# Product Roadmap

## Important Note

This is a **personal starter template**, not an active product with a traditional roadmap. The template is intentionally minimal and feature-complete for its purpose: providing a clean starting point for new SaaS projects.

## Current Status

**Template Ready** - Core features are implemented and working:
- Better Auth (Google OAuth + email/password) with Convex integration
- Convex real-time database with type-safe queries and mutations
- Tailwind CSS 4 + shadcn/ui
- TypeScript strict mode with auto-generated types from Convex schema
- Next.js 16 App Router
- Real-time subscriptions and optimistic updates

**Completed Tasks:**
- ✅ Removed PayloadCMS dependency
- ✅ Removed tRPC in favor of direct Convex integration
- ✅ Integrated Better Auth with Convex

## Planned Future Tasks

1. [ ] **SST Integration for AWS Deployment** - Add one-command self-hosted deployment
   - Install and configure SST
   - Setup AWS infrastructure as code
   - Configure deployment scripts
   - Document AWS account setup requirements
   - Create deployment guide

2. [ ] **Setup Playwright for E2E Testing** - Configure end-to-end testing
   - Install Playwright and dependencies
   - Configure playwright.config.ts
   - Create example test files
   - Add npm scripts for running tests

3. [ ] **Setup k6 for Load Testing** - Configure performance testing
   - Install k6
   - Create example load test scripts
   - Document k6 usage in README
   - Add npm scripts for running load tests

4. [ ] **Setup GitHub Actions Workflows** - Configure CI/CD
   - Create workflow for running tests on PR
   - Create workflow for deployment
   - Configure environment secrets and variables
   - Add status badges to README

## Future Approach

**No Active Roadmap** - Features are added on a per-project basis when forking this template for specific SaaS applications.

When starting a new project from this template:
1. Fork/clone this repository
2. Add project-specific features as needed
3. Keep this template minimal and generic

## Maintenance

- Keep dependencies updated periodically
- Fix bugs if discovered
- Maintain compatibility with latest Next.js and Convex stable releases
- Keep documentation current with actual implementation
