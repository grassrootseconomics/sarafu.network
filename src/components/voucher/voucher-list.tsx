import { type RouterOutput } from "~/server/api/root";
import { VoucherListItem } from "./voucher-list-item";

export const VoucherList = ({
  vouchers,
}: {
  vouchers: RouterOutput["voucher"]["list"];
}) => {
  return (
    <>
      {vouchers?.map((v, i) => (
        <VoucherListItem key={i} voucher={v} />
      ))}
    </>
  );
};
