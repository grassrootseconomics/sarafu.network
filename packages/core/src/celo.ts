export const explorerUrl = () => {
  const chain = process.env.NEXT_PUBLIC_TESTNET ? "alfajores" : "mainnet";
  const explorerBaseUrl = `https://explorer.celo.org/${chain}`;

  return {
    base: explorerBaseUrl,
    token: (address: string) => {
      return `${explorerBaseUrl}/token/${address}`;
    },
  };
};

const celoscanBaseUrl = process.env.NEXT_PUBLIC_TESTNET
  ? "https://alfajores.celoscan.io"
  : "https://celoscan.io";

export const celoscanUrl = {
  base: celoscanBaseUrl,
  address: (address: string) => `${celoscanBaseUrl}/address/${address}`,
  tx: (hash: string) => `${celoscanBaseUrl}/tx/${hash}`,
};
