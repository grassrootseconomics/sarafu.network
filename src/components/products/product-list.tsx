import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { api } from "~/utils/api";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ProductForm } from "./product-form";
import { ProductListItem } from "./products-list-item";
import {
  type InsertProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

export const ProductList = ({
  voucher_id,
  className,
}: {
  voucher_id: number;
  className?: string;
}) => {
  const [selectedProduct, setSelectedProduct] = useState<
    RouterOutput["voucher"]["commodities"][0] | null
  >(null);

  const { data: products } = api.voucher.commodities.useQuery(
    {
      voucher_id,
    },
    {
      enabled: !!voucher_id,
    }
  );

  const updateMutation = api.products.update.useMutation();
  const insertMutation = api.products.insert.useMutation();
  const utils = api.useUtils();
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
      <div className="flex justify-between">
        <h2 className="text-primary-foreground bg-primary rounded-full p-1 px-6 text-base w-fit font-light text-center">
          Products
        </h2>
        <ResponsiveModal
          button={
            <Button variant="ghost" size="xs">
              <PlusIcon className="size-5" />
            </Button>
          }
          title="Product"
          open={selectedProduct !== null}
          onOpenChange={(open) =>
            setSelectedProduct(
              open ? ({} as RouterOutput["voucher"]["commodities"][0]) : null
            )
          }
        >
          <ProductForm
            product={selectedProduct}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            loading={insertMutation.isPending || updateMutation.isPending}
          />
        </ResponsiveModal>
      </div>

      {products && products.length === 0 ? (
        <div className="text-center font-light p-4">No Products Listed</div>
      ) : (
        <ScrollArea className="p-2 flex-1 overflow-y-auto bg-white my-2 relative">
          {products?.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
};
