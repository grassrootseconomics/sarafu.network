import type { Session } from "@grassroots/auth";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { IronSession } from "iron-session";
import { graphDB, indexerDB } from "@grassroots/db";

type CreateContextOptions = {
  session: IronSession<Session> | null | undefined;
};
declare module "http" {
  interface IncomingMessage {
    session: IronSession<Session> | null | undefined;
  }
}
const createInnerTRPCContext = (opts?: CreateContextOptions) => {
  return {
    graphDB: graphDB,
    indexerDB: indexerDB,
    session: opts?.session,
  };
};

export const createContext = async (opts?: CreateExpressContextOptions) => {
  return createInnerTRPCContext({ session: opts?.req?.session   });
};

export type Context = Awaited<ReturnType<typeof createContext>>;
