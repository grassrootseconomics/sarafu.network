"use client";
import { FilterIcon, PackageIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { ProductManager } from "./product-manager";
import { ProductListItem } from "./products-list-item";
import { type ProductFormInput } from "./schema";
export const ProductList = ({
  voucher_address,
  className,
  isOwner,
}: {
  voucher_address: `0x${string}`;
  className?: string;
  isOwner: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [editingProduct, setEditingProduct] = useState<ProductFormInput | null>(
    null
  );

  const {
    data: products,
    isLoading,
    refetch,
  } = trpc.products.list.useQuery(
    {
      voucher_addresses: [voucher_address],
    },
    {
      enabled: !!voucher_address,
    }
  );

  const handleComplete = async () => {
    setEditingProduct(null);
    await refetch();
  };

  const handleEditProduct = (
    product: RouterOutputs["products"]["list"][number]
  ) => {
    setEditingProduct(product);
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.commodity_description &&
        product.commodity_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === "ALL" || product.commodity_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const isFiltering = searchTerm !== "" || typeFilter !== "ALL";
  const isEmpty =
    !isLoading && (!filteredProducts || filteredProducts.length === 0);
  const isEmptyAfterFiltering = isEmpty && isFiltering;
  const isEmptyWithoutFiltering = isEmpty && !isFiltering;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ProductManager
        isOwner={isOwner}
        onComplete={handleComplete}
        product={editingProduct}
      />
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Offers</h2>
          <Button
            onClick={() =>
              setEditingProduct({
                voucher_address: voucher_address,
                commodity_name: "",
                commodity_description: "",
                commodity_type: "GOOD",
                price: null,
                quantity: null,
                image_url: null,
                frequency: null,
              })
            }
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[180px]">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="GOOD">Goods</SelectItem>
                <SelectItem value="SERVICE">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
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
      ) : isEmptyWithoutFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <PackageIcon className="w-12 h-12 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Offers Listed</p>
            <p className="text-sm max-w-md">
              {isOwner
                ? "Add your first offer by clicking the 'Add Offer' button above."
                : "There are no offers available at the moment."}
            </p>
          </div>
          {isOwner && (
            <Button
              onClick={() =>
                setEditingProduct({
                  voucher_address: voucher_address,
                  commodity_name: "",
                  commodity_description: "",
                  commodity_type: "GOOD",
                  price: null,
                  quantity: null,
                  image_url: null,
                  frequency: null,
                })
              }
            >
              Add Your First Offer
            </Button>
          )}
        </div>
      ) : isEmptyAfterFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <SearchIcon className="w-10 h-10 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Matching Offers</p>
            <p className="text-sm max-w-md">
              No offers match your current search and filter criteria. Try
              adjusting your filters.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("ALL");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            {filteredProducts?.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                isOwner={isOwner}
                onEditClick={() => handleEditProduct(product)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
