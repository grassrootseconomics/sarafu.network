import Link from "next/link";
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/hooks/useAuth";
import { api, type RouterOutputs } from "~/utils/api";
import { toUserUnitsString } from "~/utils/units";
import { useVoucherDetails } from "../pools/hooks";

type Transaction = RouterOutputs["transaction"]["list"]["transactions"][number];
type TransactionProps = {
  tx: Transaction;
};
export const TransactionList = ({ txs }: { txs?: Transaction[] }) => {
  return <>{txs?.map((tx, i) => <TransactionListItem key={i} tx={tx} />)}</>;
};

export const TransactionListItem = (props: TransactionProps) => {
  const auth = useAuth();
  const { data: vouchers } = api.voucher.list.useQuery();
  const voucher = vouchers?.find(
    (v) => v.voucher_address === props.tx.contract_address
  );
  const {data: details} = useVoucherDetails(props.tx.contract_address as `0x${string}`)
  const address =
    auth?.user?.account.blockchain_address === props.tx.sender_address
      ? props.tx.recipient_address
      : props.tx.sender_address;
  const received =
    auth?.user?.account.blockchain_address === props.tx.recipient_address;
  return (
    <div className="flex bg-white justify-between items-center p-3 transition-colors hover:bg-slate-200 align-middle rounded-sm space-x-4">
      <Link href={`/vouchers/${voucher?.voucher_address}`}>
        <Avatar className="flex-none">
          <AvatarImage src={voucher?.icon_url ?? "/apple-touch-icon.png"} alt="@unknown" />
          <AvatarFallback>{voucher?.symbol}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 flex-col">
        <div className="flex">
          <Address forceTruncate address={address} />
          {props.tx.success ? null : (
            <span className="ml-3 text-xs rounded-full text-white px-2 py-1 bg-red-500">
              FAILED
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {props.tx.date_block?.toLocaleTimeString([], {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div
        className={`flex-none ${received ? "text-green-500" : "text-gray-400"}`}
      >
        {received ? "+" : "-"}
        <span>{toUserUnitsString(BigInt(props.tx.transfer_value), details?.decimals)}</span>
        <Link href={`/vouchers/${voucher?.voucher_address}`}>
          <span className="pl-2 font-bold">{voucher?.symbol ?? ""}</span>
        </Link>
      </div>
    </div>
  );
};
