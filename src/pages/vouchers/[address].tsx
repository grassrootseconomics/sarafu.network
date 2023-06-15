import { Box, Card, Chip, Typography, styled } from "@mui/material";
import type { InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { formatUnits } from "viem";
import { DynamicChart } from "~/components/Charts/Dynamic";
import { kysely } from "~/server/db";
import { api } from "~/utils/api";
import DataTable from "../../components/DataGrid";
import TabsComponent from "../../components/Tabs";
import { VoucherInfo } from "../../components/Voucher/VoucherInfo";
import { abi } from "../../contracts/erc20-demurrage-token/contract";
import { truncateEthAddress } from "../../utils/dmr-helpers";

const LocationMap = dynamic(() => import("../../components/LocationMap"), {
  ssr: false,
});
const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  const vouchers = await kysely
    .selectFrom("vouchers")
    .select("voucher_address")
    .execute();

  // Get the paths we want to pre-render based on posts
  const paths = vouchers.map((voucher) => ({
    params: { address: voucher.voucher_address },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: "blocking" };
}
export const getStaticProps = async ({
  params,
}: {
  params: { address: string };
}) => {
  const voucher = await kysely
    .selectFrom("vouchers")
    .select([
      "id",
      "voucher_address",
      "voucher_name",
      "voucher_description",
      "supply",
      "demurrage_rate",
      "location_name",
      "sink_address",
      "symbol",
    ])
    .where("voucher_address", "=", params.address)
    .executeTakeFirst();
  return {
    props: {
      voucher,
    },
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
  const address = router.query.address as `0x${string}`;
  const { data: txs, isLoading: txsLoading } =
    api.transaction.getAll.useQuery();
  const { data: txsPerDay, isLoading: txsPerDayLoading } =
    api.transaction.transactionsPerDay.useQuery({
      voucherAddress: address,
    });
  console.log(txsPerDay);
  if (!voucher) return <div>Voucher not Found</div>;
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
          <VoucherInfo contract={{ address: address, abi }} voucher={voucher} />
        )}
        <Card sx={{ minHeight: 300, m: 2, width: "100%" }}>
          <div style={{ padding: "0px", height: "340px" }}>
            <DynamicChart data={txsPerDay} loading={txsPerDayLoading} />
          </div>
          {/* <LocationMap
            value={voucher.geo
              ?.slice(1, -1)
              .split(",")
              .map((v: string) => parseFloat(v))}
          /> */}
        </Card>
      </Box>
      <Card
        sx={{
          m: 2,
          width: "calc(100% - 2 * 16px)",
        }}
      >
        <TabsComponent
          panelSxProps={{
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          }}
          tabs={[
            {
              label: "Transactions",
              content: (
                <DataTable
                  data={txs || []}
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
                          ? formatUnits(BigInt(row.tx_value), 6).toString()
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
