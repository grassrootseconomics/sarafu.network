import { useCallback } from "react";
import { type SafeProposalData } from "~/contracts/safe-service";
import { trpc } from "~/lib/trpc";

/**
 * Hook to propose Safe transactions via the secure server endpoint.
 * This ensures the Safe API key is never exposed to the client.
 */
export function useSafeProposal() {
  const proposeMutation = trpc.safe.proposeTx.useMutation();

  const proposeSafeTx = useCallback(
    async (data: SafeProposalData) => {
      return await proposeMutation.mutateAsync(data);
    },
    [proposeMutation]
  );

  return {
    proposeSafeTx,
    isLoading: proposeMutation.isPending,
    error: proposeMutation.error,
  };
}
