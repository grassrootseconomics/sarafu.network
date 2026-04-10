/**
 * SSR caller wrapper — the only part of the tRPC stack that stays in apps/web
 * because it depends on React's cache() for per-request deduplication.
 */
import { createCallerFactory } from "@sarafu/api/trpc";
import { cache } from "react";
import { auth } from "@sarafu/api/auth";
import type { Context } from "@sarafu/api/context";
import { graphDB, federatedDB } from "@sarafu/api/db";
import { appRouter } from "@sarafu/api/root";

// Re-export for backward compatibility
export { appRouter } from "@sarafu/api/root";
export type { AppRouter } from "@sarafu/api/root";

const createCallerContext = cache(
  async (): Promise<Context> => ({
    session: await auth(),
    graphDB: graphDB,
    federatedDB: federatedDB,
    ip: "unknown",
  })
);

export const caller = createCallerFactory(appRouter)(createCallerContext);
