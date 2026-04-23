"use client";
import { useENS } from "~/lib/sarafu/resolver";
import { Skeleton } from "./ui/skeleton";

interface IENSNameProps {
  address?: string;
  className?: string;
}

function ENSName(props: IENSNameProps) {
  const { data: ens, isLoading } = useENS({
    address: props.address as `0x${string}`,
    disabled: !props.address,
  });
  if (isLoading) {
    return <Skeleton className="h-4 w-[100px]" />;
  }

  return <span className={props.className}>{ens?.name || "No ENS name"}</span>;
}

export default ENSName;
