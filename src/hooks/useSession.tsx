import { type SessionData } from "~/lib/session";
import { api } from "~/utils/api";

export function useSession() {
  const {
    data: session,
    isLoading: _loading,
    refetch,
  } = api.auth.getSession.useQuery(undefined, {
    retryDelay: 1000,
    refetchInterval: 10000,
  });

  const loading = _loading;

  const authenticated = !!session?.user;

  if (authenticated) {
    return {
      authenticated,
      session,
      loading,
      user: session.user as NonNullable<SessionData["user"]>,
    };
  }

  return { authenticated, session, loading, refetch, user: undefined };
}
