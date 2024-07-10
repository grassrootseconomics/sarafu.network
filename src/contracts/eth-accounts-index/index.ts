import { type HttpTransport, type PublicClient } from "viem";
import { abi } from "~/contracts/eth-accounts-index/contract";
import { type ChainType } from "~/lib/web3";
import { getWriterWalletClient } from "../writer";

export class EthAccountsIndex {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor(
    address: `0x${string}`,
    publicClient: PublicClient<HttpTransport, ChainType>
  ) {
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
      confirmations: 2,
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
      confirmations: 2,
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
