import { useQuery } from "@tanstack/react-query";
import {
  readContract as wagmiReadContract,
  writeContract as wagmiWriteContract,
  type Config as WagmiConfig,
} from "@wagmi/core";
import {
  concatHex,
  createPublicClient,
  encodeFunctionData,
  getAddress,
  http,
  pad,
  parseAbiItem,
  zeroAddress,
  type Abi,
  type Hex,
} from "viem";
import { celo } from "viem/chains";
import { proposeSafeTx } from "~/contracts/safe-service";

const client = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});
type Address = `0x${string}`;
// Minimal ABIs
const SAFE_GET_OWNERS = parseAbiItem(
  "function getOwners() view returns (address[])"
);
const SAFE_GET_THRESHOLD = parseAbiItem(
  "function getThreshold() view returns (uint256)"
);
export const SAFE_NONCE = parseAbiItem(
  "function nonce() view returns (uint256)"
);
export const SAFE_GET_TX_HASH = parseAbiItem(
  "function getTransactionHash(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 _nonce) view returns (bytes32)"
);
const SAFE_APPROVE_HASH = parseAbiItem(
  "function approveHash(bytes32 hashToApprove)"
);
const SAFE_EXEC_TRANSACTION = parseAbiItem(
  "function execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures) payable returns (bool success)"
);
// Old multisig variants (Gnosis MultiSigWallet-style)
const OLD_REQUIRED = parseAbiItem("function required() view returns (uint256)");
const OLD_GET_OWNERS = parseAbiItem(
  "function getOwners() view returns (address[])"
);
const OLD_SUBMIT_TRANSACTION = parseAbiItem(
  "function submitTransaction(address destination,uint256 value,bytes data) returns (uint256 transactionId)"
);

export async function detectMultisigOnChain(addr: `0x${string}`) {
  const address = getAddress(addr);
  const code = await client.getBytecode({ address });
  if (!code) return { isContract: false, isMultisig: false };

  // Try Safe
  try {
    const [owners, threshold] = await Promise.all([
      client.readContract({
        address,
        abi: [SAFE_GET_OWNERS],
        functionName: "getOwners",
      }) as Promise<`0x${string}`[]>,
      client.readContract({
        address,
        abi: [SAFE_GET_THRESHOLD],
        functionName: "getThreshold",
      }),
    ]);
    return {
      isContract: true,
      isMultisig: true,
      multisigType: "Safe",
      owners,
      threshold: Number(threshold),
    };
  } catch {}

  // Try legacy Gnosis/Celo multisig shape
  try {
    const [owners, required] = await Promise.all([
      client.readContract({
        address,
        abi: [OLD_GET_OWNERS],
        functionName: "getOwners",
      }) as Promise<`0x${string}`[]>,
      client.readContract({
        address,
        abi: [OLD_REQUIRED],
        functionName: "required",
      }),
    ]);
    return {
      isContract: true,
      isMultisig: true,
      multisigType: "LegacyMultisig",
      owners,
      threshold: Number(required),
    };
  } catch {}

  // If you want to treat any contract wallet as “multisig-like”, probe EIP-1271:
  // If isValidSignature exists and returns the magic value, it’s a contract wallet that verifies signatures.
  return { isContract: true, isMultisig: false };
}

export async function isUserOwnerOnChain(
  addr: `0x${string}`,
  user: `0x${string}`
) {
  const info = await detectMultisigOnChain(addr);
  if (!info.isMultisig) return { isOwner: false, info };
  const isOwner = info.owners?.some(
    (o) => o.toLowerCase() === user.toLowerCase()
  );
  return { isOwner, info };
}

export const useMultisig = (addr: `0x${string}`) => {
  const info = useQuery({
    queryKey: ["multisig", addr],
    queryFn: () => detectMultisigOnChain(addr),
    enabled: !!addr,
  });
  return info;
};

// Owner-call execution helpers

export type OwnerCall = {
  ownedContract: Address;
  ownedContractAbi: Abi;
  functionName: string;
  args?: unknown[];
  value?: bigint;
};

