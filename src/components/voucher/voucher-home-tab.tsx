import { Globe, Mail, User2, Users } from "lucide-react";
import { ProductList } from "~/components/products/product-list";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useContractOwner } from "~/hooks/use-owner";
import { useContractSinkAddress } from "~/hooks/use-sink-address";
import { trpc } from "~/lib/trpc";
import { VoucherType } from "~/server/enums";
import { celoscanUrl } from "~/utils/celo";
import Address from "../address";

interface VoucherHomeTabProps {
  voucherAddress: `0x${string}`;
  isOwner: boolean | undefined;
}

export function VoucherHomeTab({
  voucherAddress,
  isOwner,
}: VoucherHomeTabProps) {
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );
  const { data: owner } = useContractOwner(voucherAddress);
  const { data: sinkAddress } = useContractSinkAddress(
    voucherAddress,
    voucher?.voucher_type === VoucherType.DEMURRAGE
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
                      href={
                        voucher.voucher_website.startsWith("http")
                          ? voucher.voucher_website
                          : `https://${voucher.voucher_website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {owner && (
                  <Button variant="outline" size="sm" className="" asChild>
                    <a
                      href={celoscanUrl.address(owner)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <User2 className="h-4 w-4 mr-2" />
                      <Address address={owner} />
                    </a>
                  </Button>
                )}
                {sinkAddress && (
                  <Button variant="outline" size="sm" className="" asChild>
                    <a
                      href={celoscanUrl.address(sinkAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Community Fund : <Address address={sinkAddress} truncate />
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
          <ProductList isOwner={isOwner} voucher_address={voucherAddress} />
        </CardContent>
      </Card>
    </div>
  );
}
