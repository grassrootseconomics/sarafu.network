import { ChevronDown, Globe, Mail, Shield, User2, Wallet } from "lucide-react";
import { useState } from "react";
import { ProductList } from "~/components/products/product-list";
import { Card, CardContent } from "~/components/ui/card";
import { useContractSinkAddress } from "~/hooks/use-sink-address";
import { useContractOwner } from "~/hooks/useIsOwner";
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
  const [showSigners, setShowSigners] = useState(false);

  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );
  const owner = useContractOwner(voucherAddress);
  const { data: sinkAddress } = useContractSinkAddress(
    voucherAddress,
    voucher?.voucher_type === VoucherType.DEMURRAGE
  );
  return (
    <div className="space-y-4">
      {voucher?.voucher_description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap mb-4">
              {voucher.voucher_description}
            </p>

            {(voucher?.voucher_email ||
              voucher?.voucher_website ||
              owner?.address ||
              sinkAddress) && (
              <div className="space-y-2 pt-3 border-t">
                <div className="flex flex-wrap gap-2">
                  {voucher?.voucher_email && (
                    <a
                      href={`mailto:${voucher.voucher_email}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {voucher.voucher_email}
                    </a>
                  )}

                  {voucher?.voucher_website && (
                    <a
                      href={
                        voucher.voucher_website.startsWith("http")
                          ? voucher.voucher_website
                          : `https://${voucher.voucher_website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                      Website
                    </a>
                  )}

                  {sinkAddress && (
                    <a
                      href={celoscanUrl.address(sinkAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Wallet className="h-3 w-3" />
                      Fund
                      <Address
                        address={sinkAddress}
                        truncate
                        className="font-mono text-[11px]"
                      />
                    </a>
                  )}
                  {owner?.address && (
                    <a
                      href={celoscanUrl.address(owner.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {owner.isMultiSig ? (
                        <>
                          <Shield className="h-3 w-3" />
                          MultiSig
                          {owner.threshold !== undefined &&
                            owner.owners?.length && (
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                                {owner.threshold}/{owner.owners.length}
                              </span>
                            )}
                        </>
                      ) : (
                        <>
                          <User2 className="h-3 w-3" />
                          Owner
                        </>
                      )}
                      <Address
                        address={owner.address}
                        className="font-mono text-[11px]"
                      />
                    </a>
                  )}
                  {owner?.isMultiSig &&
                    owner.owners &&
                    owner.owners.length > 0 && (
                      <button
                        onClick={() => setShowSigners(!showSigners)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            showSigners ? "rotate-180" : ""
                          }`}
                        />
                        {showSigners ? "Hide" : "Show"} Signers
                      </button>
                    )}
                </div>

                {owner?.isMultiSig && showSigners && owner.owners && (
                  <div className="ml-4 pl-3 border-l-2 border-gray-200 space-y-1.5">
                    {owner.owners.map((signerAddress, index) => (
                      <a
                        key={signerAddress}
                        href={celoscanUrl.address(signerAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      >
                        <span className="text-[10px] text-gray-400 w-4">
                          {index + 1}.
                        </span>
                        <Address
                          address={signerAddress as `0x${string}`}
                          className="font-mono text-[10px]"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <ProductList isOwner={isOwner} voucher_address={voucherAddress} />
        </CardContent>
      </Card>
    </div>
  );
}
