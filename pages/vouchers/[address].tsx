import { Box, styled } from "@mui/material";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { Contract } from "../../src/components/Contract/Contract";
import { abi } from "../../src/contracts/erc20-demurrage-token/contract";
import { resolve, vouchers } from "../../src/gqty";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const selectVoucher = (voucher: vouchers) => ({
  id: voucher.id,
  voucher_address: voucher.voucher_address,
  voucher_name: voucher.voucher_name,
  voucher_description: voucher.voucher_description,
  supply: voucher.supply,
});
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers({
      where: { voucher_address: { _eq: params!.address as string } },
    }).map(selectVoucher),
  }));
  return { props: { voucher: data.vouchers[0] } };
};

const VoucherPage = ({
  voucher,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const address = router.query.address as `0x${string}`;

  return (
    <Container>
      <h1>Voucher</h1>
      {address && (
        <Contract contract={{ address: address, abi }} voucher={voucher} />
      )}
    </Container>
  );
};

export default VoucherPage;
