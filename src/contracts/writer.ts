import { createWalletClient, http } from "viem";
import { nonceManager, privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { env } from "~/env";

export function getWriterAccount() {
  const { WRITER_PRIVATE_KEY } = env;
  return privateKeyToAccount(WRITER_PRIVATE_KEY as `0x${string}`, {
    nonceManager,
  });
}

export function getWriterWalletClient() {
  const account = getWriterAccount();

  return createWalletClient({
    account: account,
    chain: celo,
    transport: http(),
  });
}
