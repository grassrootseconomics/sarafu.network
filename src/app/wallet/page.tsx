import { ContentContainer } from "~/components/layout/content-container";
import WalletHome from "~/components/wallet/WalletHome";

const WalletPage = () => {
  return (
    <ContentContainer title="Wallet">
      <div className="max-w-lg w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <WalletHome />
      </div>
    </ContentContainer>
  );
};

export default WalletPage;
