import type { NextFunction, Request, Response } from "express";
import type { IronSession, SessionOptions } from "iron-session";
import { Session } from "@grassroots/auth";
import { getIronSession } from "iron-session";

declare module "http" {
  interface IncomingMessage {
    session: IronSession<Session> | null;
  }
}

// middleware
export function ironSession(
  sessionOptions: SessionOptions,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async function ironSessionMiddleware(req, res, next) {
    req.session = await getIronSession(req, res, sessionOptions);
    next();
  };
}
