import { ProductList } from "~/components/products/product-list";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { trpc } from "~/lib/trpc";
import { type VoucherDetails } from "../pools/contract-functions";

interface VoucherHomeTabProps {
  voucherAddress: `0x${string}`;
  details: VoucherDetails;
  isOwner: boolean;
}

export function VoucherHomeTab({
  voucherAddress,
  details,
  isOwner,
}: VoucherHomeTabProps) {
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );
  return (
    <div className=" mx-auto space-y-6">
      {voucher?.voucher_description && (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              About this Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {voucher?.voucher_description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-blue-50/20">
        <CardContent className="p-6">
          <ProductList
            isOwner={isOwner}
            voucher_id={voucher?.id ?? 0}
            voucherSymbol={details?.symbol ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
