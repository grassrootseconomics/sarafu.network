import { PropsWithChildren, createContext, useContext, useState } from "react";
import {
  Account,
  TransactionReceipt,
  WalletClient,
  createPublicClient,
  http,
  parseAbi,
  parseUnits,
} from "viem";
import { getChain } from "../lib/web3";

export const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(),
});

// Create the PaperWalletContext
const PaperWalletContext = createContext({
  client: undefined as WalletClient | undefined,
  transactions: [] as string[],
  addTransaction: (transaction: string) => {},
});

// Create the PaperWalletProvider component
const PaperWalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Define the state variables and functions
  const [client, setClient] = useState<WalletClient>();
  const [transactions, setTransactions] = useState<string[]>([]);

  // Define the addTransaction function
  const addTransaction = (transaction: string) => {
    setTransactions((prevTransactions) => [...prevTransactions, transaction]);
  };

  // Create the context value object
  const contextValue = {
    client,
    transactions,
    addTransaction,
    // Add any other state variables and functions to the context value
  };

  // Provide the context value to the children components
  return (
    <PaperWalletContext.Provider value={contextValue}>
      {children}
    </PaperWalletContext.Provider>
  );
};

const usePaperWallet = () => {
  const { client, addTransaction } = useContext(PaperWalletContext);
  const [hash, setHash] = useState<string>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  // Add any custom logic or additional functions

  const transfer = async (
    voucher: {
      address: string;
      decimals: number;
    },
    recipient: {
      address: `0x${string}`;
    },
    amount: `${number}`
  ) => {
    const value = BigInt(parseUnits(amount, voucher.decimals));
    const args = [recipient.address, value] as const;
    const txHash = await client?.writeContract({
      account: client?.account as Account,
      chain: getChain(),
      address: voucher.address as `0x${string}`,
      functionName: "transfer",
      abi: parseAbi([
        "function transfer(address _to, uint256 _value) public returns (bool)",
      ]),
      args: args,
    });

    if (txHash) {
      setHash(txHash);
      addTransaction(txHash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      setReceipt(receipt);
    }
  };

  return {
    transfer,
  };
};

export default usePaperWallet;
export { PaperWalletContext, PaperWalletProvider };
