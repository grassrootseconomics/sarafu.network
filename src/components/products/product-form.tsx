import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Authorization } from "~/hooks/useAuth";
import AreYouSureDialog from "../dialogs/are-you-sure";
import { ImageUploadField } from "../forms/fields/image-upload-field";
import { InputField } from "../forms/fields/input-field";
import { SelectField } from "../forms/fields/select-field";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  type InsertProductListingInput,
  insertProductListingInput,
  type ProductFormInput,
  updateProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

interface ProductFormProps {
  isOwner: boolean;
  loading: boolean;
  onCreate: (data: InsertProductListingInput) => Promise<void>;
  onUpdate: (data: UpdateProductListingInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  product: ProductFormInput | null;
}

export const ProductForm = ({
  isOwner,
  onCreate,
  onUpdate,
  onDelete,
  loading,
  product,
}: ProductFormProps) => {
  const isEdit = product && "id" in product;

  const form = useForm<Omit<UpdateProductListingInput, "id">>({
    resolver: zodResolver(
      isEdit ? updateProductListingInput : insertProductListingInput
    ),
    mode: "onBlur",
    defaultValues: {
      ...product,
      image_url: product?.image_url === "" ? null : product?.image_url,
    },
  });
  const { handleSubmit } = form;

  const onSubmit = async (data: ProductFormInput) => {
    if (!product || !product.voucher_address) return;
    if (isEdit) {
      await onUpdate({ ...data, id: product.id });
    } else {
      await onCreate(data);
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField label="Name" form={form} name="commodity_name" />
        <SelectField
          label="Type"
          form={form}
          name="commodity_type"
          items={[
            { label: "Good", value: "GOOD" },
            { label: "Service", value: "SERVICE" },
          ]}
        />
        <InputField
          label="Description"
          form={form}
          name="commodity_description"
          className="md:col-span-2"
        />
        <InputField label="Price" form={form} name="price" type="number" />
        <InputField label="Quantity" name="quantity" form={form} />
        <SelectField
          form={form}
          name="frequency"
          label="Frequency"
          placeholder="How often is the quantity available?"
          items={[
            { value: "day", label: "Daily" },
            { value: "week", label: "Weekly" },
            { value: "month", label: "Monthly" },
            { value: "year", label: "Yearly" },
          ]}
        />
        <ImageUploadField
          label="Image (Optional)"
          form={form}
          name="image_url"
          folder="product-images"
          className="md:col-span-2"
        />
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loading /> : isEdit ? "Update" : "Create"}
          </Button>
          <Authorization resource="Products" action="DELETE" isOwner={isOwner}>
            {isEdit && (
              <AreYouSureDialog
                disabled={loading}
                title="Are you sure?"
                description="This will permanently delete the product listing."
                onYes={() => onDelete(product.id)}
              />
            )}
          </Authorization>
        </div>
      </form>
    </FormProvider>
  );
};
