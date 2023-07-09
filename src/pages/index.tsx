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
            "Discover Grassroots Economics, your partner in establishing self-empowered financial systems based on local goods and services.We're revolutionizing regional markets from the ground up. Join the Sarafu Network - Kenya's leading Economic Commons platform - and be part of our thriving, community-driven economy"
          }
        </p>
        <div className="mt-4 flex w-2/3 justify-evenly m-auto">
          <Link
            href={"/deploy"}
            className={buttonVariants({ variant: "ghost" })}
          >
            Deploy
          </Link>
          <Link
            href={"https://cic-stack.grassecon.org/"}
            className={buttonVariants({ variant: "ghost" })}
          >
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
