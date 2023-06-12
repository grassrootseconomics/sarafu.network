import { Box, Card, Chip, Typography, styled } from "@mui/material";
import type { InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { formatUnits } from "viem";
import DataTable from "../../src/components/DataGrid";
import TabsComponent from "../../src/components/Tabs";
import { VoucherInfo } from "../../src/components/Voucher/VoucherInfo";
import { abi } from "../../src/contracts/erc20-demurrage-token/contract";
import { order_by, resolve, useQuery, vouchers } from "../../src/gqty";
import { truncateEthAddress } from "../../src/utils/dmr-helpers";

const LocationMap = dynamic(() => import("../../src/components/LocationMap"), {
  ssr: false,
});
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
  demurrage_rate: voucher.demurrage_rate,
  location_name: voucher.location_name,
  geo: voucher.geo,
  sink_address: voucher.sink_address,
  symbol: voucher.symbol,
  backers: voucher.voucher_backers().map((backer) => ({
    id: backer.id,
  })),
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
export const getStaticProps = async ({ params }: any) => {
  const data = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers({
      where: { voucher_address: { _eq: params!.address as string } },
    }).map(selectVoucher),
  }));
  return {
    props: { voucher: data.vouchers[0] },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 60 seconds
    revalidate: 60, // In seconds
  };
};

const VoucherPage = ({
  voucher,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const query = useQuery();
  const address = router.query.address as `0x${string}`;

  return (
    <Container>
      <Typography variant="h5">{voucher.voucher_name} Voucher</Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          flexWrap: {
            xs: "wrap",
            md: "nowrap",
          },
        }}
      >
        {address && (
          //@ts-ignore
          <VoucherInfo contract={{ address: address, abi }} voucher={voucher} />
        )}
        <Card sx={{ minHeight: 300, m: 2, width: "100%" }}>
          <LocationMap
            value={voucher.geo
              ?.slice(1, -1)
              .split(",")
              .map((v: string) => parseFloat(v))}
          />
        </Card>
      </Box>
      <Card sx={{ m: 2, width: "calc(100% - 2 * 16px)" }}>
        <TabsComponent
          tabs={[
            {
              label: "Transactions",
              content: (
                <DataTable
                  data={query
                    .transactions({
                      where: {
                        voucher_address: { _eq: address },
                      },
                      order_by: [{ date_block: order_by.desc_nulls_first }],
                    })
                    .map((transaction) => ({
                      id: transaction.id,
                      sender_address: transaction.sender_address,
                      recipient_address: transaction.recipient_address,
                      tx_value: transaction.tx_value,
                      success: transaction.success,
                      tx_hash: transaction.tx_hash,
                      date_block: transaction.date_block,
                    }))}
                  columns={[
                    {
                      name: "date_block",
                      label: "Date",
                    },
                    {
                      name: "sender_address",
                      label: "From",
                      renderCell(row) {
                        return truncateEthAddress(row.sender_address);
                      },
                    },
                    {
                      name: "recipient_address",
                      label: "To",
                      renderCell(row) {
                        return truncateEthAddress(row.recipient_address);
                      },
                    },
                    {
                      name: "tx_value",
                      label: "Value",
                      renderCell(row) {
                        return row.tx_value
                          ? formatUnits(row.tx_value, 6).toString()
                          : 0;
                      },
                    },
                    {
                      name: "success",
                      label: "Success",
                      renderCell: (v) => (
                        <Chip
                          color={v.success ? "success" : "error"}
                          label={v.success ? "Success" : "Failed"}
                        />
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: "Marketplace",
              content: <div></div>,
            },
          ]}
        />
      </Card>
    </Container>
  );
};

export default VoucherPage;
