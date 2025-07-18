# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Building and Development:**
- `pnpm dev` - Start development server with Turbo (fastest)
- `pnpm build` - Build production version
- `pnpm start` - Start production server

**Code Quality:**
- `pnpm run check-types` - TypeScript type checking
- `pnpm run lint` - Run type checking and ESLint (combined check)
- `pnpm test` - Run Vitest tests
- `pnpm run analyze` - Bundle analyzer for performance optimization

**Database Operations:**
- `pnpm run generate:graph` - Generate graph database types from schema
- `pnpm run generate:federated` - Generate federated database types (requires .env setup)

## Project Architecture

**Tech Stack:**
- Next.js 15 with App Router (React Server Components preferred)
- TypeScript with strict typing
- tRPC v11 for type-safe APIs
- Kysely for database queries (dual PostgreSQL setup)
- Tailwind CSS + Shadcn UI + Radix for styling
- Wagmi v2 + RainbowKit v2 for Web3 integration
- Vitest for testing

**Database Architecture:**
- **Graph DB**: Primary database for application data (`cic-graph` schema)
- **Federated DB**: Secondary database for extended queries via FDW
- Both use Kysely ORM with auto-generated types
- Database types are generated from live schemas, not migrations

**Key Directories:**
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components (use functional components with TypeScript interfaces)
- `src/server/api/` - tRPC routers and procedures
- `src/contracts/` - Smart contract interactions and type definitions
- `src/lib/` - Core utilities and business logic
- `src/hooks/` - Custom React hooks

**Authentication & Authorization:**
- NextAuth.js v5 with SIWE (Sign-In with Ethereum)
- Role-based access: staff, admin, super admin
- tRPC procedures: `publicProcedure`, `authenticatedProcedure`, `staffProcedure`

**Blockchain Integration:**
- Celo blockchain integration via Wagmi
- Contract deployments managed through environment variables
- Paper wallet generation and QR code scanning capabilities
- Community Asset Vouchers (CAVs) as core business domain

## Code Style Guidelines

**Follow the coding standards defined in `.cursorrules`:**
- Use functional, declarative programming (avoid classes)
- Use `function` keyword for components, not `const`
- Prefer interfaces over types, avoid enums
- Use descriptive variable names with auxiliary verbs (`isLoading`)
- Directory names: lowercase with dashes (`auth-wizard`)
- Early returns for error handling, avoid deep nesting
- Minimize `use client` - prefer React Server Components

**React/Next.js Patterns:**
- Use App Router for navigation and state changes
- Wrap client components in Suspense with fallbacks
- Use Zod for form validation
- Implement mobile-first responsive design
- Optimize images: WebP format, lazy loading

**Error Handling:**
- Handle errors at function start with early returns
- Use guard clauses for preconditions
- Implement proper error logging
- Place happy path last in functions

## Testing

- Test framework: Vitest with Happy DOM
- Test files should be in `__tests__/` directory
- Use React Testing Library for component tests
- Run tests with `pnpm test`

## Environment Setup

**Required Environment Variables:**
- Database URLs: `GRAPH_DB_URL`, `FEDERATED_DB_URL`
- Blockchain: Contract addresses prefixed with `NEXT_PUBLIC_`
- API integrations: Sarafu API tokens and URLs
- Session: `NEXT_IRON_PASSWORD`

**Development Setup:**
1. Clone repo and run `pnpm i`
2. Start PostgreSQL: `cd dev && docker compose up`
3. Copy `.env.local.example` to `.env.local`
4. Setup cic-graph database with migrations
5. Run `pnpm dev`

## Special Considerations

- **Web3 Integration**: Uses RainbowKit v2 with Wagmi v2 for wallet connections
- **Performance**: Prioritize Web Vitals (LCP, CLS, FID)
- **Security**: Uses AGPL-3.0 license, secure environment variable handling
- **CAV Domain**: Community Asset Vouchers are the core business model
- **Mobile Support**: Paper wallet scanning and QR code generation
- **Multi-Database**: Careful query routing between graph and federated DBs