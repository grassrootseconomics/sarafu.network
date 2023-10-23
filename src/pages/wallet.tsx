import { useRouter } from "next/router";
import React from "react";
import { MobileWalletLayout } from "~/components/layout";
import { Loading } from "~/components/loading";
import { useMobileNav } from "~/components/mobile-wallet/provider";
import { ExploreScreen } from "~/components/mobile-wallet/screens/explore-screen";
import { WalletScreen } from "~/components/mobile-wallet/screens/wallet-screen";
import { useUser } from "~/hooks/useAuth";
import { type NextPageWithLayout } from "~/pages/_app";

const WalletPage: NextPageWithLayout = () => {
  const user = useUser();
  const router = useRouter();
  const mobileWallet = useMobileNav();
  React.useEffect(() => {
    if (!user) {
      router.push("/").catch(console.error);
    }
  }, [user]);
  if (!user) {
    return <Loading />;
  }

  if (mobileWallet.screen === "explore") {
    return <ExploreScreen />;
  }
  if (mobileWallet.screen === "profile") {
    return <ExploreScreen />;
  }
  return <WalletScreen />;
};
WalletPage.getLayout = function getLayout(page) {
  return <MobileWalletLayout>{page}</MobileWalletLayout>;
};
export default WalletPage;
