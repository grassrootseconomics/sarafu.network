/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Box, Card, List, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import type { InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";
import { SearchField } from "~/components/Inputs/SearchField";
import { kysely } from "~/server/db";
import { VoucherListItem } from "../../components/Voucher/VoucherListItem";
const Map = dynamic(() => import("../../components/Map"), {
  ssr: false,
});
export const getStaticProps = async () => {
  const vouchers = await kysely
    .selectFrom("vouchers")
    .select([
      "id",
      "voucher_address",
      "voucher_name",
      "voucher_description",
      "symbol",
      "supply",
      "geo",
    ])
    .execute();
  return {
    props: { vouchers },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 60 seconds
    revalidate: 60, // In seconds
  };
};

const VouchersPage = ({
  vouchers,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const [filteredVouchers, setFilteredVouchers] = React.useState(vouchers);
  React.useEffect(() => {
    setFilteredVouchers(
      vouchers.filter((voucher) =>
        voucher.voucher_name?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [vouchers, search]);
  return (
    <Grid container spacing={2} m={1}>
      <Grid xs={12} md={6} lg={4}>
        <Typography p={2} textAlign={"center"} color={"lightgrey"} variant="h5">
          Vouchers
        </Typography>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <SearchField
            value={search}
            onChange={(v) => setSearch(v)}
            sx={{
              m: 2,
              width: "calc(100% - 32px)",
            }}
          />
        </Box>
        <List
          dense={true}
          sx={{ height: "calc(100vh - 260px)", overflowY: "auto" }}
        >
          {filteredVouchers.map((voucher, idx) => (
            <Card key={idx} sx={{ my: 2, mx: 1 }}>
              <VoucherListItem sx={{ py: 0 }} voucher={voucher} />
            </Card>
          ))}
        </List>
      </Grid>
      <Grid
        sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
        xs={12}
        md={6}
        lg={8}
        justifyContent={"center"}
        alignContent={"center"}
      >
        <Card
          sx={{
            m: 2,
            width: "calc(100% - 32px)",
          }}
        >
          <Map
            style={{ height: "calc(100vh - 120px)", width: "100%" }}
            items={filteredVouchers}
            // This seems to be a bug with nextjs dynamic import and typescript
            // @ts-ignore
            getTooltip={(item: (typeof filteredVouchers)[0]) => {
              return item.voucher_name || "";
            }}
            // @ts-ignore
            onItemClicked={(item: (typeof filteredVouchers)[0]) => {
              console.log(item);
              void router.push(`/vouchers/${item.voucher_address}`);
            }}
            // @ts-ignore
            getLatLng={(item: (typeof filteredVouchers)[0]) => {
              return item.geo
                ? [item.geo.x, item.geo.y]
                : [-3.654593340629959, 39.85153198242188];
            }}
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default VouchersPage;
