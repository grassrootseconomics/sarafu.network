import { getAddress, isAddress } from "viem";
import { useBalance, useContractReads } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { type Point } from "~/server/db/db";
import { calculateDemurrageRate } from "~/utils/dmr-helpers";
import { toUserUnitsString } from "~/utils/units";
import Address from "../address";

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string | number | JSX.Element;
}) => (
  <div className="flex flex-wrap justify-between">
    <p className="text-sm font-medium leading-none  mb-2">{label}</p>
    <div className="grow  mb-2">
      {typeof value === "function" ? (
        value
      ) : (
        <p className="text-sm font-light leading-none text-end  ">{value}</p>
      )}
    </div>
  </div>
);

const useDemurrageContract = (address: `0x${string}`) => {
  const contract = {
    address: address,
    abi: abi,
  } as const;

  const data = useContractReads({
    enabled: isAddress(address),
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
    ],
  });
  return {
    sinkAddress: data.data?.[0].result as `0x${string}` | undefined,
    decayLevel: data.data?.[1].result as bigint | undefined,
    periodDuration: data.data?.[2].result as bigint | undefined,
  };
};

export function VoucherInfo({
  voucher,
  token,
}: {
  voucher: {
    voucher_name?: string;
    voucher_description?: string;
    location_name?: string | null;
    voucher_address?: string;
    geo: Point | null;
    sink_address?: string;
    demurrage_rate?: string;
  };
  token?: {
    symbol?: string;
    decimals?: number;
    totalSupply: {
      value?: bigint;
    };
  };
}) {
  const user = useUser();
  const isMounted = useIsMounted();
  const { sinkAddress, decayLevel, periodDuration } = useDemurrageContract(
    getAddress(voucher.voucher_address!)
  );

  const { data: userBalance } = useBalance({
    address: user?.account?.blockchain_address,
    token: voucher.voucher_address! as `0x${string}`,
    enabled:
      user?.account?.blockchain_address && isAddress(voucher.voucher_address!),
  });
  const { data: sinkBalance } = useBalance({
    address: sinkAddress,
    token: voucher.voucher_address! as `0x${string}`,
    enabled: sinkAddress && isAddress(voucher.sink_address!),
  });
  const periodMinutes = periodDuration
    ? BigInt(periodDuration) / BigInt(60)
    : undefined;
  const demurrageRate =
    decayLevel && periodMinutes
      ? Math.trunc(100 * calculateDemurrageRate(decayLevel, periodMinutes))
      : undefined;
  return (
    <div>
      <div className="flex gap-1 flex-col justify-between">
        <Row label="Name" value={voucher.voucher_name ?? ""} />
        <Row label="Description" value={voucher.voucher_description ?? ""} />
        <Row label="Location" value={voucher.location_name ?? ""} />
        <Row
          label="Contract Address"
          value={<Address address={voucher.voucher_address} />}
        />
        <Row
          label="Community Fund"
          value={<Address address={voucher.sink_address} />}
        />

        <Row
          label="Demurrage Rate"
          value={`${demurrageRate ? demurrageRate.toString() : "?"}%`}
        />
        <Row
          label="Redistribution Period"
          value={`${periodMinutes ? periodMinutes : "?"} mins`}
        />
        <Row
          label="Your Balance"
          value={
            isMounted
              ? `${toUserUnitsString(userBalance?.value)} ${
                  token?.symbol ?? ""
                }`
              : ""
          }
        />
        <Row
          label="Sink Balance"
          value={
            isMounted
              ? `${toUserUnitsString(sinkBalance?.value)} ${
                  token?.symbol ?? ""
                }`
              : ""
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
    </div>
  );
}
