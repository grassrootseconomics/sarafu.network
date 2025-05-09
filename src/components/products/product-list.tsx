"use client";
import { FilterIcon, PackageIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Authorization } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { ResponsiveModal } from "../modal";
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
import { ProductForm } from "./product-form";
import { ProductListItem } from "./products-list-item";
import {
  type InsertProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

export const ProductList = ({
  voucher_id,
  voucherSymbol,
  className,
  isOwner,
}: {
  voucher_id: number;
  voucherSymbol: string;
  className?: string;
  isOwner: boolean;
}) => {
  const [selectedProduct, setSelectedProduct] = useState<
    RouterOutput["voucher"]["commodities"][0] | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const { data: products, isLoading } = trpc.voucher.commodities.useQuery(
    {
      voucher_id,
    },
    {
      enabled: !!voucher_id,
    }
  );
  const updateMutation = trpc.products.update.useMutation();
  const insertMutation = trpc.products.insert.useMutation();
  const deleteMutation = trpc.products.remove.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.voucher.commodities.invalidate();
      toast.success("Product deleted");
    } catch (error) {
      toast.error(`Error deleting product: ${(error as Error).message}`);
    }
    setSelectedProduct(null);
  };

  const handleCreate = async (product: InsertProductListingInput) => {
    try {
      await insertMutation.mutateAsync(product);
      await utils.voucher.commodities.invalidate();
      toast.success("Product created");
    } catch (error) {
      toast.error(`Error creating product: ${(error as Error).message}`);
    }
    setSelectedProduct(null);
  };

  const handleUpdate = async (product: UpdateProductListingInput) => {
    try {
      await updateMutation.mutateAsync(product);
      await utils.voucher.commodities.invalidate();
      toast.success("Product updated");
    } catch (error) {
      toast.error(`Error updating product: ${(error as Error).message}`);
    }
    setSelectedProduct(null);
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
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Products</h2>
          <Authorization resource="Products" action="UPDATE" isOwner={isOwner}>
            <ResponsiveModal
              button={
                <Button className="flex items-center space-x-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
              }
              title="Add Product"
              description="Add a new product"
              onOpenChange={(open) => {
                if (open) {
                  setSelectedProduct({
                    voucher_id,
                  } as RouterOutput["voucher"]["commodities"][0]);
                } else {
                  setSelectedProduct(null);
                }
              }}
              open={!!selectedProduct}
            >
              <ProductForm
                product={selectedProduct}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isOwner={isOwner}
                loading={
                  insertMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
              />
            </ResponsiveModal>
          </Authorization>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col h-full rounded-lg overflow-hidden border"
            >
              <Skeleton className="h-40 w-full" />
              <div className="p-5 flex-1">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6 mb-6" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <div className="px-5 py-3 border-t">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isEmptyWithoutFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <PackageIcon className="w-12 h-12 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Products Listed</p>
            <p className="text-sm max-w-md">
              {isOwner
                ? "Add your first product by clicking the 'Add Product' button above."
                : "There are no products available at the moment."}
            </p>
          </div>
          {isOwner && (
            <Authorization
              resource="Products"
              action="UPDATE"
              isOwner={isOwner}
            >
              <Button className="mt-2" onClick={() => {
                setSelectedProduct({
                  voucher_id,
                } as RouterOutput["voucher"]["commodities"][0]);
              }}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </Authorization>
          )}
        </div>
      ) : isEmptyAfterFiltering ? (
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground h-60 bg-muted/20 rounded-lg border border-dashed">
          <SearchIcon className="w-10 h-10 text-muted-foreground/60" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No Matching Products</p>
            <p className="text-sm max-w-md">
              No products match your current search and filter criteria. Try
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                isOwner={isOwner}
                voucherSymbol={voucherSymbol}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
