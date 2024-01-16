import { getAddress, isAddress } from "viem";
import { useBalance, useContractReads } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { type RouterOutput } from "~/server/api/root";
import { calculateDemurrageRate } from "~/utils/dmr-helpers";
import { toUserUnitsString } from "~/utils/units";
import Address from "../address";

// Define the Row component
export const Row = ({
  label,
  value,
}: {
  label: string;
  value: string | number | JSX.Element;
}) => (
  <div className="flex flex-wrap justify-between">
    <p className="text-sm font-medium leading-none mb-2">{label}</p>
    <div className="grow mb-2">
      {typeof value === "function" ? (
        value
      ) : (
        <p className="text-sm font-light leading-none text-end">{value}</p>
      )}
    </div>
  </div>
);
function minsToHuman(mins: bigint) {
  let seconds = Number(mins) * 60;
  const years = Math.floor(seconds / 31536000),
    days = Math.floor((seconds %= 31536000) / 86400),
    hours = Math.floor((seconds %= 86400) / 3600),
    minutes = Math.floor((seconds %= 3600) / 60);

  if (days || hours || seconds || minutes) {
    return (
      (years ? years + " Year " : "") +
      (days ? days + " Days " : "") +
      (hours ? hours + "Hour " : "") +
      (minutes ? minutes + "Min " : "")
    );
  }

  return "< 1s";
}
// Define the useDemurrageContract hook
const useDemurrageContract = (address: `0x${string}`) => {
  const contract = { address, abi } as const;
  const data = useContractReads({
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
    ],
  });

  return {
    sinkAddress: data.data?.[0].result,
    decayLevel: data.data?.[1].result,
    periodDuration: data.data?.[2].result,
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
  const user = useUser();
  const isMounted = useIsMounted();
  const { sinkAddress, decayLevel, periodDuration } = useDemurrageContract(
    getAddress(voucher.voucher_address)
  );
  const userAddress = user?.account?.blockchain_address;
  const voucherAddress = voucher.voucher_address as `0x${string}`;

  const { data: userBalance } = useBalance({
    address: userAddress,
    token: voucherAddress,
    query: {
      enabled: Boolean(
        userAddress && voucherAddress && isAddress(voucherAddress)
      ),
    },
  });

  const { data: sinkBalance } = useBalance({
    address: sinkAddress,
    token: voucherAddress,
    query: { enabled: sinkAddress && isAddress(sinkAddress) },
  });

  const periodMinutes = periodDuration
    ? BigInt(periodDuration) / BigInt(60)
    : undefined;
  const demurrageRate =
    decayLevel && periodMinutes
      ? Math.trunc(100 * calculateDemurrageRate(decayLevel, periodMinutes))
      : undefined;

  return (
    <div className="flex gap-1 flex-col justify-between">
      <Row label="Name" value={voucher.voucher_name ?? ""} />
      <Row label="Description" value={voucher.voucher_description ?? ""} />
      <Row
        label="Email"
        value={
          voucher.voucher_email ? (
            <a
              href={`mailto:${voucher.voucher_email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {voucher.voucher_email}
            </a>
          ) : (
            ""
          )
        }
      />
      <Row
        label="Website"
        value={
          voucher.voucher_website ? (
            <a
              href={voucher.voucher_website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {voucher.voucher_website}
            </a>
          ) : (
            ""
          )
        }
      />
      <Row label="Location" value={voucher.location_name ?? ""} />
      <Row
        label="Contract Address"
        value={
          <Address className="break-all" address={voucher.voucher_address} />
        }
      />
      <Row
        label="Community Fund"
        value={<Address className="break-all" address={sinkAddress} />}
      />
      <Row
        label="Demurrage Rate"
        value={`${
          isMounted && demurrageRate ? demurrageRate.toString() : "?"
        }%`}
      />
      <Row
        label="Redistribution Period"
        value={`${
          isMounted && periodMinutes ? minsToHuman(periodMinutes) : "?"
        }`}
      />
      <Row
        label="Your Balance"
        value={
          isMounted
            ? `${toUserUnitsString(userBalance?.value)} ${token?.symbol ?? ""}`
            : ""
        }
      />
      <Row
        label="Community Fund Balance"
        value={
          isMounted
            ? `${toUserUnitsString(sinkBalance?.value)} ${token?.symbol ?? ""}`
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
  );
}
