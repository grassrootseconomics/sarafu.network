import type {
  Abi,
  Account,
  Address,
  Chain,
  ContractConstructorArgs,
  Hex,
  PublicClient,
  Transport,
} from "viem";

type EstimateDeployGasArgs<abi extends Abi | readonly unknown[]> =
  readonly [] extends ContractConstructorArgs<abi>
    ? { args?: ContractConstructorArgs<abi> | undefined }
    : { args: ContractConstructorArgs<abi> };

type EstimateDeployGasParameters<abi extends Abi | readonly unknown[]> = {
  abi: abi;
  bytecode: Hex;
  account?: Account | Address;
} & EstimateDeployGasArgs<abi>;

type DeploymentGasClient<
  abi extends Abi | readonly unknown[],
  t extends Transport,
  c extends Chain,
> = PublicClient<t, c> & {
  estimateContractDeploymentGas: (
    params: EstimateDeployGasParameters<abi>,
  ) => Promise<bigint>;
};

/**
 * Estimate gas for a contract deployment and add a 10% safety buffer.
 */
export async function estimateDeployGas<
  const abi extends Abi | readonly unknown[],
  t extends Transport,
  c extends Chain,
>(
  publicClient: PublicClient<t, c>,
  params: EstimateDeployGasParameters<abi>,
): Promise<bigint> {
  const client = publicClient as DeploymentGasClient<abi, t, c>;
  const estimated =
    await client.estimateContractDeploymentGas(params);
  return (estimated * 11n) / 10n;
}

/**
 * Estimate gas for a contract write call and add a 10% safety buffer.
 */
export async function estimateContractGas<
  t extends Transport,
  c extends Chain,
>(
  publicClient: PublicClient<t, c>,
  params: Parameters<PublicClient<t, c>["estimateContractGas"]>[0],
): Promise<bigint> {
  const estimated = await publicClient.estimateContractGas(params);
  return (estimated * 11n) / 10n;
}
