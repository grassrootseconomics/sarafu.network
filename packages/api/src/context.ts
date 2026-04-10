import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { graphDB, federatedDB } from "./db";
import { auth, getSessionFromToken } from "./auth";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const session = authHeader?.startsWith("Bearer ")
    ? await getSessionFromToken(authHeader.slice(7))
    : await auth();

  const ip = (opts.req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  return {
    graphDB,
    federatedDB,
    session,
    ip,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
