import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/utils/api";
import { toUserUnitsString } from "~/utils/units";

type Transaction = {
  tx_type: string | null;
  id: number;
  tx_hash: string;
  block_number: number;
  tx_index: number;
  voucher_address: string;
  sender_address: string;
  recipient_address: string;
  tx_value: string;
  date_block: Date;
  success: boolean;
};
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
    (v) => v.voucher_address === props.tx.voucher_address
  );
  const address =
    auth?.user?.account.blockchain_address === props.tx.sender_address
      ? props.tx.recipient_address
      : props.tx.sender_address;
  const received =
    auth?.user?.account.blockchain_address === props.tx.recipient_address;
  return (
    <div className="flex justify-between items-center p-3 transition-colors hover:bg-slate-200 align-middle rounded-sm space-x-4">
      {received ? (
        <ArrowDownRight className="text-green-400 flex-none" />
      ) : (
        <ArrowUpRight className="text-red-400 flex-none" />
      )}
      <Link href={`/vouchers/${voucher?.voucher_address}`}>
        <Avatar className="flex-none">
          <AvatarImage src="/apple-touch-icon.png" alt="@unknown" />
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
          {props.tx.date_block.toLocaleTimeString([], {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="flex-none">
        {toUserUnitsString(BigInt(props.tx.tx_value))}
        <Link href={`/vouchers/${voucher?.voucher_address}`}>
          <span className="pl-2 font-bold">{voucher?.symbol ?? "UNKNOWN"}</span>
        </Link>
      </div>
    </div>
  );
};
