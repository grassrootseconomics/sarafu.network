"use client";
import {
  ArrowRightLeft,
  ChevronDown,
  ExternalLinkIcon,
  ImageIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useAuth } from "~/hooks/useAuth";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { formatNumber, truncateByDecimalPlace } from "~/utils/units/number";
import { fromRawPriceIndex } from "~/utils/units/pool";
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
import { getHoldingInDefaultVoucherUnits, getTotalPurchasingPower } from "./utils";

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

const MIN_SWAP_AMOUNT = 0.01;

function OfferCard({
  product,
  priceInDV,
  defaultVoucherSymbol,
  onClick,
}: {
  product: Product;
  priceInDV: number | undefined;
  defaultVoucherSymbol: string | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border bg-card overflow-hidden text-left cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="relative aspect-[4/3] w-full bg-muted/30 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.commodity_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        )}
      </div>
      <div className="p-2">
        <p className="font-medium text-sm truncate">{product.commodity_name}</p>
        {product.commodity_description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {product.commodity_description}
          </p>
        )}
        {priceInDV !== undefined && priceInDV > MIN_SWAP_AMOUNT && (
          <p className="text-xs font-semibold tabular-nums text-green-600 mt-1">
            {truncateByDecimalPlace(priceInDV, 2)} {defaultVoucherSymbol ?? ""}
          </p>
        )}
      </div>
    </button>
  );
}

function VoucherOfferGroup({
  voucherAddress,
  voucherDetail,
  allVoucherDetails,
  defaultVoucherSymbol,
  products,
  onSwapClick,
}: {
  voucherAddress: `0x${string}`;
  voucherDetail: SwapPoolVoucher | undefined;
  allVoucherDetails: Map<string, SwapPoolVoucher>;
  defaultVoucherSymbol: string | undefined;
  products: Product[];
  onSwapClick: (voucherAddress: `0x${string}`) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isConnected } = useAccount();
  const symbol = useVoucherSymbol({ address: voucherAddress });
  const priceRate = fromRawPriceIndex(voucherDetail?.priceIndex);
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    { enabled: !!voucherAddress, staleTime: Infinity },
  );

  const poolBalanceInDV = voucherDetail
    ? getHoldingInDefaultVoucherUnits(voucherDetail)
    : 0;

  const availableToSwap = isConnected
    ? getTotalPurchasingPower(voucherAddress, voucherDetail, allVoucherDetails)
    : poolBalanceInDV;

  const holding = formatNumber(availableToSwap, { maxDecimalDigits: 0 });

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="hover:bg-muted/20 transition-colors">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left min-w-0">
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
                {voucher?.voucher_description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {voucher.voucher_description}
                  </p>
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <div className="flex items-center justify-between px-4 pb-3 pl-[4.25rem]">
            {availableToSwap > MIN_SWAP_AMOUNT ? (
              <span className="text-xs font-medium text-green-600">
                {holding} {defaultVoucherSymbol ?? ""} Available
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="h-8 gap-1.5 text-xs"
              >
                <Link href={`/vouchers/${voucherAddress}`}>
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  View
                </Link>
              </Button>
              {isConnected && availableToSwap > MIN_SWAP_AMOUNT && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSwapClick(voucherAddress)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Swap
                </Button>
              )}
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <div className="border-t-2 bg-muted">
            <div className="px-4 pt-2 pb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Offers
              </p>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 px-4 pb-3">
                {products.map((product) => (
                  <OfferCard
                    key={product.id}
                    product={product}
                    priceInDV={
                      product.price
                        ? Number(product.price) * priceRate
                        : undefined
                    }
                    defaultVoucherSymbol={defaultVoucherSymbol}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-4 pb-3 text-sm text-muted-foreground">
                No offers listed for this voucher.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <ResponsiveModal
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        title={selectedProduct?.commodity_name}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.commodity_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                  {selectedProduct.commodity_type}
                </span>
                {selectedProduct.price && priceRate > 0 && (
                  <span className="text-sm font-semibold tabular-nums">
                    {truncateByDecimalPlace(
                      Number(selectedProduct.price) * priceRate,
                      2,
                    )}{" "}
                    {defaultVoucherSymbol ?? ""}
                  </span>
                )}
              </div>
              {selectedProduct.commodity_description && (
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.commodity_description}
                </p>
              )}
              {(selectedProduct.quantity || selectedProduct.frequency) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {selectedProduct.quantity !== null &&
                    selectedProduct.quantity !== undefined &&
                    selectedProduct.quantity > 0 && (
                      <span>Quantity: {selectedProduct.quantity}</span>
                    )}
                  {selectedProduct.frequency && (
                    <span>Frequency: {selectedProduct.frequency}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

export function PoolProductsList({ pool, metadata }: PoolProductsListProps) {
  const auth = useAuth();
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

  const voucherDetailMap = useMemo(() => {
    const map = new Map<string, SwapPoolVoucher>();
    for (const detail of pool.voucherDetails ?? []) {
      map.set(detail.address.toLowerCase(), detail);
    }
    return map;
  }, [pool.voucherDetails]);

  const groupedByVoucher = useMemo(() => {
    const groups = new Map<`0x${string}`, Product[]>();
    // Seed with all pool vouchers when not searching so those without offers still appear
    if (!searchTerm) {
      for (const addr of pool.vouchers ?? []) {
        groups.set(addr, []);
      }
    }
    for (const product of filteredProducts) {
      const existing = groups.get(product.voucher_address) ?? [];
      existing.push(product);
      groups.set(product.voucher_address, existing);
    }
    return Array.from(groups.entries()).sort(([addrA], [addrB]) => {
      const detailA = voucherDetailMap.get(addrA.toLowerCase());
      const detailB = voucherDetailMap.get(addrB.toLowerCase());
      const creditA = getTotalPurchasingPower(addrA, detailA, voucherDetailMap);
      const creditB = getTotalPurchasingPower(addrB, detailB, voucherDetailMap);
      return creditB - creditA;
    });
  }, [filteredProducts, voucherDetailMap, pool.vouchers, searchTerm]);

  const handleVoucherSwapClick = (voucherAddress: `0x${string}`) => {
    setSelectedSwapProduct({
      id: 0,
      address: voucherAddress,
      price: "",
    });
    setIsSwapOpen(true);
  };

  const isFiltering = searchTerm !== "";
  const hasVouchers = (pool.vouchers ?? []).length > 0;
  const hasFilteredResults = groupedByVoucher.length > 0;
  const isEmptyWithoutFiltering = !isLoading && !hasVouchers;
  const isEmptyAfterFiltering =
    !isLoading && hasVouchers && !hasFilteredResults && isFiltering;

  const getContents = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card overflow-hidden"
            >
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
        {groupedByVoucher.map(([voucherAddress, voucherProducts]) => (
          <VoucherOfferGroup
            key={voucherAddress}
            voucherAddress={voucherAddress}
            voucherDetail={voucherDetailMap.get(voucherAddress.toLowerCase())}
            allVoucherDetails={voucherDetailMap}
            defaultVoucherSymbol={defaultVoucherSymbol.data}
            products={voucherProducts}
            onSwapClick={handleVoucherSwapClick}
          />
        ))}
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
