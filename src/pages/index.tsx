import { BareLayout } from "~/components/layout";
import { LandingScreen } from "~/components/mobile-wallet/screens/landing-screen";
import { type NextPageWithLayout } from "~/pages/_app";

const LandingPage: NextPageWithLayout = () => {
  return <LandingScreen />;
};
LandingPage.getLayout = function getLayout(page) {
  return <BareLayout>{page}</BareLayout>;
};
export default LandingPage;
