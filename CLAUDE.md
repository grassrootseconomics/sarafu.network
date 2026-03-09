# Sarafu Network

Blockchain dApp for Community Asset Vouchers (CAVs) on Celo network. Built with Next.js App Router, tRPC, dual PostgreSQL databases, and SIWE authentication.

## Tech Stack

- **Framework**: Next.js 15.5.9 (App Router), React 19.2.1, TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17, shadcn/ui (Radix primitives), CVA
- **API**: tRPC 11.7.2 (type-safe), Zod validation, SuperJSON transformer
- **Database**: PostgreSQL via Kysely 0.28.8 (dual DBs: graph + federated)
- **Auth**: iron-session 8.0.4 with SIWE (Sign-In with Ethereum)
- **Blockchain**: Viem 2.38.5, Wagmi 2.19.0, RainbowKit 2.2.9 (Celo mainnet)
- **State**: Zustand 4.5.6, TanStack React Query 5.90.5
- **Cache**: Upstash Redis (tag-based invalidation)
- **Testing**: Vitest 1.6.1, Testing Library, happy-dom
- **Code Quality**: Biome 1.9.4 (formatter/linter), ESLint, TypeScript strict mode
- **Package Manager**: pnpm
- **Monitoring**: Sentry 9.47.1 (production only)

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server (Turbopack, experimental HTTPS) |
| `pnpm build` | Production build |
| `pnpm check-types` | TypeScript type checking (`tsc --noemit`) |
| `pnpm lint` | Type check + Next.js lint |
| `pnpm test` | Vitest (sets `NODE_ENV=test`, `SKIP_ENV_VALIDATION=true`) |
| `pnpm analyze` | Bundle analysis build (`ANALYZE=true`) |
| `pnpm generate:graph` | Generate Kysely types for graph DB |
| `pnpm generate:federated` | Generate Kysely types for federated DB |

## Project Structure

```
src/
  app/                    # Next.js App Router pages and layouts
    api/auth/             # SIWE auth endpoints (nonce, verify, session, signout)
    api/trpc/             # tRPC fetch handler (GET + POST)
    dashboard/            # Dashboard (vouchers, pools, reports tabs)
    vouchers/[address]/   # Voucher detail (SSG with generateStaticParams)
    vouchers/create/      # Voucher creation wizard
    pools/[address]/      # Pool detail
    wallet/               # Wallet features
    users/[address]/      # User profile
    staff/                # Staff admin area
  components/             # Reusable React components (~235 client components)
    ui/                   # shadcn/ui primitives (50+ components)
    voucher/              # Voucher page, forms, creation wizard
    pools/                # Pool components and forms
    transaction/          # Transaction components
    dialogs/              # Send, receive, scan dialogs
    editor/               # Plate.js rich text editor
    forms/                # Form fields (address, voucher select, combo box)
    layout/               # App layout, sidebar, mobile wallet bar
    map/                  # Mapbox location maps
  server/
    auth/                 # Auth module (iron-session + SIWE)
      index.ts            # Session enrichment, user creation, gas faucet
      session.ts          # iron-session config and types
      types.ts            # AppSession type definition
    api/
      context.ts          # tRPC context (session + both DBs + IP)
      trpc.ts             # tRPC init (procedures, middleware)
      root.ts             # App router export + caller factory
      models/             # Data access layer (class-based: VoucherModel, UserModel, etc.)
      routers/            # tRPC routers (16 routers, merged in _app.ts)
    db/
      index.ts            # DB connections (graphDB + federatedDB)
      graph-db.d.ts       # Generated types (kysely-codegen)
      federated-db.d.ts   # Generated types (kysely-codegen)
    enums.ts              # Const object enums (VoucherType, AccountRoleType, etc.)
  contracts/              # Smart contract ABIs and interactions
  hooks/                  # Custom React hooks
  config/                 # Site config, SIWE config, Viem/Wagmi configs
  context/                # Root context provider (WagmiProvider > QueryClient > tRPC > AuthProvider)
  lib/                    # Utilities (tRPC client, Plate config, NFC, geocoder)
  utils/
    cache/                # Redis caching (cacheWithExpiry, cacheQuery with tag invalidation)
    permissions.ts        # RBAC permission system
  env.ts                  # Environment variable validation (@t3-oss/env-nextjs)
__tests__/                # Tests (mirrors src/ structure)
  __mocks__/              # Shared test mocks
  server/api/routers/     # tRPC router tests
  utils/                  # Utility tests
```

