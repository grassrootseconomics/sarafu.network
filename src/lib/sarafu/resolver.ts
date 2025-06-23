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

type ENSResponse = SuccessResponse | ErrorResponse;

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
  const data = (await response.json()) as ENSResponse;
  if (!data.ok) {
    throw new Error(data.description);
  }
  return data.result.name;
};
interface ResolveENSByAddressProps {
  address: Address;
}
interface ResolveENSByNameProps {
  ensName: string;
}

type ResolveENS = ResolveENSByAddressProps | ResolveENSByNameProps;
export const resolveENS = async (query: ResolveENS) => {
  let data: ENSResponse;
  if ("address" in query) {
    const response = await fetch(
      `${env.SARAFU_RESOLVER_API_URL}/api/v1/bypass/resolve?address=${query.address}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.SARAFU_RESOLVER_API_TOKEN}`,
        },
      }
    );
    data = (await response.json()) as ENSResponse;
  } else {
    const response = await fetch(
      `${env.SARAFU_RESOLVER_API_URL}/api/v1/bypass/resolve?name=${query.ensName}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.SARAFU_RESOLVER_API_TOKEN}`,
        },
      }
    );
    data = (await response.json()) as ENSResponse;
  }
  if (!data.ok) {
    return null;
  }
  return data.result;
};

export const useENS = ({ address }: { address: Address }) => {
  const ens = useEnsName({
    address,
  });
  const sarafuENS = trpc.ens.get.useQuery(
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

export const useENSAddress = ({ ensName }: { ensName: string }) => {
  const data = trpc.ens.get.useQuery(
    { ensName },
    {
      enabled: !!ensName && ensName.endsWith(".eth"),
    }
  );
  return data;
};
