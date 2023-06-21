import { Box, Card, Chip, Typography, styled } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import type { InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { formatUnits } from "viem";
import { kysely } from "~/server/db";

import StatisticsCard from "~/components/Cards/StatisticsCard";
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
      "geo",
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
      key: voucher!.id,
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
    api.transaction.byVoucher.useQuery({
      voucherAddress: address,
    });
  const { data: txsPerDay, isLoading: txsPerDayLoading } =
    api.transaction.transactionsPerDay.useQuery({
      voucherAddress: address,
    });
  const { data: volumnPerDay, isLoading: volumnPerDayLoading } =
    api.voucher.volumePerDay.useQuery({
      voucherAddress: address,
    });
  const { data: monthlyStats, isLoading: statsLoading } =
    api.voucher.monthlyStats.useQuery({
      voucherAddress: address,
    });
  const parseValue = (value?: bigint) => (value ? formatUnits(value, 6) : 0);
  if (!voucher) return <div>Voucher not Found</div>;
  return (
    <Container>
      <Typography variant="h4">{voucher.voucher_name} Voucher</Typography>
      <Grid spacing={2} container alignItems={"center"}>
        <Grid lg={12} mx={2} my={1} spacing={2} container alignItems={"center"}>
          <Grid lg={3} spacing={1}>
            <StatisticsCard
              delta={parseValue(BigInt(monthlyStats?.volume.delta || 0))}
              isIncrease={(monthlyStats?.volume.delta || 0) > 0}
              value={parseValue(monthlyStats?.volume.total)}
              title="Volume"
            />
          </Grid>
          <Grid lg={3} spacing={1}>
            <StatisticsCard
              delta={monthlyStats?.transactions.delta || 0}
              isIncrease={(monthlyStats?.transactions.delta || 0) > 0}
              value={monthlyStats?.transactions.total.toString() || 0}
              title="Transactions"
            />
          </Grid>
          <Grid lg={3} spacing={1}>
            <StatisticsCard
              delta={monthlyStats?.users.delta || 0}
              isIncrease={(monthlyStats?.users.delta || 0) > 0}
              value={monthlyStats?.users.total || 0}
              title="Active Users"
            />
          </Grid>
        </Grid>
        <Grid xs={12} md={6} justifyContent={"center"} alignContent={"center"}>
          {address && (
            <VoucherInfo
              contract={{ address: address, abi }}
              voucher={voucher}
            />
          )}
        </Grid>

        <Grid
          sx={{ display: { sm: "none", xs: "none", md: "block" } }}
          xs={12}
          md={6}
          justifyContent={"center"}
          alignContent={"center"}
        >
          <Card sx={{ minHeight: 400, m: 2, width: "calc(100% - 32px)" }}>
            {/* <Box borderBottom={1} borderColor={"lightgrey"}>
              <Typography my={1} textAlign={"center"} variant="h6">
                Transactions
              </Typography>
            </Box> */}
            {/* <div style={{ padding: "0px", height: "200px" }}>
              <DynamicChart
                getX={(x) => x.x}
                getY={(x) => Number(x.y)}
                data={txsPerDay}
                loading={txsPerDayLoading}
              />
            </div> */}
            <LocationMap
              style={{ height: "400px", width: "100%" }}
              value={
                voucher.geo
                  ? { lat: voucher.geo?.x, lng: voucher.geo?.y }
                  : undefined
              }
            />
          </Card>

          {/* <Card sx={{ minHeight: 200, m: 2, width: "100%" }}>
            <Box borderBottom={1} borderColor={"lightgrey"}>
              <Typography my={1} textAlign={"center"} variant="h6">
                Volume
              </Typography>
            </Box>
            <div style={{ padding: "0px", height: "200px" }}>
              <DynamicChart
                getX={(x) => x.x}
                getY={(x) => Number(formatUnits(BigInt(x.y), 6))}
                data={volumnPerDay}
                loading={volumnPerDayLoading}
              />
            </div>
          </Card> */}
        </Grid>
        <Grid
          xs={12}
          md={3}
          justifyContent={"center"}
          alignContent={"center"}
        ></Grid>
      </Grid>
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
