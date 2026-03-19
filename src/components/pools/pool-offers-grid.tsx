"use client";

import {
  ArrowDownUpIcon,
  GlobeIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useAuth } from "~/hooks/useAuth";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { formatCurrencyValue } from "~/utils/units/number";
import { fromRawPriceIndex } from "~/utils/units/pool";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { VoucherIcon } from "../voucher/voucher-icon";
import { SwapForm } from "./forms/swap-form";
import { type SwapPool, type SwapPoolVoucher } from "./types";
import {
  MIN_SWAP_AMOUNT,
  getHoldingInDefaultVoucherUnits,
  getTotalPurchasingPower,
} from "./utils";

interface PoolOffersGridProps {
  pool: SwapPool;
  metadata: RouterOutputs["pool"]["get"];
}

interface SelectedSwapProduct {
  address: `0x${string}`;
  price: string;
}

type Product = RouterOutput["products"]["list"][number];
type ProductWithDistance = Product & { _distanceKm: number | null };

function haversineDistanceKm(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.x - a.x);
  const dLon = toRad(b.y - a.y);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.x)) * Math.cos(toRad(b.x)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(km: number): string {
  if (km < 1) return "< 1 km";
  if (km < 5) return "< 5 km";
  if (km < 10) return "< 10 km";
  if (km < 25) return "< 25 km";
  if (km < 50) return "< 50 km";
  if (km < 100) return "< 100 km";
  return "100+ km";
}

function getDistanceKm(
  userGeo: { x: number; y: number } | null | undefined,
  voucherGeo: { x: number; y: number } | null | undefined,
): number | null {
  if (!userGeo || !voucherGeo) return null;
  if (!Number.isFinite(userGeo.x) || !Number.isFinite(userGeo.y)) return null;
  if (!Number.isFinite(voucherGeo.x) || !Number.isFinite(voucherGeo.y))
    return null;
  const clamp = (geo: { x: number; y: number }) => ({
    x: Math.max(-90, Math.min(90, geo.x)),
    y: Math.max(-180, Math.min(180, geo.y)),
  });
  return haversineDistanceKm(clamp(userGeo), clamp(voucherGeo));
}

function OfferGridCard({
  product,
  priceInDV,
  defaultVoucherSymbol,
  voucherDetail,
  allVoucherDetails,
  distanceKm,
  onSwap,
  onClick,
}: {
  product: Product;
  priceInDV: number | undefined;
  defaultVoucherSymbol: string | undefined;
  voucherDetail: SwapPoolVoucher | undefined;
  allVoucherDetails: Map<string, SwapPoolVoucher>;
  distanceKm: number | null;
  onSwap: () => void;
  onClick: () => void;
}) {
  const { isConnected } = useAccount();
  const poolBalanceInDV = voucherDetail
    ? getHoldingInDefaultVoucherUnits(voucherDetail)
    : 0;
  const availableToSwap = isConnected
    ? getTotalPurchasingPower(
        product.voucher_address,
        voucherDetail,
        allVoucherDetails,
      )
    : poolBalanceInDV;

  return (
    <div
      className="rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full bg-muted/20 rounded-lg overflow-hidden border">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.commodity_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {(() => {
          const label =
            distanceKm !== null
              ? formatDistance(distanceKm)
              : product.location_name;
          return label ? (
            <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
              {label}
            </span>
          ) : null;
        })()}
      </div>

      {/* Body */}
      <div className="p-2.5 space-y-2">
        {/* Product name + price */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight truncate">
              {product.commodity_name}
            </p>
          </div>
          {priceInDV !== undefined && priceInDV > MIN_SWAP_AMOUNT && (
            <p className="text-xs font-bold tabular-nums whitespace-nowrap mt-0.5">
              {formatCurrencyValue(priceInDV, defaultVoucherSymbol)}
              <span className="text-xs text-muted-foreground">/Unit</span>
            </p>
          )}
        </div>

        {/* Voucher row + swap */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="min-w-0">
              <Link
                href={`/vouchers/${product.voucher_address}`}
                className="text-[11px] font-light leading-tight truncate hover:underline block"
                onClick={(e) => e.stopPropagation()}
              >
                View{" "}
                {product.voucher_name ?? product.voucher_symbol ?? "Voucher"}
              </Link>
              {availableToSwap > MIN_SWAP_AMOUNT && (
                <p className="text-[10px] text-green-600 leading-tight">
                  Credit{" "}
                  <span className="tabular-nums font-medium">
                    {formatCurrencyValue(availableToSwap, defaultVoucherSymbol, { maximumFractionDigits: 2 })}
                  </span>
                </p>
              )}
            </div>
          </div>
          {isConnected && availableToSwap > MIN_SWAP_AMOUNT && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSwap();
              }}
              className="h-6 px-3 text-[11px]"
            >
              SWAP
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferGridSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-[3/2] w-full" />
      <div className="p-2.5 space-y-2">
        <div className="flex justify-between gap-1.5">
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-5 rounded-full" />
            <div className="space-y-0.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function OfferDetailContent({
  product,
  voucherDetail,
  allVoucherDetails,
  voucherInfo,
  defaultVoucherSymbol,
  distanceKm,
  isConnected,
  onSwap,
}: {
  product: Product;
  voucherDetail: SwapPoolVoucher | undefined;
  allVoucherDetails: Map<string, SwapPoolVoucher>;
  voucherInfo:
    | {
        voucher_email: string | null;
        voucher_website: string | null;
        voucher_description: string | null;
        location_name: string | null;
      }
    | null
    | undefined;
  defaultVoucherSymbol: string | undefined;
  distanceKm: number | null;
  isConnected: boolean;
  onSwap: () => void;
}) {
  const priceRate = fromRawPriceIndex(voucherDetail?.priceIndex);
  const priceInDV = product.price
    ? Number(product.price) * priceRate
    : undefined;
  const poolBalanceInDV = voucherDetail
    ? getHoldingInDefaultVoucherUnits(voucherDetail)
    : 0;
  const availableToSwap = isConnected
    ? getTotalPurchasingPower(
        product.voucher_address,
        voucherDetail,
        allVoucherDetails,
      )
    : poolBalanceInDV;

  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.commodity_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>

      {/* Product name + price */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">
            {product.commodity_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {product.commodity_type}
            </Badge>
            {distanceKm !== null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                {formatDistance(distanceKm)}
              </span>
            )}
          </div>
        </div>
        {priceInDV !== undefined && priceInDV > MIN_SWAP_AMOUNT && (
          <p className="text-lg font-bold tabular-nums whitespace-nowrap">
            {formatCurrencyValue(priceInDV, defaultVoucherSymbol)}
            <span className="text-base font-normal text-muted-foreground">/Unit</span>
          </p>
        )}
      </div>

      {/* Description */}
      {product.commodity_description && (
        <p className="text-sm text-muted-foreground">
          {product.commodity_description}
        </p>
      )}

      {/* Metadata */}
      {(product.quantity || product.frequency) && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          {product.quantity !== null &&
            product.quantity !== undefined &&
            product.quantity > 0 && <span>Quantity: {product.quantity}</span>}
          {product.frequency && <span>Frequency: {product.frequency}</span>}
        </div>
      )}

      <div className="border-t" />

      {/* Voucher section */}
      <div className="flex items-center gap-3">
        <VoucherIcon
          voucher_address={product.voucher_address}
          className="size-10 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/vouchers/${product.voucher_address}`}
            className="text-sm font-semibold hover:underline"
          >
            {product.voucher_name ?? product.voucher_symbol ?? "Voucher"}
          </Link>
          {availableToSwap > MIN_SWAP_AMOUNT && (
            <p className="text-xs text-green-600">
              Credit{" "}
              <span className="tabular-nums font-medium">
                {formatCurrencyValue(availableToSwap, defaultVoucherSymbol, { maximumFractionDigits: 2 })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Voucher contact info */}
      {voucherInfo &&
        (voucherInfo.voucher_email ||
          voucherInfo.voucher_website ||
          voucherInfo.location_name) && (
          <div className="space-y-1.5 text-sm">
            {voucherInfo.location_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{voucherInfo.location_name}</span>
              </div>
            )}
            {voucherInfo.voucher_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <a
                  href={`mailto:${voucherInfo.voucher_email}`}
                  className="truncate hover:underline"
                >
                  {voucherInfo.voucher_email}
                </a>
              </div>
            )}
            {voucherInfo.voucher_website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <GlobeIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <a
                  href={voucherInfo.voucher_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  {voucherInfo.voucher_website}
                </a>
              </div>
            )}
          </div>
        )}

      {/* Swap button */}
      {isConnected && availableToSwap > MIN_SWAP_AMOUNT && (
        <Button onClick={onSwap} className="w-full">
          SWAP
        </Button>
      )}
    </div>
  );
}

type SortOption = "credit" | "name" | "distance";

export function PoolOffersGrid({ pool, metadata }: PoolOffersGridProps) {
  const auth = useAuth();
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("credit");
  const defaultVoucherSymbol = metadata?.unit_of_account;
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedSwapProduct, setSelectedSwapProduct] =
    useState<SelectedSwapProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: allProducts, isLoading } = trpc.products.list.useQuery({
    voucher_addresses: pool.vouchers ?? [],
  });

  const products = allProducts?.flat().filter(Boolean) ?? [];

  const { data: voucherInfo } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: selectedProduct?.voucher_address ?? "" },
    { enabled: !!selectedProduct, staleTime: Infinity },
  );

  const voucherDetailMap = useMemo(() => {
    const map = new Map<string, SwapPoolVoucher>();
    for (const detail of pool.voucherDetails ?? []) {
      map.set(detail.address.toLowerCase(), detail);
    }
    return map;
  }, [pool.voucherDetails]);

  const filteredProducts = products.filter((product) => {
    return (
      searchTerm === "" ||
      product.commodity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const userGeo = auth?.user?.geo;

  const sortedProducts = useMemo(() => {
    const enriched: ProductWithDistance[] = filteredProducts.map((p) => ({
      ...p,
      _distanceKm: getDistanceKm(userGeo, p.voucher_geo),
    }));
    if (sortBy === "name") {
      enriched.sort((a, b) =>
        a.commodity_name.localeCompare(b.commodity_name),
      );
    } else if (sortBy === "distance") {
      enriched.sort((a, b) => {
        if (a._distanceKm === null && b._distanceKm === null) return 0;
        if (a._distanceKm === null) return 1;
        if (b._distanceKm === null) return -1;
        return a._distanceKm - b._distanceKm;
      });
    } else {
      enriched.sort((a, b) => {
        const detailA = voucherDetailMap.get(a.voucher_address.toLowerCase());
        const detailB = voucherDetailMap.get(b.voucher_address.toLowerCase());
        const creditA = isConnected
          ? getTotalPurchasingPower(
              a.voucher_address,
              detailA,
              voucherDetailMap,
            )
          : detailA
            ? getHoldingInDefaultVoucherUnits(detailA)
            : 0;
        const creditB = isConnected
          ? getTotalPurchasingPower(
              b.voucher_address,
              detailB,
              voucherDetailMap,
            )
          : detailB
            ? getHoldingInDefaultVoucherUnits(detailB)
            : 0;
        return creditB - creditA;
      });
    }
    return enriched;
  }, [filteredProducts, sortBy, isConnected, voucherDetailMap, userGeo]);

  const handleSwapClick = (
    voucherAddress: `0x${string}`,
    price: string | null,
  ) => {
    setSelectedSwapProduct({
      address: voucherAddress,
      price: price ?? "",
    });
    setIsSwapOpen(true);
  };

  const isFiltering = searchTerm !== "";
  const hasProducts = products.length > 0;
  const hasFilteredResults = sortedProducts.length > 0;
  const isEmptyWithoutFiltering = !isLoading && !hasProducts;
  const isEmptyAfterFiltering =
    !isLoading && hasProducts && !hasFilteredResults && isFiltering;

  return (
    <div className="flex flex-col space-y-4">
      {/* Search + Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-[140px]">
            <ArrowDownUpIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <OfferGridSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmptyWithoutFiltering && (
        <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <PackageIcon className="w-12 h-12 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Offers Available</p>
            <p className="text-sm max-w-md">
              There are no offers listed for the vouchers in this pool.
            </p>
          </div>
        </div>
      )}

      {/* No search results */}
      {isEmptyAfterFiltering && (
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <SearchIcon className="w-10 h-10 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Matching Offers</p>
            <p className="text-sm max-w-md">
              No offers match your search criteria. Try adjusting your search.
            </p>
          </div>
        </div>
      )}

      {/* Offer cards grid */}
      {!isLoading && hasFilteredResults && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-3">
          {sortedProducts.map((product) => {
            const voucherDetail = voucherDetailMap.get(
              product.voucher_address.toLowerCase(),
            );
            const priceRate = fromRawPriceIndex(voucherDetail?.priceIndex);
            const priceInDV = product.price
              ? Number(product.price) * priceRate
              : undefined;

            return (
              <OfferGridCard
                key={product.id}
                product={product}
                priceInDV={priceInDV}
                defaultVoucherSymbol={defaultVoucherSymbol}
                voucherDetail={voucherDetail}
                allVoucherDetails={voucherDetailMap}
                distanceKm={product._distanceKm}
                onClick={() => setSelectedProduct(product)}
                onSwap={() =>
                  handleSwapClick(
                    product.voucher_address,
                    product.price ? String(product.price) : null,
                  )
                }
              />
            );
          })}
        </div>
      )}

      {/* Offer detail modal */}
      <ResponsiveModal
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        title=""
      >
        {selectedProduct && (
          <OfferDetailContent
            product={selectedProduct}
            voucherDetail={voucherDetailMap.get(
              selectedProduct.voucher_address.toLowerCase(),
            )}
            allVoucherDetails={voucherDetailMap}
            voucherInfo={voucherInfo}
            defaultVoucherSymbol={defaultVoucherSymbol}
            distanceKm={
              sortedProducts.find((p) => p.id === selectedProduct.id)
                ?._distanceKm ??
              getDistanceKm(userGeo, selectedProduct.voucher_geo)
            }
            isConnected={isConnected}
            onSwap={() => {
              setSelectedProduct(null);
              handleSwapClick(
                selectedProduct.voucher_address,
                selectedProduct.price
                  ? String(selectedProduct.price)
                  : null,
              );
            }}
          />
        )}
      </ResponsiveModal>

      {/* Swap modal */}
      <ResponsiveModal
        open={isSwapOpen}
        onOpenChange={setIsSwapOpen}
        title="Swap"
        preventDismiss
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
