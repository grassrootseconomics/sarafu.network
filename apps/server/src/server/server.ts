import type { Server } from "http";
import { appRouter, createContext } from "@grassroots/api";
import { sessionOptions } from "@grassroots/auth";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

import { ironSession } from "./iron-session";

export interface ServerOptions {
  dev?: boolean;
  port?: number;
  prefix?: string;
}
// express implementation

let server: Server;

export function createServer(opts: ServerOptions) {
  const dev = opts.dev ?? true;
  const port = opts.port ?? 3000;
  const prefix = opts.prefix ?? "/trpc";
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(ironSession(sessionOptions));
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.get("/", async () => {
    return { hello: "wait-on 💨" };
  });

  const start = async () => {
    try {
      server = app.listen({ port });
      console.log("listening on port", port);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  const stop = async () => {
    if (!server) {
      console.error("Server not running");
      process.exit(1);
    }
    server.close();
  };
  return { server, start, stop };
}
