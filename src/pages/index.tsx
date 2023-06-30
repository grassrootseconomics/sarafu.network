import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { NextLinkComposed } from "~/components/Link";
import { NetworkIcon } from "../components/Icons/NetworkIcon";

const Home: NextPage = () => {
  const router = useRouter();
  return (
    <Grid container alignItems={"center"} sx={{ height: "80%" }}>
      <Grid xs={12} md={6} justifyContent={"center"} alignContent={"center"}>
        <NetworkIcon sx={{ width: "80%", maxWidth: "400px", m: "auto" }} />
      </Grid>
      <Grid xs={12} md={6}>
        <Stack
          direction="column"
          justifyContent={"center"}
          spacing={1}
          sx={{
            m: 2,
          }}
        >
          <Typography align="center" variant="h5">
            Welcome to the Sarafu Network
          </Typography>
          <Typography align="center" variant="body2">
            {
              "Discover Grassroots Economics, your partner in establishing self-empowered financial systems based on local goods and services.We're revolutionizing regional markets from the ground up. Join the Sarafu Network - Kenya's leading Economic Commons platform - and be part of our thriving, community-driven economy"
            }
          </Typography>
          <Box display={"flex"} justifyContent={"center"}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button LinkComponent={NextLinkComposed} href={"/deploy"}>
              Deploy
            </Button>
            <Button
              LinkComponent={NextLinkComposed}
              href={"https://cic-stack.grassecon.org/"}
              /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
            >
              Docs
            </Button>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Home;
