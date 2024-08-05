import { getViemChain } from "@grassroots/shared/utils/web3";
import { Chain, createWalletClient, http, HttpTransport, ParseAccount, PrivateKeyAccount, RpcSchema, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../env";

export const config = { chain: getViemChain(), transport: http() };

export function getWriterAccount(): PrivateKeyAccount  {
  const { WRITER_PRIVATE_KEY } = env;
  return privateKeyToAccount(WRITER_PRIVATE_KEY as `0x${string}`);
}
export function getWriterWalletClient(): WalletClient<HttpTransport, Chain, ParseAccount<PrivateKeyAccount>, RpcSchema> {
  const account = getWriterAccount();
  return createWalletClient({
    account: account,
    ...config,
  });
}
