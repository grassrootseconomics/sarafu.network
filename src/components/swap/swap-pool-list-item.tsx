import { Avatar } from "@radix-ui/react-avatar";
import Link from "next/link";
import { Icons } from "../icons";
import { Skeleton } from "../ui/skeleton";
import { useSwapPool } from "./hooks";

export const SwapPoolListItem = ({ address }: { address: `0x${string}` }) => {
  const pool = useSwapPool(address);
  return (
    <Link href={`/pools/${address}`} className="mr-6 items-center space-x-2">
      <div className="flex justify-start items-center hover:scale-[1.005] transition-all rounded-sm gap-x-4">
        <Avatar className="relative outline outline-1 rounded-full w-10 h-10 min-w-10 min-h-10 flex items-center justify-center">
          <div
            className="absolute bg-black text-white rounded-full w-5 h-5 text-center bottom-[-6%] right-[-6%]"
            style={{ fontSize: "16px", lineHeight: "20px" }}
          >
            {pool.tokenIndex.entryCount.toString() ?? 0}
          </div>
          <Icons.pools className="" />
        </Avatar>
        <div className="flex flex-col">
          <h1>{pool.name ?? <Skeleton className="w-24 h-5" />}</h1>
        </div>
      </div>
    </Link>
  );
};
