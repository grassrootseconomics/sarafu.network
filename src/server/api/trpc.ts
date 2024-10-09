/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { isAdmin, isStaff, isSuperAdmin } from "~/utils/permissions";
import SuperJson from "~/utils/trpc-transformer";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  /**
   * @link https://trpc.io/docs/v11/data-transformers
   */
  transformer: SuperJson,
  /**
   * @link https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape, error }) {
    console.error(error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
/**
 * Create a router
 * @link https://trpc.io/docs/v11/router
 */
export const router = t.router;

export const publicProcedure = t.procedure;
/**
 * @link https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters;

export const middleware = t.middleware;

const isStaffMiddleware = middleware(async (opts) => {
  const { ctx } = opts;
  if (
    ctx.session !== null && 
    isAdmin(ctx.session?.user) ||
    isStaff(ctx.session?.user) ||
    isSuperAdmin(ctx.session?.user)
  ) {
    return opts.next({
      ctx: {
        ...ctx,
        user: ctx.session!.user,
        session: ctx.session!,
      },
    });
  } else {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});
const isAuthenticatedMiddleware = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx?.session || !ctx.session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});
export const staffProcedure = publicProcedure.use(isStaffMiddleware);
export const authenticatedProcedure = publicProcedure.use(
  isAuthenticatedMiddleware
);
