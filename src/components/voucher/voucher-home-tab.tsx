import { Mail, Globe } from "lucide-react";
import { ProductList } from "~/components/products/product-list";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {voucher?.voucher_description}
            </p>
            
            {(voucher?.voucher_email || voucher?.voucher_website) && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {voucher?.voucher_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                    asChild
                  >
                    <a href={`mailto:${voucher.voucher_email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      {voucher.voucher_email}
                    </a>
                  </Button>
                )}
                
                {voucher?.voucher_website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                    asChild
                  >
                    <a 
                      href={voucher.voucher_website.startsWith('http') ? voucher.voucher_website : `https://${voucher.voucher_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            )}
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
