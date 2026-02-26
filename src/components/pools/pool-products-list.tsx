"use client";
import {
  ArrowRightLeft,
  ChevronDown,
  ImageIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useAuth } from "~/hooks/useAuth";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { formatNumber, truncateByDecimalPlace } from "~/utils/units/number";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { VoucherIcon } from "../voucher/voucher-icon";
import { useVoucherSymbol } from "../voucher/voucher-name";
import { SwapForm } from "./forms/swap-form";
import { type SwapPool, type SwapPoolVoucher } from "./types";
import { getHoldingInDefaultVoucherUnits } from "./utils";

interface PoolProductsListProps {
  pool: SwapPool;
  metadata: RouterOutputs["pool"]["get"];
}

interface SelectedSwapProduct {
  id: number;
  address: `0x${string}`;
  price: string;
}

type Product = RouterOutput["products"]["list"][number];

function OfferRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-muted/30 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.commodity_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{product.commodity_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {product.price
            ? `${truncateByDecimalPlace(product.price, 2)} per unit`
            : product.commodity_description || "No price set"}
        </p>
      </div>
    </div>
  );
}

function VoucherOfferGroup({
  voucherAddress,
  voucherDetail,
  defaultVoucherSymbol,
  products,
  onSwapClick,
}: {
  voucherAddress: `0x${string}`;
  voucherDetail: SwapPoolVoucher | undefined;
  defaultVoucherSymbol: string | undefined;
  products: Product[];
  onSwapClick: (voucherAddress: `0x${string}`) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const symbol = useVoucherSymbol({ address: voucherAddress });
  const holdingRaw = voucherDetail
    ? getHoldingInDefaultVoucherUnits(voucherDetail)
    : 0;
  const holding = formatNumber(holdingRaw, { maxDecimalDigits: 0 });

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center hover:bg-muted/20 transition-colors">
          <CollapsibleTrigger asChild>
            <button className="flex-1 flex items-center gap-3 px-4 py-4 text-left min-w-0">
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`}
              />
              <VoucherIcon
                voucher_address={voucherAddress}
                className="size-10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {voucherDetail?.name ?? symbol.data ?? "Loading..."}
                </p>
              </div>
              <span className="text-sm font-medium text-green-600 flex-shrink-0">
                {holding} {defaultVoucherSymbol ?? ""} Available
              </span>
            </button>
          </CollapsibleTrigger>
          {isConnected && holdingRaw > 0 && (
            <div className="pr-4 flex-shrink-0">
              <Button
                size="sm"
                variant="default"
                onClick={() => onSwapClick(voucherAddress)}
                className="h-8 gap-1.5 text-xs"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Swap
              </Button>
            </div>
          )}
        </div>
        <CollapsibleContent>
          <div className="divide-y px-4">
            {products.map((product) => (
              <OfferRow key={product.id} product={product} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function PoolProductsList({ pool, metadata }: PoolProductsListProps) {
  const auth = useAuth();
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const defaultVoucherSymbol = useVoucherSymbol({
    address: metadata?.default_voucher,
  });
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedSwapProduct, setSelectedSwapProduct] =
    useState<SelectedSwapProduct | null>(null);

  const { data: allProducts, isLoading } = trpc.products.list.useQuery({
    voucher_addresses: pool.vouchers ?? [],
  });

  const products = allProducts?.flat().filter(Boolean) ?? [];

  const filteredProducts = products.filter((product) => {
    return (
      searchTerm === "" ||
      product.commodity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const groupedByVoucher = useMemo(() => {
    const groups = new Map<`0x${string}`, Product[]>();
    for (const product of filteredProducts) {
      const existing = groups.get(product.voucher_address) ?? [];
      existing.push(product);
      groups.set(product.voucher_address, existing);
    }
    return groups;
  }, [filteredProducts]);

  const voucherDetailMap = useMemo(() => {
    const map = new Map<string, SwapPoolVoucher>();
    for (const detail of pool.voucherDetails ?? []) {
      map.set(detail.address.toLowerCase(), detail);
    }
    return map;
  }, [pool.voucherDetails]);

  const handleVoucherSwapClick = (voucherAddress: `0x${string}`) => {
    setSelectedSwapProduct({
      id: 0,
      address: voucherAddress,
      price: "",
    });
    setIsSwapOpen(true);
  };

  const isFiltering = searchTerm !== "";
  const hasOriginalProducts = products.length > 0;
  const hasFilteredProducts = filteredProducts.length > 0;
  const isEmptyWithoutFiltering = !isLoading && !hasOriginalProducts;
  const isEmptyAfterFiltering =
    !isLoading && hasOriginalProducts && !hasFilteredProducts && isFiltering;

  const getContents = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-4 border-b-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <div className="px-4 divide-y">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (isEmptyWithoutFiltering) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <PackageIcon className="w-12 h-12 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Offers Available</p>
            <p className="text-sm max-w-md">
              There are no offers listed for the vouchers in this pool.
            </p>
          </div>
        </div>
      );
    }
    if (isEmptyAfterFiltering) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <SearchIcon className="w-10 h-10 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Matching Offers</p>
            <p className="text-sm max-w-md">
              No offers match your search criteria. Try adjusting your search.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4 w-full">
        {Array.from(groupedByVoucher.entries()).map(
          ([voucherAddress, voucherProducts]) => (
            <VoucherOfferGroup
              key={voucherAddress}
              voucherAddress={voucherAddress}
              voucherDetail={voucherDetailMap.get(
                voucherAddress.toLowerCase()
              )}
              defaultVoucherSymbol={defaultVoucherSymbol.data}
              products={voucherProducts}
              onSwapClick={handleVoucherSwapClick}
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>
      {getContents()}
      <ResponsiveModal
        open={isSwapOpen}
        onOpenChange={setIsSwapOpen}
        title="Swap"
      >
        <SwapForm
          key={`${selectedSwapProduct?.address}-${selectedSwapProduct?.price}`}
          pool={pool}
          initial={{
            toAddress: selectedSwapProduct?.address,
            fromAddress: auth?.user?.default_voucher as `0x${string}`,
            toAmount: selectedSwapProduct?.price || undefined,
          }}
          onSuccess={() => setIsSwapOpen(false)}
        />
      </ResponsiveModal>
    </div>
  );
}
