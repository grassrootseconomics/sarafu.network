import { useAuth } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { useMultiVoucherBalances } from "./hooks";
import { UserVoucherBalanceItem } from "./user-voucher-balance-item";

export const UserVoucherBalanceList = ({
  vouchers,
}: {
  vouchers: RouterOutput["me"]["vouchers"];
}) => {
  const auth = useAuth();
  const balances = useMultiVoucherBalances(
    vouchers?.map((v) => v.voucher_address as `0x${string}`) ?? [],
    auth?.session?.address
  );

  return (
    <>
      {vouchers?.map((v, i) => (
        <UserVoucherBalanceItem
          key={i}
          voucher={v}
          balance={balances[v.voucher_address as `0x${string}`]}
        />
      ))}
    </>
  );
};
