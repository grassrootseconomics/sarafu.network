import { Box, List, styled } from "@mui/material";
import type { InferGetStaticPropsType } from "next";
import { VoucherListItem } from "../../src/components/Voucher/VoucherListItem";
import { resolve, vouchers } from "../../src/gqty";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
`;
const selectVoucher = (voucher: vouchers) => ({
  id: voucher.id,
  voucher_address: voucher.voucher_address,
  voucher_name: voucher.voucher_name,
  voucher_description: voucher.voucher_description,
  supply: voucher.supply,
});

export const getStaticProps = async () => {
  const data = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers().map(selectVoucher),
  }));
  return {
    props: { vouchers: data.vouchers },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

const VouchersPage = ({
  vouchers,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Box>
      <List>
        {vouchers.map((voucher, idx) => (
          <VoucherListItem key={idx} voucher={voucher} />
        ))}
      </List>
    </Box>
  );
};

export default VouchersPage;
