import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useUser } from "~/hooks/useAuth";
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
  return (
    <>
      {txs?.map((tx, i) => (
        <TransactionListItem key={i} tx={tx} />
      ))}
    </>
  );
};

export const TransactionListItem = (props: TransactionProps) => {
  const user = useUser();
  const { data: vouchers } = api.voucher.all.useQuery();
  const voucher = vouchers?.find(
    (v) => v.voucher_address === props.tx.voucher_address
  );
  const address =
    user?.account.blockchain_address === props.tx.sender_address
      ? props.tx.recipient_address
      : props.tx.sender_address;
  const received =
    user?.account.blockchain_address === props.tx.recipient_address;
  return (
    <div className="flex justify-between items-center p-3 transition-colors hover:bg-slate-200 align-middle rounded-sm space-x-4">
      {received ? (
        <ArrowUpRight className="text-green-400 flex-none" />
      ) : (
        <ArrowDownRight className="text-red-400 flex-none" />
      )}
      <Avatar className="flex-none">
        <AvatarImage src="/apple-touch-icon.png" alt="@unknown" />
        <AvatarFallback>{voucher?.symbol}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Address shrink address={address} />
      </div>
      <div className="flex-none">
        {toUserUnitsString(BigInt(props.tx.tx_value))}
        <span className="pl-2 font-bold">{voucher?.symbol ?? "UNKNOWN"}</span>
      </div>
    </div>
  );
};
