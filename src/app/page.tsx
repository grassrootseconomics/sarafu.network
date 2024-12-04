import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { ConnectButton } from "~/components/buttons/connect-button";
import { CreatePaperDialog } from "~/components/dialogs/create-paper-wallet";
import { NetworkIcon } from "~/components/network-icon";
import { Button } from "~/components/ui/button";

export default function LandingPage() {
  return (
    <div className="container flex flex-col max-w-[80rem] mx-auto min-h-[calc(100vh-40px)] lg:min-h-[unset] justify-evenly my-auto">
      <div className="flex md:flex-row flex-col-reverse items-center gap-4  w-full justify-evenly">
        <div className="flex flex-col gap-4 grow-1 w-full">
          <div className="flex flex-col justify-between h-full">
            <h1 className="bg-gradient-to-r text-[2rem] md:text-[2.6rem] font-extrabold from-blue-600 to-blue-200 inline-block text-transparent bg-clip-text my-2">
              Transforming local economies
            </h1>
            <div className="mt-8 max-w-[450px] text-gray-700">
              <p className="mb-4">
                Unlock a world of{" "}
                <strong className="text-blue-600">Economic Commons</strong> by
                formalizing and pooling commitments. With Sarafu.Network, you
                can create vouchers to represent your future commitments—like
                gift cards for products or services—or to certify completed
                community achievements.
              </p>
              <p className="mb-6">
                These commitments come together in shared pools, allowing
                communities to seamlessly swap valuable assets, goods, and
                services.
              </p>
              <div className="flex items-center space-x-2">
                <a
                  href="https://www.youtube.com/playlist?list=PLPUExzwZAUpbHaJU7TIku7vpZ6q_yggQZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-2 border border-transparent"
                >
                  <PlayCircle className="size-4 mr-2" />
                  Watch to get started
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-start items-center my-4 sm:my-10 gap-2 sm:gap-6">
            <ConnectButton />
            <div className="text-gray-400 text-sm font-medium font-['Inter'] leading-normal">
              or
            </div>
            <CreatePaperDialog
              button={<Button variant={"outline"}>Create Paper Wallet</Button>}
            />
          </div>
        </div>
        <div className="flex items-center w-[50%]">
          <NetworkIcon className="size-full" />
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-evenly items-center flex-wrap">
        <HomeStats title="Vouchers" count="220" />
        <HomeStats title="Pools" count="30" />
        <HomeStats title="Active Members" count="3,500" />
        <HomeStats title="P2P Transactions" count="1,200,000" />
      </div>
      <div className="mt-4">
        <h2 className="font-bold text-blue-400">As Seen In</h2>
        <div className="flex justify-start gap-8 items-center h-10 my-4 [&>*]:h-[35px] md:[&>*]:h-[50px]">
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.bbc.co.uk/programmes/p05zw020"
          >
            <Image
              width="150"
              height="100"
              className="mb-2 object-contain h-full"
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
              className="mb-4 object-contain  h-full"
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
              className="py-2 object-contain  h-full"
              src="/media/bloomberg.png"
              alt="Bloomberg"
            />
          </a>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="font-bold text-blue-400">Our Partners</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 h-8 justify-start gap-8 md:h-14 items-center my-4 [&>*]:h-[50px]">
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
}
function HomeStats({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex flex-col items-center justify-between w-fit">
      <div className="text-3xl font-extrabold text-blue-300">{count}</div>
      <div className="text-lg text-gray-400 font-semibold text-nowrap	">
        {title}
      </div>
    </div>
  );
}
