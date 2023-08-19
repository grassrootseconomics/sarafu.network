import { Abi } from "viem";


export type ContractFunctions<ABI extends Abi> = Extract<
  ABI[number],
  { type: "function" }
>;

export type ContractWriteFunctions<ABI extends Abi> = Extract<
  ContractFunctions<ABI>,
  { stateMutability: "nonpayable" }
>;

export type ContractReadFunctions<ABI extends Abi> = Extract<
  ContractFunctions<ABI>,
  { stateMutability: "pure" | "view" }
>;

