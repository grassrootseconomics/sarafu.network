import type { Session } from "@grassroots/auth";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { type GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { sessionOptions } from "@grassroots/auth";
import { getIronSession } from "iron-session";

import { ConnectButton } from "~/components/buttons/connect-button";
import { CreatePaperDialog } from "~/components/dialogs/create-paper-wallet";
import { LandingPageLayout } from "~/components/layout/landing-layout";
import { NetworkIcon } from "~/components/network-icon";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<Session>(req, res, sessionOptions);
  const user = session.user;

  if (user) {
    res.setHeader("location", "/wallet");
    res.statusCode = 302;
    res.end();
    return {
      props: {},
    };
  }
  return {
    props: {},
  };
};
export const LandingPage = () => {
  const router = useRouter();
  const auth = useAuth();
  useEffect(() => {
    if (auth?.user) {
      router.push("/wallet").catch(console.error);
    }
  }, [auth?.user]);
  return (
    <div className="container mx-auto my-auto flex min-h-[calc(100vh-40px)] max-w-[80rem] flex-col justify-evenly lg:min-h-[unset]">
      <div className="flex w-full flex-col-reverse items-center justify-evenly gap-4 md:flex-row">
        <div className="grow-1 flex w-full flex-col gap-4">
          <div className="flex h-full flex-col justify-between">
            <h1 className="my-2 inline-block bg-gradient-to-r from-blue-600 to-blue-200 bg-clip-text text-[2rem] font-extrabold text-transparent md:text-[2.6rem]">
              Transforming local economies
            </h1>
            <div className="mt-2 max-w-[450px]">
              Unlock a world of economic empowerment with Sarafu Network&apos;s
              digital vouchers. Our platform revolutionizes local economies by
              facilitating seamless exchanges of goods and services within
              communities.
            </div>
          </div>
          <div className="my-4 flex flex-col items-center justify-start gap-2 sm:my-10 sm:flex-row sm:gap-6">
            <ConnectButton />
            <div className="font-['Inter'] text-sm font-medium leading-normal text-gray-400">
              or
            </div>
            <CreatePaperDialog
              button={<Button variant={"outline"}>Create Paper Wallet</Button>}
            />
          </div>
        </div>
        <div className="flex w-[50%] items-center">
          <NetworkIcon className="size-full" />
        </div>
      </div>

      <div className="flex flex-row flex-wrap items-center justify-evenly gap-4">
        <HomeStats title="Vouchers" count="120" />
        <HomeStats title="Active Members" count="1,500" />
        <HomeStats title="Transactions" count="300K" />
      </div>
      <div className="mt-4">
        <h2 className="font-bold text-blue-400">As Seen In</h2>
        <div className="my-4 flex h-10 items-center justify-start gap-8 [&>*]:h-[35px] md:[&>*]:h-[50px]">
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.bbc.co.uk/programmes/p05zw020"
          >
            <Image
              width="150"
              height="100"
              className="mb-2 h-full object-contain"
              src="/media/bbc.png"
              alt="BBC"
            />
          </a>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.youtube.com/watch?v=UpCr8-3K05E"
          >
            <Image
              width="150"
              height="100"
              className="mb-4 h-full object-contain"
              src="/media/aljazeera.png"
              alt="Al Jazeera"
            />
          </a>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.bloomberg.com/news/features/2018-10-31/closing-the-cash-gap-with-cryptocurrency"
          >
            <Image
              width="150"
              height="100"
              className="h-full object-contain py-2"
              src="/media/bloomberg.png"
              alt="Bloomberg"
            />
          </a>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="font-bold text-blue-400">Our Partners</h2>
        <div className="my-4 grid h-8 grid-cols-2 items-center justify-start gap-8 sm:grid-cols-4 md:h-14 [&>*]:h-[50px]">
          <Image
            width="150"
            height="100"
            src="/partners/celo.png"
            alt="Celo"
            className="object-contain"
          />
          <Image
            width="150"
            height="100"
            className="object-contain"
            src="/partners/mustardseed.png"
            alt="Mustard Seed"
          />
          <Image
            width="150"
            height="100"
            className="object-contain"
            src="/partners/kenya-red-cross.png"
            alt="Kenya Red Cross"
          />
          <Image
            width="150"
            height="100"
            className="object-contain"
            src="/partners/schumacher-center.png"
            alt="Schumacher Center for a new economics"
          />
        </div>
      </div>
    </div>
  );
};
function HomeStats({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex w-fit flex-col items-center justify-between">
      <div className="text-3xl font-extrabold text-blue-300">{count}</div>
      <div className="text-nowrap text-lg font-semibold text-gray-400">
        {title}
      </div>
    </div>
  );
}

LandingPage.getLayout = function getLayout(page: ReactElement) {
  return <LandingPageLayout>{page}</LandingPageLayout>;
};
export default LandingPage;
