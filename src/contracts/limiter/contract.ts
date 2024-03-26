//https://github.com/grassrootseconomics/ge-publish/blob/v0.1.5/pkg/limiter/Limiter.json
export const limiterAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "address", name: "_holder", type: "address" },
    ],
    name: "limitOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
    ],
    name: "setLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "address", name: "_holder", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
    ],
    name: "setLimitFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "_sum", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
export type limiterAbiType = typeof limiterAbi;
