import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useIsMounted } from "~/hooks/useIsMounted";
import { Loading } from "../loading";
import { Button } from "../ui/button";

export const ConnectButton = () => {
  const { openConnectModal } = useConnectModal();
  const isMounted = useIsMounted();
  return (
    <Button
      className="bg-gradient-to-r from-blue-500 to-blue-300"
      disabled={!Boolean(openConnectModal)}
      onClick={() => openConnectModal && openConnectModal()}
    >
      {openConnectModal && isMounted ? "Connect Wallet" : <Loading />}
    </Button>
  );
};
