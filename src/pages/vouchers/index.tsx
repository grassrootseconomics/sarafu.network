import { Box, List, styled } from "@mui/material";
import type { InferGetStaticPropsType } from "next";
import { kysely } from "~/server/db";
import { VoucherListItem } from "../../components/Voucher/VoucherListItem";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
`;

export const getStaticProps = async () => {
  const vouchers = await kysely
    .selectFrom("vouchers")
    .select([
      "id",
      "voucher_address",
      "voucher_name",
      "voucher_description",
      "supply",
    ])
    .execute();
  return {
    props: { vouchers },
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
