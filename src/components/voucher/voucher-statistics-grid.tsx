import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { useIsMounted } from "~/hooks/useIsMounted";
import { toUserUnitsString } from "~/utils/units";
import { type VoucherDetails } from "../pools/contract-functions";

interface VoucherStatisticsGridProps {
  stats: {
    transactions: { total: number; delta: number };
    accounts: { total: number; delta: number };
    volume: { total: bigint; delta: bigint };
  } | undefined;
  voucherAddress: `0x${string}`;
  details: VoucherDetails;
}

export function VoucherStatisticsGrid({ 
  stats, 
  voucherAddress, 
  details 
}: VoucherStatisticsGridProps) {
  const isMounted = useIsMounted();
  const { data: token } = useToken({
    address: voucherAddress,
    query: {
      staleTime: 60_000,
      enabled: !!voucherAddress,
    },
  });

  return (
    <div className="grid w-fill gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 items-center">
      <StatisticsCard
        value={stats?.transactions.total.toString() || "0"}
        title="Transactions"
        Icon={Icons.hash}
        delta={stats?.transactions.delta || 0}
        isIncrease={(stats?.transactions.delta || 0) > 0}
      />
      <StatisticsCard
        value={stats?.accounts.total.toString() || "0"}
        title="Active Users"
        Icon={Icons.person}
        delta={stats?.accounts.delta || 0}
        isIncrease={(stats?.accounts.delta || 0) > 0}
      />
      <StatisticsCard
        value={
          isMounted
            ? toUserUnitsString(
                token?.totalSupply.value,
                details?.decimals
              )
            : "0"
        }
        title="Total Supply"
        Icon={Icons.hash}
        delta={0}
        isIncrease={false}
      />
      <StatisticsCard
        value={toUserUnitsString(
          stats?.volume.total || BigInt(0),
          details?.decimals
        )}
        title="Volume"
        Icon={Icons.hash}
        delta={parseFloat(
          toUserUnitsString(
            stats?.volume.delta || BigInt(0),
            details?.decimals
          )
        )}
        isIncrease={(stats?.volume.delta || BigInt(0)) > 0}
      />
    </div>
  );
}