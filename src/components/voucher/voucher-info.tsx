import { type Point } from "kysely-codegen";
import { useBalance } from "wagmi";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useUser } from "~/hooks/useUser";
import { toUserUnitsString } from "~/utils/units";
import { explorerUrl } from "../../utils/celo";
import Address from "../address";

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

  const { data: balance } = useBalance({
    address: user.account.address,
    token: voucher.voucher_address! as `0x${string}`,
  });

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
          label="Sink Address"
          value={<Address address={voucher.sink_address} />}
        />
        <Row
          label="Your Balance"
          value={
            isMounted
              ? `${toUserUnitsString(balance?.value)} ${token?.symbol ?? ""}`
              : ""
          }
        />
        <Row
          label="Demurrage Rate"
          value={`${
            voucher?.demurrage_rate
              ? parseFloat(voucher?.demurrage_rate) * 100
              : "?"
          }%`}
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
      <div className="text-center mt-auto">
        <a
          target="_blank"
          href={explorerUrl().token(voucher.voucher_address! as `0x${string}`)}
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
}
