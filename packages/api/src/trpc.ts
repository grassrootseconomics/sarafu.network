/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import type { Session } from "@grassroots/auth";
import { isAdmin, isStaff } from "@grassroots/auth";
import { graphDB, indexerDB } from "@grassroots/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { IronSession } from "iron-session";
import { ZodError } from "zod";

import SuperJson from "./utils/transformer";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: IronSession<Session> | null | undefined;
}) => {
  const session = opts.session;
  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", session?.user);

  return {
    session,
    graphDB,
    indexerDB,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const middleware = t.middleware;

const isAdminMiddleware = middleware(async (opts) => {
  const { ctx } = opts;
  if (isAdmin(ctx.session?.user)) {
    return opts.next({
      ctx: {
        ...ctx,
        user: ctx.session!.user,
      },
    });
  } else {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

const isStaffMiddleware = middleware(async (opts) => {
  const { ctx } = opts;
  if (isAdmin(ctx.session?.user) || isStaff(ctx.session?.user)) {
    return opts.next({
      ctx: {
        ...ctx,
        user: ctx.session!.user,
      },
    });
  } else {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});
const isAuthenticatedMiddleware = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});
export const adminProcedure = publicProcedure.use(isAdminMiddleware);
export const authenticatedProcedure = publicProcedure.use(
  isAuthenticatedMiddleware,
);

export const staffProcedure = publicProcedure.use(isStaffMiddleware);
