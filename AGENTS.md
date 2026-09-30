# Sarafu Network Agent Guide

## Repository purpose

This repository is the legacy Sarafu Network web application for Community
Asset Vouchers and Commitment Pools on Celo. It is a Next.js App Router
application with tRPC, two PostgreSQL data sources, SIWE authentication, and
on-chain interactions through Viem and Wagmi.

Read `CLAUDE.md` for the detailed architecture, commands, and deployment notes.
This file adds the current product-transition context and the working rules most
important for repository changes.

## Product transition

- Sarafu users are being asked to migrate to Cosmo-Local Credit by
  **30 October 2026**.
- The public destination is `https://cosmolocal.credit`.
- Migration support is `info@grassecon.org`.
- The replacement app carries Sarafu's core user flows forward in an upgraded
  mobile-first experience.
- CLC's user-facing Google/Apple sign-in is implemented with platform passkeys,
  not Google or Apple OAuth. Short public copy may say “Google sign-in”; use
  precise passkey terminology in technical documentation.
- Do not imply that every historic wallet, balance, voucher, Pool, report, or
  obligation migrates automatically. State the actual migration behavior when
  describing data or account transfer.

The site-wide migration notice lives in
`src/components/layout/migration-banner.tsx`. Its height is defined by
`--migration-banner-height` in `styles/global.css`; the desktop sidebar and
viewport-height layouts use that variable to avoid overlap. Keep those pieces in
sync if the banner size changes.

## Reference repositories

Use these sibling repositories for product language and implementation context.
Do not edit them unless the task explicitly includes changes there.

- `/home/wor/src/ge/org-website` — Grassroots Economics public website and
  organization contact details.
- `/home/wor/src/ge/clc/docs` — public Cosmo-Local Credit documentation. Follow
  its `AGENTS.md` when working there.
- `/home/wor/src/ge/clc/clc-app` — replacement CLC application. Its `CLAUDE.md`
  documents the current app architecture, authentication, and deployment hosts.

## Architecture and boundaries

- Next.js 16 App Router; Server Components are the default.
- Route groups are under `src/app/(main)` and `src/app/(onboarding)`.
- Keep interactive UI in explicit `"use client"` components. Fetch server data
  in Server Components and pass serializable props into client components.
- tRPC routers belong in `src/server/api/routers`; database access belongs in
  class-based models under `src/server/api/models`.
- Use `graphDB` for application data and `federatedDB` for indexed chain data.
  Do not query the deprecated `sarafu_network.*` FDW mirror tables.
- Contract ABIs and chain interactions live under `src/contracts`.
- Use the `~/` alias for `src/` imports.

## Code conventions

- TypeScript is strict with `noUncheckedIndexedAccess`.
- Use kebab-case filenames, PascalCase component exports, and camelCase hooks.
- Prefer Server Components unless browser state, effects, or event handlers are
  required.
- Use `const` objects with `as const` instead of TypeScript enums.
- Follow the existing Tailwind/shadcn design system and Sarafu brand tokens.
- Keep public copy concise, accurate, and accessible. External destinations and
  support email addresses should be working links.
- Preserve unrelated work in a dirty worktree and avoid broad refactors during
  focused fixes.

## Validation

Use pnpm from the repository root:

```sh
pnpm check-types
pnpm lint
pnpm test
pnpm build
```

Run focused tests while iterating, then run type checking, lint, and the full
test suite. Run a production build for changes to layouts, routing, providers,
environment handling, or deployment behavior.

Tests live in `__tests__/` and mirror `src/`. Use Vitest and Testing Library,
reset mocks between tests, and mock environment, chain, or database boundaries
rather than calling live services.

## Deployment

- `preview` is the development branch; `main` is production.
- Vercel is the primary deployment target.
- Docker builds use Next.js standalone output when `DOCKER=true`.
- Never commit secrets or expose server-only environment variables to client
  components.