## Architecture Patterns

### Server/Client Component Split
- **Server Components by default**: Pages are async Server Components that fetch data via `caller` (server-side tRPC caller)
- **Client Components**: Explicitly marked with `"use client"`. Pattern: Server Component page fetches data, passes props to a `*Client` component

### tRPC Routers
- Three procedure types: `publicProcedure`, `authenticatedProcedure`, `staffProcedure`
- Input validation with Zod schemas
- Queries use class-based models that receive `{ graphDB, federatedDB }` context
- Caching via `cacheQuery(ttlSeconds, resolver, opts)` wrapper

```typescript
// Example router pattern
export const voucherRouter = router({
  list: publicProcedure
    .input(z.object({ /* ... */ }).optional())
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.listVouchers(input);
    }),
});
```

### Kysely Models
- Class-based models receive both DB instances from tRPC context
- Cross-database queries: fetch federated data first, join in application code
- Types generated by `kysely-codegen`

```typescript
// Example model pattern
export class VoucherModel {
  private graphDB: Kysely<GraphDB>;
  private federatedDB: Kysely<FederatedDB>;
  constructor({ graphDB, federatedDB }: { graphDB: Kysely<GraphDB>; federatedDB: Kysely<FederatedDB> }) {
    this.graphDB = graphDB;
    this.federatedDB = federatedDB;
  }
}
```

### Dual Database Setup
- **graphDB**: App data (users, vouchers, reports, tags, products). Max 10 connections.
- **federatedDB**: Blockchain data via PostgreSQL FDW. Schemas: `chain_data`, `pool_router`. Max 15 connections, TCP keepalive enabled.
- Both use `globalThis` singleton pattern to prevent pool duplication in dev.

### Caching
- **`cacheWithExpiry<T>`**: Generic Redis KV cache with TTL, SuperJSON serialization, graceful degradation
- **`cacheQuery`**: tRPC-aware wrapper with auto-generated keys from `__trpcPath` + input. Supports tag-based invalidation via Redis SETs

### Authentication
- SIWE via iron-session. Encrypted cookie session stores `address` and `chainId`.
- Auto-creates user on first login, triggers gas faucet for approved users.
- Exported `auth()` (React `cache()` wrapped) for server-side session access.

### Permissions
- RBAC with roles: `SUPER_ADMIN`, `ADMIN`, `STAFF`, `USER`, `OWNER` (virtual, from contract ownership)
- `hasPermission(user, isOwner, resource, action)` for checks

## Coding Conventions

- **Path alias**: `~/` maps to `src/` (e.g., `import { env } from "~/env"`)
- **Type imports**: Inline style enforced by ESLint (`import { type Metadata } from "next"`)
- **File naming**: kebab-case for files, PascalCase for component exports, camelCase for hooks
- **Enums**: Use `const` object pattern with `as const` (not TypeScript `enum`)
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess: true`
- **Formatting**: Biome (2-space indent, 80-char width, LF line endings)
- **Git hooks**: `pre-push` runs `pnpm run lint`

## Testing Conventions

- Tests in `__tests__/` mirroring `src/` structure
- Heavy use of `vi.mock()` for module mocking (env, contracts, external APIs)
- `beforeEach` with `vi.clearAllMocks()` for isolation
- Mock env vars to prevent validation errors in tests
- Imports use `~/` alias same as source code

## Deployment

- **Primary**: Vercel (with KV, Sentry integration)
- **Branch strategy**: `preview` is the main development branch, `main` is production. `bin/promote-preview.sh` fast-forwards `main` to `preview`.
- **Docker**: Available via Dockerfile (`output: "standalone"` when `DOCKER=true`)
- **Chain**: Celo mainnet. Primary RPC: `https://r4-celo.grassecon.org`

## Key Libraries

- **Charts**: Recharts, Lightweight Charts, D3
- **Maps**: Mapbox GL, react-map-gl
- **Rich text**: Plate.js (20+ plugins)
- **Forms**: react-hook-form with Zod resolvers
- **Multi-sig**: Gnosis Safe (`@safe-global/protocol-kit`, `@safe-global/api-kit`)
- **QR/NFC**: `@zxing/browser`, custom NFC reader/writer
- **Discord**: discord.js for voucher embed notifications
