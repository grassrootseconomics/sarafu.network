import { type SessionData } from "~/lib/session";
import { api } from "~/utils/api";

export function useSession() {
  const {
    data: session,
    isLoading,
    refetch,
  } = api.auth.getSession.useQuery(undefined, {
    retryDelay: 1000,
    refetchInterval: 15000,
  });

  const authenticated = !!session?.user;

  if (authenticated) {
    return {
      authenticated,
      session,
      isLoading,
      user: session.user as NonNullable<SessionData["user"]>,
    };
  }

  return { authenticated, session, isLoading, refetch, user: undefined };
}
