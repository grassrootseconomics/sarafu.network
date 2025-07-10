import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { graphDB, federatedDB } from "~/server/db";
import { auth } from "./auth";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await auth();
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
