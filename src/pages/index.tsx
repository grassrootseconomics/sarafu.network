import type { NextPage } from "next";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { NetworkIcon } from "../components/network-icon";

const Home: NextPage = () => {
  return (
    <div className="max-w-[1200px] m-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-[80vh]">
      <div className="col-span-1">
        <NetworkIcon
          style={{
            width: "80%",
            maxWidth: "400px",
            margin: "auto",
            maxHeight: "50vh",
          }}
        />
      </div>
      <div className="col-span-1 flex flex-col md:text-center p-4">
        <h1 className="text-3xl mb-12 text-center ">
          Welcome to the Sarafu Network
        </h1>
        <p className="text-base">
          {
            "Express your value with a Community Asset Voucher (CAV) as an individual or group - and join a network of Economic Commons - where communities thrive in the era of Grassroots Economics by tapping into their shared abundance. Welcome to your economy."
          }
        </p>
        <div className="mt-4 flex w-2/3 justify-evenly m-auto">
          <Link
            href={"/publish"}
            className={buttonVariants({ variant: "ghost" })}
          >
            Publish CAV
          </Link>
          <Link
            href={"https://docs.grassecon.org/"}
            className={buttonVariants({ variant: "ghost" })}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
