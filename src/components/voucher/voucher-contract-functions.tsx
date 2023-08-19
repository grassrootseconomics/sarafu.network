import { isAddress } from "viem";
import { useContractRead } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useUser } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import MintToDialog from "../dialogs/mintTo";

interface VoucherContractFunctionsProps {
  className?: string;
  voucher: {
    id: number;
    voucher_address: string;
  };
}
export function VoucherContractFunctions({
  className,
  voucher,
}: VoucherContractFunctionsProps) {
  const user = useUser();
  const isWriter = useContractRead({
    abi: abi,
    address: voucher.voucher_address as `0x${string}`,
    functionName: "isWriter",
    enabled:
      user?.account.blockchain_address &&
      isAddress(user?.account.blockchain_address),
    args: [user?.account.blockchain_address as `0x${string}`],
  });
  const owner = useContractRead({
    abi: abi,
    address: voucher.voucher_address as `0x${string}`,
    functionName: "owner",
  });
  if (owner.data === user?.account.blockchain_address || isWriter.data) {
    return (
      <div className={cn(className, "flex m-1")}>
        <MintToDialog voucher={voucher} />
      </div>
    );
  }
  return null;
}
