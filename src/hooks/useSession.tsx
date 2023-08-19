import type { IronSession } from "iron-session";
import { api } from "~/utils/api";

export function useSession() {
  const {
    data: session,
    isLoading: _loading,
    refetch,
  } = api.auth.getSession.useQuery(undefined, {
    cacheTime: 1000,
    retryDelay: 1000,
  });

  const loading = _loading;

  const authenticated = !!session?.user;

  if (authenticated) {
    return {
      authenticated,
      session,
      loading,
      user: session.user as NonNullable<IronSession["user"]>,
    };
  }

  return { authenticated, session, loading, refetch };
}
