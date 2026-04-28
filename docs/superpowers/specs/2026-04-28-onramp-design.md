# On-ramp (KES → Stablecoin) — Design Spec

**Status:** Draft
**Date:** 2026-04-28
**Owner:** William Luke
**Branch:** `williamluke4/onramp`

## 1. Goal

Let an authenticated Sarafu Network user buy stablecoin (USDT default, USDC/cUSD optional) on Celo using Kenyan Shillings via M-PESA, by integrating the [grassrootseconomics/pretium-ramp](https://github.com/grassrootseconomics/pretium-ramp) service as an upstream API.

This is v1 — on-ramp only. Off-ramp and auto-swap-to-voucher are explicitly out of scope.

## 2. Non-goals

- Off-ramp (stablecoin → KES). The upstream service has internal off-ramp code but the public API does not document it yet.
- Auto-swap from stablecoin to community voucher after on-ramp settles.
- Persisting on-ramp transactions in our own database. We rely on the upstream service for tx state.
- Hosting the pretium-ramp webhook callback in this app. Without local persistence there is nothing for us to do with it.
- Reverse phone lookup by address from the upstream service (no such endpoint exists; we use `localStorage` for pre-fill instead).

## 3. User flow

1. From `WalletHome.tsx` the user taps a new **Buy** button (alongside Send/Receive).
2. A dialog opens. In parallel the dialog fetches `/rates` and reads `localStorage` for a previously-used phone for this wallet.
3. **Phone step** (skipped if pre-filled from `localStorage`): user enters their M-PESA phone number.
4. **Amount step**: user picks an asset (dropdown — USDT default, USDC, cUSD) and types a KES amount. A live preview shows `≈ amount / rates.buy ASSET`. Range enforced: 20 ≤ amount ≤ 250,000.
5. **Confirm step**: shows summary. On submit:
    1. Call `onramp.trigger` (which always passes `phoneNumber` to the upstream service).
    2. On success persist phone in `localStorage` keyed by `onramp:phone:<address>`.
6. **Success step**: shows transaction code and instruction "Check your phone for an M-PESA prompt." User dismisses.

Note: this v1 does **not** call the upstream `POST /link` endpoint. The user supplies their phone number on every onramp; the upstream service uses it directly without persisting an address↔phone link in our system or theirs. We pre-fill the phone client-side via `localStorage`. Linking can be added later as a separate flow if reverse-lookup or multi-address-per-phone semantics become needed.

There is no in-dialog status polling in v1. Stablecoin balance will eventually appear via the wallet's existing balance hooks once pretium-ramp settles the transaction.

## 4. Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  WalletHome     │      │  Next.js (tRPC)  │      │  pretium-ramp     │
│  ─ Buy button   ├─────►│  onrampRouter    ├─────►│  /api/v1/...      │
│  ─ BuyDialog    │      │  pretium client  │      │  (KES→stablecoin) │
└─────────────────┘      └──────────────────┘      └───────────────────┘
```

The browser never talks to pretium-ramp directly. The Next.js server proxies via tRPC, hiding the upstream URL and enforcing per-user authorization.

## 5. Components

### 5.1 Pretium client — `src/lib/sarafu/pretium.ts`

Plain stateless module that wraps the upstream HTTP API. Mirrors the existing `src/lib/sarafu/custodial.ts` and `src/lib/sarafu/resolver.ts` modules. **Server-only** — uses `env.PRETIUM_RAMP_API_URL`.

Exposed functions:

```ts
export async function getRates(): Promise<{ buy: number; sell: number }>;

export async function triggerOnramp(input: {
  address: Address;
  phoneNumber: string;
  asset: "USDT" | "USDC" | "cUSD";
  amount: number;
}): Promise<{ transactionCode: string; status: string; message: string }>;
```

`createLink` is intentionally not exposed in v1 — see §3.

All functions translate the upstream `{ ok, description, result }` envelope into typed return values or throw a `PretiumError`. The router is responsible for mapping these to `TRPCError` codes.

```ts
export type PretiumErrorCode =
  | "bad_request"   // upstream HTTP 400
  | "not_found"     // upstream HTTP 404
  | "upstream";     // upstream HTTP 5xx or network failure

export class PretiumError extends Error {
  constructor(
    public readonly code: PretiumErrorCode,
    public readonly description: string,
  ) {
    super(description);
  }
}
```

### 5.2 tRPC router — `src/server/api/routers/onramp.ts`

```ts
export const onrampRouter = router({
  getRates: authenticatedProcedure.query(
    cacheQuery(60, async () => pretium.getRates()),
  ),

  trigger: authenticatedProcedure
    .input(z.object({
      phoneNumber: z.string().min(1),
      asset: z.enum(["USDT", "USDC", "cUSD"]),
      amount: z.number().min(20).max(250_000),
    }))
    .mutation(({ input, ctx }) =>
      pretium.triggerOnramp({
        address: getAddress(ctx.session.address),
        phoneNumber: input.phoneNumber,
        asset: input.asset,
        amount: input.amount,
      }),
    ),
});
```

The wallet address is taken from `ctx.session.address` (set by SIWE), not from input. This means a user can only ever trigger an on-ramp to their own connected wallet — there is no client-controlled address to validate.

Wire into `src/server/api/routers/_app.ts`:

```ts
onramp: onrampRouter,
```

### 5.3 Buy dialog — `src/components/dialogs/buy-dialog.tsx`

Client component using the existing shadcn `Dialog` primitive (matches `send-dialog.tsx`). Internal state is a 4-step wizard: `phone → amount → confirm → success`. Skip `phone` if pre-fill exists.

Sub-units (kept as private components inside the file):
- `<PhoneStep />` — single phone input + Continue.
- `<AmountStep rates>` — asset Select, KES NumberInput, live preview.
- `<ConfirmStep />` — summary + Submit (calls `trigger`).
- `<SuccessStep transactionCode>` — message + Done.

Hooks used: `trpc.onramp.getRates.useQuery`, `trpc.onramp.trigger.useMutation`.

`localStorage` access wrapped in a small helper:

```ts
const phoneStorageKey = (address: Address) => `onramp:phone:${getAddress(address)}`;
```

### 5.4 Wallet home button — `src/components/wallet/WalletHome.tsx`

Add a `Buy` button next to Send/Receive. Opens `<BuyDialog />`. Uses the Lucide `Banknote` icon.

### 5.5 Environment — `src/env.ts`

Add server-only var:

```ts
PRETIUM_RAMP_API_URL: z.string().url(),
```

Plus the matching `runtimeEnv` line. No client var needed.

## 6. Error handling

### 6.1 Upstream → tRPC mapping

| Upstream | `PretiumError.code` | tRPC code |
|---|---|---|
| HTTP 400 | `bad_request` | `BAD_REQUEST` |
| HTTP 404 | `not_found` | `NOT_FOUND` |
| HTTP 5xx / network | `upstream` | `INTERNAL_SERVER_ERROR` |

(`409 conflict` is only produced by the link endpoint, which v1 does not call.)

### 6.2 UI behavior

- `BAD_REQUEST` → inline form error using the `description` field.
- `NOT_FOUND` on `trigger` → reset to phone step with the message "Wallet not linked — please re-enter your phone." (Returned when the upstream service rejects the address/phone pair; the user re-entering their phone is the recovery path.)
- `INTERNAL_SERVER_ERROR` → toast: "On-ramp service unavailable, please try again."
- `getRates` failure does **not** block the flow. Show "Rate unavailable" in place of the live preview.

### 6.3 Authorization

The wallet address is sourced from `ctx.session.address` rather than client input, so no address-mismatch check is necessary. The `authenticatedProcedure` middleware already guarantees a session is present.

## 7. Testing

### 7.1 `__tests__/lib/sarafu/pretium.test.ts`

Mock `fetch`. Assert:
- `getRates` parses `{ ok, result: { buy, sell } }` correctly.
- `triggerOnramp` sends correct URL, method, JSON body.
- HTTP 4xx/5xx responses surface as typed `PretiumError` with the right code.
- Network errors (rejected fetch) surface as `PretiumError` with `code: "upstream"`.

### 7.2 `__tests__/server/api/routers/onramp.test.ts`

Mock `~/lib/sarafu/pretium`. Use the existing tRPC test harness pattern (`createCallerFactory` with a fake session). Assert:
- `getRates` returns the upstream payload.
- `trigger` passes `ctx.session.address` to the pretium client (not any client input).
- Zod validation rejects amount < 20, > 250_000, and unknown asset.
- Each `PretiumError` code maps to the documented `TRPCError` code (`bad_request → BAD_REQUEST`, `not_found → NOT_FOUND`, `upstream → INTERNAL_SERVER_ERROR`).

### 7.3 No component tests

The dialog is straightforward UI and the codebase pattern is to skip component tests for dialog primitives (`send-dialog`, `receive-dialog`, etc. have none). Manual verification: open the dialog, walk through each step, confirm M-PESA prompt arrives on the linked phone in a staging environment.

## 8. Caching

- `getRates` cached at the tRPC layer with `cacheQuery(60, …)` and tag `onramp:rates`. 60-second TTL is appropriate because Pretium rates change slowly but the dialog may be opened many times in close succession during a campaign.
- No caching on `link` or `trigger` (mutations).

## 9. Security considerations

- Upstream URL is server-side only. No `NEXT_PUBLIC_` exposure.
- All mutations require an authenticated session.
- The wallet address used for on-ramps is sourced from the session, never from client input.
- No phone numbers are stored in our database; `localStorage` pre-fill is local to the user's browser.
- The pretium-ramp service itself is currently unauthenticated at the network layer — this is an upstream concern that this spec does not attempt to solve. If the ramp team adds API-key auth later, we add a `PRETIUM_RAMP_API_KEY` server var and an `Authorization` header in the client module.

## 10. Open questions / future work

- **Transaction history.** Once we want to show on-ramp status in the dialog or a history page, we either (a) call `GET /transactions/{phone}` directly from the router, or (b) ask the ramp team to add `GET /transactions/by-address/{addr}` so we don't have to know the phone. (b) is cleaner.
- **Auto-swap.** A natural v2 is "after stablecoin lands, swap N% into the user's selected community voucher via the existing pool router." That's a separate spec.
- **Off-ramp.** Same — separate spec, requires the ramp team to publish the off-ramp endpoints.

## 11. Out-of-scope code

This spec does **not** touch:
- The `users` table or any other DB schema.
- The existing send/receive dialogs.
- The wallet swap or pool routing flows.
- Any contract or ABI.

## 12. Files touched

**New:**
- `src/lib/sarafu/pretium.ts`
- `src/server/api/routers/onramp.ts`
- `src/components/dialogs/buy-dialog.tsx`
- `__tests__/lib/sarafu/pretium.test.ts`
- `__tests__/server/api/routers/onramp.test.ts`

**Modified:**
- `src/env.ts` (add `PRETIUM_RAMP_API_URL`)
- `src/server/api/routers/_app.ts` (register `onramp`)
- `src/components/wallet/WalletHome.tsx` (add Buy button)
