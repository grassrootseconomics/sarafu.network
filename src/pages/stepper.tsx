import { Box, styled } from "@mui/material";
import type { NextPage } from "next";
import { VoucherCreationStepper } from "../components/Voucher/VoucherCreationStepper";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Home: NextPage = () => {
  return (
    <Container>
      <VoucherCreationStepper />
    </Container>
  );
};

export default Home;
