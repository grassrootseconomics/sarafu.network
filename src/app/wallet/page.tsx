import { ContentContainer } from "~/components/layout/content-container";
import WalletHome from "~/components/wallet/WalletHome";

const WalletPage = () => {
  return (
    <ContentContainer title="Wallet" className="bg-transparent">
      <div className="w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <WalletHome />
      </div>
    </ContentContainer>
  );
};

export default WalletPage;
