import { useAuth } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { useMultiVoucherBalances } from "./hooks";
import { VoucherListItem } from "./voucher-list-item";

export const VoucherList = ({
  vouchers,
}: {
  vouchers: RouterOutput["voucher"]["list"];
}) => {
  const auth = useAuth();
  const balances = useMultiVoucherBalances(
    vouchers?.map((v) => v.voucher_address as `0x${string}`) ?? [],
    auth?.user?.account.blockchain_address
  );
  return (
    <>
      {vouchers?.map((v, i) => (
        <VoucherListItem
          key={i}
          voucher={v}
          balance={balances[v.voucher_address as `0x${string}`]}
        />
      ))}
    </>
  );
};
