import { getAddress, isAddress } from "viem";
import { useReadContracts, useToken } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useBalance } from "~/contracts/react";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { type RouterOutput } from "~/server/api/root";
import { calculateDemurrageRate } from "~/utils/dmr-helpers";
import { minsToHuman } from "~/utils/units/time";
import { toUserUnitsString } from "~/utils/units/token";
import Address from "../address";
import { InfoIcon } from "../info-icon";

import type { JSX } from "react";
import { VoucherType } from "~/server/enums";

export const Row = ({
  label,
  value,
  info,
}: {
  label: string;
  value: string | number | JSX.Element;
  info?: string;
}) =>
  value ? (
    <div className="flex flex-wrap justify-between">
      <div className="text-sm font-medium leading-none mb-2">
        {label}
        {info && (
          <span>
            <InfoIcon content={info} />
          </span>
        )}
      </div>
      <div className="grow flex mb-2 justify-end items-center ">
        {typeof value === "function" ? (
          value
        ) : (
          <p className="text-sm font-light leading-none text-end">{value}</p>
        )}
      </div>
    </div>
  ) : undefined;

export const useDemurrageContract = (address: `0x${string}`) => {
  const contract = { address, abi } as const;
  const data = useReadContracts({
    query: { enabled: address && isAddress(address) },
    contracts: [
      {
        ...contract,
        functionName: "sinkAddress",
      },
      {
        ...contract,
        functionName: "decayLevel",
      },
      {
        ...contract,
        functionName: "periodDuration",
      },
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "totalSupply",
      },
      {
        ...contract,
        functionName: "decimals",
      },
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "owner",
      },
    ],
  });
  const sinkAddress = data.data?.[0].result;
  const decayLevel = data.data?.[1].result;
  const periodDuration = data.data?.[2].result;
  const symbol = data.data?.[3].result;
  const totalSupply = data.data?.[4].result;
  const decimals = data.data?.[5].result;
  const name = data.data?.[6].result;
  const owner = data.data?.[7].result;

  const periodMinutes = periodDuration
    ? BigInt(periodDuration) / BigInt(60)
    : undefined;
  const demurrageRate =
    decayLevel && periodMinutes
      ? Math.trunc(100 * calculateDemurrageRate(decayLevel, periodMinutes))
      : undefined;

  return {
    sinkAddress: sinkAddress,
    demurrageRatePercentage: demurrageRate,
    humanPeriod: periodMinutes ? minsToHuman(periodMinutes) : undefined,
    symbol: symbol,
    totalSupply: totalSupply,
    decimals: decimals,
    name: name,
    owner: owner,
  };
};

