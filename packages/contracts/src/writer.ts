import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../env";
import { getViemChain } from "@grassroots/shared/utils/web3";

export const config = { chain: getViemChain(), transport: http() };

export function getWriterAccount() {
  const { WRITER_PRIVATE_KEY } = env;
  return privateKeyToAccount(WRITER_PRIVATE_KEY as `0x${string}`);
}
export function getWriterWalletClient() {
  const account = getWriterAccount();
  return createWalletClient({
    account: account,
    ...config,
  });
}
