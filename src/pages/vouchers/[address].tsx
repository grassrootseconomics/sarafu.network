import { Box, Chip, Typography, styled, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import type { InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { formatUnits } from "viem";
import { kysely } from "~/server/db";

import { UTCTimestamp } from "lightweight-charts";
import Head from "next/head";
import StatisticsCard from "~/components/Cards/StatisticsCard";
import { LineChart } from "~/components/Charts/LineChart";
import { Theme } from "~/lib/theme";
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
  const isMD = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const txsQuery = api.transaction.infiniteTransaction.useInfiniteQuery(
    {
      voucherAddress: address,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
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
  const parseValue = (value?: bigint) => (value ? formatUnits(value, 6) : "0");
  if (!voucher) return <div>Voucher not Found</div>;

  return (
    <Container>
      <Head>
        <title>{voucher.voucher_name}</title>
        <meta
          name="description"
          content={voucher.voucher_description}
          key="desc"
        />
        <meta property="og:title" content={voucher.voucher_name} />
        <meta property="og:description" content={voucher.voucher_description} />
      </Head>
      <Typography variant="h4">{voucher.voucher_name} Voucher</Typography>
      <Grid spacing={2} container alignItems={"center"}>
        <Grid
          lg={12}
          mx={2}
          my={1}
          spacing={2}
          container
          flexGrow={1}
          alignItems={"center"}
          justifyContent={"space-evenly"}
        >
          <Grid spacing={1}>
            <StatisticsCard
              delta={parseValue(BigInt(monthlyStats?.volume.delta || 0))}
              isIncrease={(monthlyStats?.volume.delta || 0) > 0}
              value={parseValue(monthlyStats?.volume.total)}
              title="Volume"
            />
          </Grid>
          <Grid spacing={1}>
            <StatisticsCard
              delta={monthlyStats?.transactions.delta || 0}
              isIncrease={(monthlyStats?.transactions.delta || 0) > 0}
              value={monthlyStats?.transactions.total.toString() || 0}
              title="Transactions"
            />
          </Grid>
          <Grid spacing={1}>
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
          <TabsComponent
            panelSxProps={{
              overflowY: "auto",
              width: "calc(100% - 32px)",
            }}
            tabs={[
              {
                label: "Transactions",
                content: (
                  <LineChart
                    data={
                      txsPerDay?.map((v) => ({
                        time: (v.x.getTime() / 1000) as UTCTimestamp,
                        value: parseInt(v.y),
                      })) || []
                    }
                  />
                ),
              },
              {
                label: "Volume",
                content: (
                  <LineChart
                    data={
                      volumnPerDay?.map((v) => ({
                        time: (v.x.getTime() / 1000) as UTCTimestamp,
                        value: parseInt(parseValue(BigInt(v.y))),
                      })) || []
                    }
                  />
                ),
              },
              {
                label: "Map",
                content: (
                  <LocationMap
                    style={{ height: "330px", width: "100%" }}
                    value={
                      voucher.geo
                        ? { lat: voucher.geo?.x, lng: voucher.geo?.y }
                        : undefined
                    }
                  />
                ),
              },
            ]}
          />
        </Grid>
        <Grid
          xs={12}
          md={3}
          justifyContent={"center"}
          alignContent={"center"}
        ></Grid>
      </Grid>

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
                data={txsQuery.data?.pages.flatMap((p) => p.transactions) || []}
                hasMore={Boolean(
                  txsQuery.hasNextPage && !txsQuery.isFetchingNextPage
                )}
                loadMore={() => {
                  void txsQuery.fetchNextPage();
                }}
                columns={[
                  {
                    name: "date_block",
                    label: "Date",
                    renderCell(v) {
                      return v.date_block.toLocaleString();
                    },
                  },
                  {
                    name: "tx_type",
                    label: "Type",
                    renderCell(v) {
                      return (
                        <Chip
                          color={
                            v.tx_type == "TRANSFER" ? "success" : "warning"
                          }
                          label={v.tx_type?.toLowerCase()}
                        />
                      );
                    },
                  },
                  {
                    name: "sender_address",
                    label: "From",
                    renderCell(row) {
                      return isMD
                        ? truncateEthAddress(row.sender_address)
                        : row.sender_address;
                    },
                  },
                  {
                    name: "recipient_address",
                    label: "To",
                    renderCell(row) {
                      return isMD
                        ? truncateEthAddress(row.recipient_address)
                        : row.recipient_address;
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
    </Container>
  );
};

export default VoucherPage;
