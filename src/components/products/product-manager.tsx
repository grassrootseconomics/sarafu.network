"use client";
import { toast } from "sonner";
import { Authorization } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { ResponsiveModal } from "../modal";
import { ProductForm } from "./product-form";
import {
  type InsertProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

// Database return type for voucher commodities

type Product = InsertProductListingInput | UpdateProductListingInput;

interface ProductManagerProps {
  isOwner: boolean | undefined;
  buttonText?: string;
  buttonClassName?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  product?: Product | null;
  onComplete?: () => void;
}

export function ProductManager({
  isOwner,
  showTitle = true,
  showDescription = true,
  product,
  onComplete,
}: ProductManagerProps) {
  const isEdit = product && "id" in product;
  const updateMutation = trpc.products.update.useMutation();
  const insertMutation = trpc.products.insert.useMutation();
  const deleteMutation = trpc.products.remove.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.products.list.invalidate();
      onComplete?.();
      toast.success("Offer deleted");
    } catch (error) {
      toast.error(`Error deleting offer: ${(error as Error).message}`);
    }
  };

  const handleCreate = async (product: InsertProductListingInput) => {
    try {
      await insertMutation.mutateAsync(product);
      await utils.products.list.invalidate();
      onComplete?.();
      toast.success("Offer created");
    } catch (error) {
      toast.error(`Error creating offer: ${(error as Error).message}`);
    }
  };

  const handleUpdate = async (product: UpdateProductListingInput) => {
    try {
      await updateMutation.mutateAsync(product);
      await utils.products.list.invalidate();
      onComplete?.();
      toast.success("Offer updated");
    } catch (error) {
      toast.error(`Error updating Offer: ${(error as Error).message}`);
    }
  };

  return (
    <Authorization resource="Products" action="UPDATE" isOwner={isOwner}>
      <ResponsiveModal
        title={
          showTitle ? (isEdit ? "Edit Offer" : "Add Offer") : undefined
        }
        description={
          showDescription
            ? isEdit
              ? "Edit your Offer"
              : "Add a new Offer"
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            onComplete?.();
          }
        }}
        open={!!product}
      >
        {product && (
          <ProductForm
            product={product}
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
        )}
      </ResponsiveModal>
    </Authorization>
  );
}
