import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@sarafu/api/root";
export type RouterOutputs = inferRouterOutputs<AppRouter>;
