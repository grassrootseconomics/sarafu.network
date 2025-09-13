import Link from "next/link";
import { useSwapPool } from "~/components/pools/hooks";
import { Skeleton } from "../ui/skeleton";

interface VoucherPoolListItemProps {
  poolAddress: `0x${string}`;
  voucherAddress: `0x${string}`;
}

export function VoucherPoolListItem({
  poolAddress,
  voucherAddress,
}: VoucherPoolListItemProps) {
  const { data: pool, isLoading } = useSwapPool(poolAddress);
  const details = pool?.voucherDetails?.find(
    (d) => d.address === voucherAddress
  );

  const balance = details?.poolBalance?.formattedNumber ?? 0;
  const limit = details?.limitOf?.formattedNumber ?? 0;
  const percentage = limit > 0 ? (balance / limit) * 100 : 0;
  if (isLoading) return <Skeleton className="h-20 w-full" />;
  return (
    <Link
      href={`/pools/${pool?.address}`}
      key={pool?.address}
      className="group block p-4 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-white hover:to-purple-50/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
            {pool?.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pool Liquidity: {balance.toFixed(2)} / {limit.toFixed(2)} tokens
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-16 h-16 relative">
            {/* Circular Progress */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${
                  2 * Math.PI * 28 * (1 - percentage / 100)
                }`}
                className="text-purple-500 transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
