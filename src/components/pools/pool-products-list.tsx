"use client";
import { ArrowRightLeft, Eye, PackageIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { ProductListItem } from "../products/products-list-item";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { SwapForm } from "./forms/swap-form";
import { type SwapPool } from "./types";

interface PoolProductsListProps {
  pool: SwapPool;
}

interface SelectedSwapProduct {
  id: number;
  address: `0x${string}`;
  price: string;
}

export function PoolProductsList({ pool }: PoolProductsListProps) {
  const auth = useAuth();
  const router = useRouter();
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSwapOpen, setIsSwapOpen] = useState(false);

  // Consolidated state for selected product and swap details
  const [selectedSwapProduct, setSelectedSwapProduct] =
    useState<SelectedSwapProduct | null>(null);

  const { data: allProducts, isLoading } = trpc.products.list.useQuery({
    voucher_addresses: pool.vouchers ?? [],
  });

  const products = allProducts?.flat().filter(Boolean) ?? [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.commodity_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const isFiltering = searchTerm !== "";
  const hasOriginalProducts = products.length > 0;
  const hasFilteredProducts = filteredProducts.length > 0;
  const isEmptyWithoutFiltering = !isLoading && !hasOriginalProducts;
  const isEmptyAfterFiltering =
    !isLoading && hasOriginalProducts && !hasFilteredProducts && isFiltering;
  const getContents = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center p-4 rounded-lg border bg-card"
            >
              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="ml-4 flex flex-col items-end space-y-1">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
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
      <div className="space-y-3 w-full">
        {filteredProducts.map((product, idx) => {
          const isSelected = selectedSwapProduct?.id === product.id;

          const handleSwapClick = () => {
            setSelectedSwapProduct({
              id: product.id,
              address: product.voucher_address,
              price: product.price!.toString(),
            });
            setIsSwapOpen(true);
          };

          return (
            <div
              key={`product-${product.id}-${idx}`}
              className="flex items-stretch gap-2"
            >
              <div className="flex-1">
                <ProductListItem
                  product={product}
                  isOwner={false}
                  onClick={() =>
                    setSelectedSwapProduct(
                      isSelected
                        ? null
                        : {
                            id: product.id,
                            address: product.voucher_address,
                            price: product.price?.toString() ?? "0",
                          }
                    )
                  }
                />
              </div>
              {isSelected && (
                <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/vouchers/${product.voucher_address}`)
                    }
                    className="h-9 gap-2 w-full min-w-[130px]"
                  >
                    <Eye className="h-4 w-4" />
                    View Voucher
                  </Button>
                  {isConnected && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full min-w-[130px]">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSwapClick}
                              className="h-9 gap-2 w-full"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                              Swap
                            </Button>
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
            toAmount: selectedSwapProduct?.price,
          }}
          onSuccess={() => setIsSwapOpen(false)}
        />
      </ResponsiveModal>
    </div>
  );
}
