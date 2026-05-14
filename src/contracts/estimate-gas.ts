/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Estimate gas for a contract deployment and add a 10% safety buffer.
 */
export async function estimateDeployGas(
  publicClient: any,
  params: any,
): Promise<bigint> {
  const estimated =
    await publicClient.estimateContractDeploymentGas(params);
  return (estimated * 11n) / 10n;
}

/**
 * Estimate gas for a contract write call and add a 10% safety buffer.
 */
export async function estimateContractGas(
  publicClient: any,
  params: any,
): Promise<bigint> {
  const estimated = await publicClient.estimateContractGas(params);
  return (estimated * 11n) / 10n;
}
