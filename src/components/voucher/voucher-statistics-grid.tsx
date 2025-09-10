import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { useIsMounted } from "~/hooks/useIsMounted";
import { trpc } from "~/lib/trpc";
import { toUserUnitsString } from "~/utils/units";
import { type VoucherDetails } from "../pools/contract-functions";

interface VoucherStatisticsGridProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  voucherAddress: `0x${string}`;
  details: VoucherDetails;
}

export function VoucherStatisticsGrid({
  dateRange,
  voucherAddress,
  details,
}: VoucherStatisticsGridProps) {
  const { data: stats, isLoading } = trpc.stats.voucherStats.useQuery(
    {
      voucherAddress,
      dateRange,
    },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );

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
        isLoading={isLoading}
        value={stats?.transactions.total.toString() || "0"}
        title="Transactions"
        Icon={Icons.hash}
        delta={stats?.transactions.delta || 0}
        isIncrease={(stats?.transactions.delta || 0) > 0}
      />
      <StatisticsCard
        isLoading={isLoading}
        value={stats?.accounts.total.toString() || "0"}
        title="Active Users"
        Icon={Icons.person}
        delta={stats?.accounts.delta || 0}
        isIncrease={(stats?.accounts.delta || 0) > 0}
      />
      <StatisticsCard
        isLoading={isLoading}
        value={
          isMounted
            ? toUserUnitsString(token?.totalSupply.value, details?.decimals)
            : "0"
        }
        title="Total Supply"
        Icon={Icons.hash}
        delta={0}
        isIncrease={false}
      />
      <StatisticsCard
        isLoading={isLoading}
        value={toUserUnitsString(
          stats?.volume.total || BigInt(0),
          details?.decimals
        )}
        title="Volume"
        Icon={Icons.hash}
        delta={parseFloat(
          toUserUnitsString(stats?.volume.delta || BigInt(0), details?.decimals)
        )}
        isIncrease={(stats?.volume.delta || BigInt(0)) > 0}
      />
    </div>
  );
}
