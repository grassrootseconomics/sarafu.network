import { type Chain, type PublicClient, type Transport } from "viem";
import { abi } from "~/contracts/eth-accounts-index/contract";
import { getWriterWalletClient } from "../writer";
import { defaultReceiptOptions } from "~/config/viem.config.server";

export class EthAccountsIndex<t extends Transport, c extends Chain> {
  private address: `0x${string}`;

  publicClient: PublicClient<t, c>;

  constructor(address: `0x${string}`, publicClient: PublicClient<t, c>) {
    this.address = address;
    this.publicClient = publicClient;
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async add(accountAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();

    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "add",
      args: [accountAddress],
    });
    console.debug("addAccount tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({
      hash,
      ...defaultReceiptOptions,
    });
  }

  async remove(accountAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      abi,
      address: this.address,
      functionName: "remove",
      args: [accountAddress],
    });
    return this.publicClient.waitForTransactionReceipt({
      hash,
      ...defaultReceiptOptions,
    });
  }

  async isActive(accountAddress: `0x${string}`) {
    return this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "isActive",
      args: [accountAddress],
    });
  }

  // Add other methods based on the contract ABI as needed...
}
