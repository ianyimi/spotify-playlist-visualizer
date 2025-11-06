# Product Mission

## Pitch
A minimal, personal Next.js SaaS starter template for quickly bootstrapping new SaaS projects with modern, type-safe architecture, real-time database, and production-ready authentication.

## Purpose
This is a **personal starter template** - not a product with a roadmap. It provides a clean, opinionated foundation for starting new SaaS projects with essential features already configured and working.

## Users

### Primary User
- **You (Template Owner)**: Personal starter template for rapidly prototyping and launching new SaaS ideas

### Use Cases
- Starting new SaaS projects without rebuilding auth, database layer, and UI foundations
- Having a tested, familiar codebase to fork from for new ideas
- Maintaining a personal reference implementation of preferred tech stack
- Quick prototyping with real-time data synchronization

## The Problem

### Every New SaaS Project Starts From Scratch
Building a new SaaS application requires weeks of setup: authentication, database configuration, API architecture, UI components, TypeScript configuration, deployment setup. This repetitive work delays getting to the actual product features.

**Our Solution:** A pre-configured, minimal template with the essentials already working - auth, real-time database with type-safe queries, modern UI, and one-command AWS deployment - so you can start building features immediately.

## Key Features

### Core Features
- **Better Auth Integration**: Google OAuth and email/password authentication with Convex integration and role-based access control
- **Real-Time Database**: Convex DB with automatic subscriptions, optimistic updates, and type-safe queries
- **Modern UI Foundation**: Tailwind CSS 4 + shadcn/ui components + React 19 for rapid UI development
- **One-Command Deployment**: SST (planned) for self-hosted AWS deployment with a single command

### Development Features
- **Full TypeScript**: Type safety across the entire stack with strict checking and schema-generated types
- **Hot Reload**: Next.js 16 with Turbopack for fast development experience
- **Real-Time Updates**: Convex provides automatic UI updates when data changes
- **Code Quality Tools**: ESLint, Prettier, and TypeScript configured out of the box

## Current State

This template is **production-ready but minimal** by design. It contains only the essential features needed to start a new SaaS project. New features are added on a per-project basis, not to this template.

**Status**: Core template complete with Convex + Better Auth integration. SST deployment configuration planned for future update.
