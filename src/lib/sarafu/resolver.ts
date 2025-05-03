import { type Address } from "viem";
import { useEnsName } from "wagmi";
import { env } from "~/env";
import { trpc } from "../trpc";

type SuccessResponse = {
  ok: boolean;
  description: string;
  result: {
    address: Address;
    autoChoose: boolean;
    name: string;
  };
};

type ErrorResponse = {
  ok: false;
  description: string;
};

type Response = SuccessResponse | ErrorResponse;

export const updateENS = async (address: Address, hint: string) => {
  const response = await fetch(
    `${env.SARAFU_RESOLVER_API_URL}/api/v1/bypass/register`,
    {
      method: "POST",
      body: JSON.stringify({ address, hint }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SARAFU_RESOLVER_API_TOKEN}`,
      },
    }
  );
  const data = (await response.json()) as Response;
  if (!data.ok) {
    throw new Error(data.description);
  }
  return data.result.name;
};

export const resolveENS = async (address: Address) => {
  const response = await fetch(
    `${env.SARAFU_RESOLVER_API_URL}/api/v1/bypass/resolve?address=${address}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SARAFU_RESOLVER_API_TOKEN}`,
      },
    }
  );
  const data = (await response.json()) as Response;
  if (!data.ok) {
    return null;
  }
  return data.result;
};

export const useENS = ({ address }: { address: Address }) => {
  const ens = useEnsName({
    address,
  });
  const sarafuENS = trpc.me.ens.useQuery(
    { address },
    {
      enabled: !!address,
    }
  );
  return {
    ens,
    sarafuENS,
  };
};
