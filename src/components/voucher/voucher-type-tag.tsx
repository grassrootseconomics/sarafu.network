import { getAddress } from "viem";
import { VoucherType } from "~/server/enums";
import { useExpiryPeriod } from "./hooks";
import { useDemurrageContract } from "./voucher-info";

export function VoucherTypeTag(props: {
  type: string;
  address: `0x${string}`;
}) {
  if (props.type === VoucherType.DEMURRAGE) {
    return <DMRVoucherTypeTag address={props.address} />;
  }
  if (props.type === VoucherType.GIFTABLE_EXPIRING) {
    return <ExpiringVoucherTypeTag address={props.address} />;
  }
  return <GiftableVoucherTypeTag />;
}
function BaseVoucherTagType({ value }: { value: string }) {
  return (
    <span className="px-3 py-1 text-sm font-semibold bg-white/20 text-white border border-white/20 rounded-full">
      {value}
    </span>
  );
}
interface VoucherTagType {
  address: `0x${string}`;
}
export function DMRVoucherTypeTag({ address }: VoucherTagType) {
  const contract = useDemurrageContract(getAddress(address));
  return (
    <BaseVoucherTagType
      value={`Expires at ${contract.demurrageRatePercentage}% over ${contract.humanPeriod}`}
    />
  );
}

export function GiftableVoucherTypeTag() {
  return <BaseVoucherTagType value="Standard" />;
}

export function ExpiringVoucherTypeTag({ address }: VoucherTagType) {
  const data = useExpiryPeriod(address);
  const text = data.hasExpired
    ? `Expired`
    : `Expires on ${data?.expires ? data.expires.toLocaleDateString() : ""}`;
  const style = data.hasExpired
    ? "bg-red-100 text-red-800"
    : "bg-blue-100 text-blue-800";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {text}
    </span>
  );
}
