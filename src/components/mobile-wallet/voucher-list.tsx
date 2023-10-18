import { createPublicClient, http } from "viem";

import { getViemChain } from "~/lib/web3";
import { type RouterOutput } from "~/server/api/root";
import { VoucherListItem } from "../voucher/voucher-list-item";

export const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});

export const VoucherList = ({
  vouchers,
}: {
  vouchers: RouterOutput["voucher"]["all"];
}) => {
  return (
    <>
      {vouchers?.map((v, i) => (
        <VoucherListItem key={i} voucher={v} />
      ))}
    </>
  );
};
