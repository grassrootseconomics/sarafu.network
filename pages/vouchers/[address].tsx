import { Box, styled } from "@mui/material";
import type { GetStaticProps, InferGetServerSidePropsType } from "next";
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

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  const { vouchers } = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers().map((v) => {
      return {
        voucher_address: v.voucher_address,
      };
    }),
  }));

  // Get the paths we want to pre-render based on posts
  const paths = vouchers.map((voucher) => ({
    params: { address: voucher.voucher_address },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: "blocking" };
}
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const data = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers({
      where: { voucher_address: { _eq: params!.address as string } },
    }).map(selectVoucher),
  }));
  return {
    props: { voucher: data.vouchers[0] },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
};

const VoucherPage = ({
  voucher,
}: InferGetServerSidePropsType<typeof getStaticProps>) => {
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
