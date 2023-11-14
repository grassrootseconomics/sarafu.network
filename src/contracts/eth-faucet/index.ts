import {
  createPublicClient,
  createWalletClient,
  http,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "~/contracts/eth-faucet/contract";
import { env } from "~/env.mjs";
import { type ChainType, getViemChain, publicClient } from "~/lib/web3";
import { EthAccountsIndex } from "../eth-accounts-index";
import { PeriodSimple } from "../period-simple";

const config = { chain: getViemChain(), transport: http() };

export class EthFaucet {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor(publicClient: PublicClient<HttpTransport, ChainType>) {
    this.address = env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS;
    this.publicClient = publicClient ?? createPublicClient(config);
  }

  async gimme() {
    const walletClient = getWalletClient();
    const { request } = await this.publicClient.simulateContract({
      account: walletClient.account,
      abi,
      address: this.address,
      functionName: "gimme",
    });
    const hash = await walletClient.writeContract(request);
    console.debug("gimme tx: ", hash);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
  async registry_address() {
    const address = await this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "registry",
    });
    return address;
  }
  async period_address() {
    const address = await this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "periodChecker",
    });
    return address;
  }
  async registry() {
    const address = await this.registry_address();
    const registry = new EthAccountsIndex(address, this.publicClient);
    return registry;
  }
  async period() {
    const address = await this.period_address();
    const period = new PeriodSimple(address, this.publicClient);
    return period;
  }
  async canRequest(address: `0x${string}`) {
    const registryPromise = this.registry();
    const periodPromise = this.period();

    const [registry, period] = await Promise.all([
      registryPromise,
      periodPromise,
    ]);

    const isActivePromise = registry.isActive(address);
    const havePromise = period.have(address);
    const contractBalancePromise = this.checkBalance();

    const [isActive, have, contractBalance] = await Promise.all([
      isActivePromise,
      havePromise,
      contractBalancePromise,
    ]);
    const reasons: string[] = [];
    if (!isActive) {
      reasons.push("You are not Registered");
    }
    if (!have) {
      reasons.push("You are requesting to frequently or your already have gas");
    }
    if (!contractBalance) {
      reasons.push("Faucet balance is too low");
    }
    return [isActive && have && contractBalance, reasons] as [
      boolean,
      string[]
    ];
  }
  async checkBalance() {
    const balanceP = this.publicClient.getBalance({
      address: this.address,
    });
    const amountP = this.tokenAmount();
    const [balance, amount] = await Promise.all([balanceP, amountP]);
    return amount < balance;
  }
  async tokenAmount() {
    return this.publicClient.readContract({
      abi: abi,
      address: this.address,
      functionName: "tokenAmount",
    });
  }
  async giveTo(recipientAddress: `0x${string}`) {
    const walletClient = getWalletClient();
    const { request } = await this.publicClient.simulateContract({
      account: walletClient.account,
      address: this.address,
      abi: abi,
      functionName: "giveTo",
      args: [recipientAddress],
    });
    return walletClient.writeContract(request);
  }

  // Add other methods based on the contract ABI as needed...
}

function getWalletClient() {
  const { ETH_FAUCET_WRITER_PRIVATE_KEY } = env;
  const ethFaucetWriterAccount = privateKeyToAccount(
    ETH_FAUCET_WRITER_PRIVATE_KEY as `0x${string}`
  );
  return createWalletClient({
    account: ethFaucetWriterAccount,
    ...config,
  });
}

export const ethFaucet = new EthFaucet(
  publicClient({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    chainId: config.chain.id,
  })
);
