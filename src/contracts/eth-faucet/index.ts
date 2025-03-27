import { type Chain, type PublicClient, type Transport } from "viem";
import { abi } from "~/contracts/eth-faucet/contract";
import { env } from "~/env";
import { getCeloClient } from "~/lib/web3";
import { EthAccountsIndex } from "../eth-accounts-index";
import { PeriodSimple } from "../period-simple";
import { getWriterWalletClient } from "../writer";

export class EthFaucet<t extends Transport, c extends Chain> {
  private address: `0x${string}`;
  publicClient: PublicClient<t, c>;

  constructor(publicClient: PublicClient<t, c>) {
    this.address = env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS;
    this.publicClient = publicClient;
  }

  async registry_address() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const address = await this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "registry",
    });
    return address;
  }
  async period_address() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const address = await this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "periodChecker",
    });
    return address;
  }
  async registry() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const address = await this.registry_address();
    const registry = new EthAccountsIndex(address, this.publicClient);
    return registry;
  }
  async period() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const address = await this.period_address();
    const period = new PeriodSimple(address, this.publicClient);
    return period;
  }
  async canRequest(address: `0x${string}`) {
    if (!this.publicClient) {
      return [false, ["Client unavailable"]] as [boolean, string[]];
    }

    try {
      const registryPromise = this.registry();
      const periodPromise = this.period();

      const [registry, period] = await Promise.all([
        registryPromise,
        periodPromise,
      ]);

      const isActivePromise = registry.isActive(address);
      const isPeriodValidPromise = period.check(address);
      const contractBalancePromise = this.checkBalance();

      const [isActive, isPeriodValid, contractBalance] = await Promise.all([
        isActivePromise,
        isPeriodValidPromise,
        contractBalancePromise,
      ]);
      const reasons: string[] = [];
      if (!isActive) {
        reasons.push("You are not Registered");
      }
      if (!isPeriodValid) {
        reasons.push(
          "You are requesting to frequently or your already have gas"
        );
      }
      if (!contractBalance) {
        reasons.push("Faucet balance is too low");
      }
      return [isActive && isPeriodValid && contractBalance, reasons] as [
        boolean,
        string[],
      ];
    } catch (error) {
      console.error("Error in canRequest:", error);
      return [false, ["Error checking request eligibility"]] as [
        boolean,
        string[],
      ];
    }
  }
  async checkBalance() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const balanceP = this.publicClient.getBalance({
      address: this.address,
    });
    const amountP = this.tokenAmount();
    const [balance, amount] = await Promise.all([balanceP, amountP]);
    return amount < balance;
  }
  async tokenAmount() {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    return this.publicClient.readContract({
      abi: abi,
      address: this.address,
      functionName: "tokenAmount",
    });
  }
  async giveTo(recipientAddress: `0x${string}`) {
    if (!this.publicClient) {
      throw new Error("PublicClient is not available");
    }
    const walletClient = getWriterWalletClient();
    const { request } = await this.publicClient.simulateContract({
      account: walletClient.account,
      address: this.address,
      abi: abi,
      functionName: "giveTo",
      args: [recipientAddress],
    });
    // @ts-expect-error No Idea
    return walletClient.writeContract(request);
  }
}

// Get a client that works in both client and server environments
const client = getCeloClient();

// Create the faucet instance
export const ethFaucet = new EthFaucet(client);
