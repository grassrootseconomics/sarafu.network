import Safe from "@safe-global/protocol-kit";

import { getConnectorClient, type Config as WagmiConfig } from "@wagmi/core";
import type { Hex } from "viem";
import { client as trpcClient } from "~/lib/trpc";

export type SafeExecParams = {
  safe: `0x${string}`;
  to: `0x${string}`;
  value?: bigint;
  data: Hex;
  operation?: number; // 0 = CALL
  safeTxGas?: bigint;
  baseGas?: bigint;
  gasPrice?: bigint;
  gasToken?: `0x${string}`;
  refundReceiver?: `0x${string}`;
};

export type SafeProposalData = {
  safeAddress: `0x${string}`;
  safeTransactionData: {
    to: `0x${string}`;
    value: string;
    data: Hex;
    operation: number;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    gasToken: `0x${string}`;
    refundReceiver: `0x${string}`;
    nonce: number;
  };
  safeTxHash: string;
  senderSignature: string;
  chainId: number;
};

/**
 * Proposes a Safe transaction by signing it on the client side
 * and submitting it to the Safe Transaction Service via tRPC.
 * This keeps the Safe API key secure on the server.
 *
 * @param proposeFn - Optional custom function to submit the signed transaction to the server
 */
export async function proposeSafeTx(
  config: WagmiConfig,
  sender: `0x${string}`,
  params: SafeExecParams,
) {

  // Get the connector client which provides the EIP-1193 provider
  const connectorClient = await getConnectorClient(config, { account: sender });
  if (!connectorClient) throw new Error("Connector client not found");

  // Verify connector account matches sender before signing
  if (connectorClient.account.address.toLowerCase() !== sender.toLowerCase()) {
    throw new Error(
      `Connector account ${connectorClient.account.address} does not match sender ${sender}. ` +
        `Please ensure you are connected with the Safe owner wallet.`
    );
  }

  // Initialize Safe Protocol Kit with the provider
  const protocolKit = await Safe.init({
    provider: connectorClient.transport,
    signer: sender,
    safeAddress: params.safe,
  });

  // Check for pending transactions to determine the correct nonce
  const nonce = await protocolKit.getNonce();

  const pendingNonce = await trpcClient.safe.getPendingNonce.query({
    safeAddress: params.safe,
    chainId: connectorClient.chain.id,
    nonce,
  });

  // Create the Safe transaction with the determined nonce
  const safeTransaction = await protocolKit.createTransaction({
    transactions: [
      {
        to: params.to,
        value: (params.value ?? 0n).toString(),
        data: params.data,
        operation: params.operation ?? 0,
      },
    ],
    options: {
      nonce: pendingNonce.nonce,
    },
  });

  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);

  // Sign the transaction using the Safe SDK
  const signedSafeTransaction = await protocolKit.signTransaction(
    safeTransaction
  );

  const senderSignature =
    signedSafeTransaction.signatures.get(sender.toLowerCase())?.data ?? "0x";

  // Prepare proposal data

  const proposalData = {
    safeAddress: params.safe,
    safeTransactionData: signedSafeTransaction.data,
    safeTxHash,
    senderAddress: sender,
    senderSignature: senderSignature,
    origin: "sarafu-network",
  };
  const result = await trpcClient.safe.proposeTx.mutate({
    ...proposalData,
    chainId: connectorClient.chain.id,
  });
  return { safeTxHash: result.safeTxHash };
}
