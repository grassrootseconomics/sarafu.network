"use client";
import { PackageIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Authorization } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ProductForm } from "./product-form";
import { ProductListItem } from "./products-list-item";
import {
  type InsertProductListingInput,
  type UpdateProductListingInput,
} from "./schema";
import { trpc } from "~/lib/trpc";
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
  const { data: products } = trpc.voucher.commodities.useQuery(
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

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Authorization resource="Products" action="UPDATE" isOwner={isOwner}>
          <ResponsiveModal
            button={
              <Button variant="outline" className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            }
            title="Product"
            open={selectedProduct !== null}
            onOpenChange={(open) =>
              setSelectedProduct(
                open
                  ? ({
                      voucher_id: voucher_id,
                    } as RouterOutput["voucher"]["commodities"][0])
                  : null
              )
            }
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

      {products && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 h-48">
          <PackageIcon className="w-8 h-8" />
          <p>No Products Listed</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
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
