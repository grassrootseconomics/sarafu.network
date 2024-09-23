import { type RouterOutput } from "~/server/api/root";
import { VoucherListItem } from "./voucher-list-item";

export const VoucherList = ({
  vouchers,
}: {
  vouchers: RouterOutput["voucher"]["list"];
  showDescription?: boolean;
  showLocation?: boolean;
}) => {
  return (
    <>{vouchers?.map((v, i) => <VoucherListItem key={i} voucher={v} />)}</>
  );
};
