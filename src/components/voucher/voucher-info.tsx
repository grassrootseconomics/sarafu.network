import { getAddress, isAddress } from "viem";
import { useReadContracts } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useBalance } from "~/contracts/react";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { type RouterOutput } from "~/server/api/root";
import { calculateDemurrageRate } from "~/utils/dmr-helpers";
import { minsToHuman, toUserUnitsString } from "~/utils/units";
import Address from "../address";
import { InfoIcon } from "../info-icon";

import type { JSX } from "react";
import { VoucherType } from "~/server/enums";

// Define the Row component
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

// Define the VoucherInfo component
export function VoucherInfo({
  voucher,
  token,
}: {
  voucher: Exclude<RouterOutput["voucher"]["byAddress"], undefined>;
  token?: {
    symbol?: string;
    decimals?: number;
    totalSupply: { value?: bigint };
  };
}) {
  const auth = useAuth();
  const isMounted = useIsMounted();
  const contract = useDemurrageContract(
    getAddress(voucher?.voucher_address ?? "")
  );
  const userAddress = auth?.session?.address;
  const voucherAddress = voucher?.voucher_address as `0x${string}`;

  const { data: userBalance } = useBalance({
    address: userAddress,
    token: voucherAddress,
  });

  const { data: sinkBalance } = useBalance({
    address: contract.sinkAddress,
    token: voucherAddress,
  });

  return (
    <div className="flex gap-1 flex-col justify-between">
      <Row label="Name" value={contract.name ?? ""} />
      <Row
        label="Email"
        value={
          voucher?.voucher_email ? (
            <a
              href={`mailto:${voucher?.voucher_email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {voucher?.voucher_email}
            </a>
          ) : (
            ""
          )
        }
      />
      <Row
        label="Website"
        value={
          voucher?.voucher_website ? (
            <a
              href={voucher?.voucher_website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {voucher?.voucher_website}
            </a>
          ) : (
            ""
          )
        }
      />
      <Row label="Location" value={voucher?.location_name ?? ""} />
      <Row
        label="Contract Address"
        value={
          <Address className="break-all" address={voucher?.voucher_address} />
        }
      />
      <Row
        label="Owner"
        value={<Address className="break-all" address={contract.owner} />}
      />
      {voucher?.voucher_type === VoucherType.DEMURRAGE && (
        <>
          <Row
            label="Community Fund"
            info={"The address where decayed CAVs are sent to."}
            value={
              <Address className="break-all" address={contract.sinkAddress} />
            }
          />
          <Row
            label="Demurrage Rate"
            info="The rate at which the CAV decays."
            value={`${
              isMounted && contract.demurrageRatePercentage
                ? contract.demurrageRatePercentage.toString()
                : "?"
            }%`}
          />
          <Row
            label="Redistribution Period"
            info="The period after which the decayed CAVs are redistributed to the community fund."
            value={`${
              isMounted && contract.humanPeriod ? contract.humanPeriod : "?"
            }`}
          />
          <Row
            label="Community Fund Balance"
            value={
              isMounted
                ? `${sinkBalance?.formatted} ${token?.symbol ?? ""}`
                : ""
            }
          />
        </>
      )}
      <Row
        label="Your Balance"
        value={
          isMounted ? `${userBalance?.formatted} ${token?.symbol ?? ""}` : ""
        }
      />

      <Row
        label="Total Supply"
        value={
          isMounted
            ? `${toUserUnitsString(
                token?.totalSupply.value,
                token?.decimals
              )} ${token?.symbol ?? ""}`
            : ""
        }
      />
    </div>
  );
}