function encodeOwnerCallData(
  ownedContractAbi: Abi,
  functionName: string,
  args?: unknown[]
): Hex {
  return encodeFunctionData({
    abi: ownedContractAbi,
    functionName: functionName,
    args: args ?? [],
  });
}

async function execViaSafeSingleOwner(
  config: WagmiConfig,
  safe: Address,
  from: Address,
  params: { to: Address; data: Hex; value?: bigint }
) {
  const operation = 0; // CALL
  const safeTxGas = 0n; // let Safe handle
  const baseGas = 0n;
  const gasPrice = 0n;
  const gasToken = zeroAddress as Address;
  const refundReceiver = zeroAddress as Address;
  const value = params.value ?? 0n;
  const nonce = await wagmiReadContract(config, {
    address: safe,
    abi: [SAFE_NONCE],
    functionName: "nonce",
  });

  const txHash = await wagmiReadContract(config, {
    address: safe,
    abi: [SAFE_GET_TX_HASH],
    functionName: "getTransactionHash",
    args: [
      params.to,
      value,
      params.data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce,
    ],
  });

  // Pre-approve hash for this owner (safe pattern for pre-validated sigs)
  await wagmiWriteContract(config, {
    address: safe,
    abi: [SAFE_APPROVE_HASH],
    functionName: "approveHash",
    args: [txHash],
  });

  // Build pre-validated signature for `from` owner
  const r = pad(from, { size: 32 });
  const s = pad("0x0", { size: 32 });
  const v = pad("0x01", { size: 1 });
  const signatures = concatHex([r, s, v]);

  const hash = await wagmiWriteContract(config, {
    address: safe,
    abi: [SAFE_EXEC_TRANSACTION],
    functionName: "execTransaction",
    args: [
      params.to,
      value,
      params.data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures,
    ],
  });
  return hash;
}

async function submitViaLegacyMultisig(
  config: WagmiConfig,
  multisig: Address,
  params: { to: Address; data: Hex; value?: bigint }
) {
  const hash = await wagmiWriteContract(config, {
    address: multisig,
    abi: [OLD_SUBMIT_TRANSACTION],
    functionName: "submitTransaction",
    args: [params.to, params.value ?? 0n, params.data],
  });
  return hash;
}

export async function ownerWriteContract(
  config: WagmiConfig,
  caller: Address,
  call: OwnerCall
) {
  const target = call.ownedContract;
  // Try to read owner() from target contract
  let owner: Address | undefined;
  try {
    owner = (await wagmiReadContract(config, {
      address: target,
      abi: call.ownedContractAbi,
      functionName: "owner",
    })) as Address;
  } catch {
    throw new Error(
      "ownerWriteContract: target ABI must include owner() view address"
    );
  }

  const info = await detectMultisigOnChain(owner);
  const data = encodeOwnerCallData(
    call.ownedContractAbi,
    call.functionName,
    call.args
  );

  if (!info.isMultisig) {
    return wagmiWriteContract(config, {
      address: target,
      abi: call.ownedContractAbi,
      functionName: call.functionName,
      args: call.args ?? [],
      value: call.value,
    });
  }

  if (info.multisigType === "Safe") {
    // Verify caller is an owner of the Safe
    const isOwner = info.owners?.some(
      (o) => o.toLowerCase() === caller.toLowerCase()
    );
    if (!isOwner) {
      throw new Error(
        `Caller ${caller} is not an owner of the Safe multisig ${owner}. ` +
          `Current owners: ${info.owners?.join(", ") ?? "none"}`
      );
    }

    if ((info.threshold ?? 0) <= 1) {
      return execViaSafeSingleOwner(config, owner, caller, {
        to: target,
        data,
        value: call.value,
      });
    } else {
      // If a Safe Tx Service URL is configured, propose the transaction for co-signing.
      const result = await proposeSafeTx(config, caller, {
        safe: owner,
        to: target,
        data,
        value: call.value,
      });
      // Return a pseudo-hash with prefix so UIs can display a proposed state
      // without treating it as an on-chain tx hash.
      return `proposed:${result.safeTxHash}` as Hex;
    }
  }

  // Legacy multisig path (on-chain proposal)
  return submitViaLegacyMultisig(config, owner, {
    to: target,
    data,
    value: call.value,
  });
}
