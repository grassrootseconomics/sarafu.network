"use client";
import { PackageIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import { ProductListItem } from "../products/products-list-item";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { type SwapPool } from "./types";

interface PoolProductsListProps {
  pool: SwapPool;
}

export function PoolProductsList({ pool }: PoolProductsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allProducts, isLoading } = trpc.products.list.useQuery({
    voucher_addresses: pool.vouchers,
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
            <p className="text-lg font-medium mb-1">No Products Available</p>
            <p className="text-sm max-w-md">
              There are no products listed for the vouchers in this pool.
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
            <p className="text-lg font-medium mb-1">No Matching Products</p>
            <p className="text-sm max-w-md">
              No products match your search criteria. Try adjusting your search.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3 w-full">
        {filteredProducts.map((product, idx) => {
          return (
            <ProductListItem
              key={`product-${product.id}-${idx}`}
              product={product}
              isOwner={false}
            />
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>
      {getContents()}
    </div>
  );
}
