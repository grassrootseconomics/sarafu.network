import { Box, styled } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import type { NextPage } from "next";
import ContractDeploymentForm from "../components/ContractDeploymentForm";
import { Loading } from "../components/Loading";
import { useDeploy } from "../hooks/useDeploy";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Home: NextPage = () => {
  const { deploy, loading, error, receipt, hash, info } = useDeploy();

  return (
    <Container>
      <Grid container alignItems={"center"}>
        <Grid xs={12} justifyContent={"center"}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <ContractDeploymentForm onSubmit={deploy} />
        </Grid>
      </Grid>
      {loading && <Loading status={info} />}
      {hash && <p>Transaction Hash: {hash}</p>}
      {receipt && <div>Contract Address: {receipt?.contractAddress}</div>}
      {error && <p>Error: {error.message}</p>}
    </Container>
  );
};

export default Home;
