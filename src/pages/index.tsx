import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { CreatePaperDialog } from "~/components/dialogs/create-paper-wallet";
import { Icons } from "~/components/icons";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";

export const LandingPage = () => {
  const { openConnectModal } = useConnectModal();
  const isMounted = useIsMounted();
  const router = useRouter();
  const user = useUser();
  if (user) {
    router.push("/wallet").catch(console.error);
  }
  return (
    <div className="flex flex-grow flex-col justify-center items-center">
      <div className="px-[38px] py-6 pt-10 flex-col justify-center items-center gap-2.5 inline-flex self-stretch">
        <div className="text-black text-3xl font-normal font-['Inter'] leading-9">
          Karibu
        </div>
        <Icons.logo
          className="rotate-[135deg]"
          prefix="landing"
          height={"179px"}
          width={"100%"}
        />
        <div className="text-black text-3xl font-semibold font-['Inter'] leading-9">
          Sarafu Network
        </div>
      </div>
      <div
        className="self-stretch"
        style={{
          flex: "1 0 0",
        }}
      />
      <div className="flex-col justify-center items-center gap-6 inline-flex">
        <Button
          disabled={!Boolean(openConnectModal)}
          onClick={() => openConnectModal && openConnectModal()}
        >
          {openConnectModal && isMounted ? "Connect Wallet" : <Loading />}
        </Button>
        <div className="text-black text-sm font-medium font-['Inter'] leading-normal">
          or
        </div>
        <CreatePaperDialog
          button={<Button variant={"ghost"}>Create Paper Wallet</Button>}
        />
      </div>
      <div
        className="self-stretch"
        style={{
          flex: "1 0 0",
        }}
      />
    </div>
  );
};

export default LandingPage;
