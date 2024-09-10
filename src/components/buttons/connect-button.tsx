import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { Loading } from "../loading";
import { Button } from "../ui/button";

export const ConnectButton = () => {
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const user = useAuth();
  const isMounted = useIsMounted();

  const isDisabled = !openConnectModal || !isMounted || Boolean(user);
  const buttonText = user ? "Connected" : "Connect Wallet";

  return (
    <Button
      className="bg-gradient-to-r from-blue-500 to-blue-300"
      disabled={isDisabled}
      onClick={openConnectModal}
    >
      {connectModalOpen ? <Loading /> : buttonText}
    </Button>
  );
};
