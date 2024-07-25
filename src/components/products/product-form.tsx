import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { type Override } from "~/utils/type-helpers";
import AreYouSureDialog from "../dialogs/are-you-sure";
import { InputField } from "../forms/fields/input-field";
import { SelectField } from "../forms/fields/select-field";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  insertProductListingInput,
  updateProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

interface ProductFormProps {
  loading: boolean;
  onCreate: (data: Omit<UpdateProductListingInput, "id">) => Promise<void>;
  onUpdate: (data: UpdateProductListingInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  product: Override<UpdateProductListingInput, { price: number | null }> | null;
}

export const ProductForm = ({
  onCreate,
  onUpdate,
  onDelete,
  loading,
  product,
}: ProductFormProps) => {
  const form = useForm<UpdateProductListingInput>({
    resolver: zodResolver(
      product?.id ? updateProductListingInput : insertProductListingInput
    ),
    mode: "onBlur",
    defaultValues: { ...product, price: product?.price ?? 0 },
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: UpdateProductListingInput) => {
    console.log("first");
    if (product?.id) {
      await onUpdate({ ...data, id: product.id });
    } else {
      await onCreate(data);
    }
  };
  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-1 border-slate-50"
      >
        <InputField label="Commodity Name" form={form} name="commodity_name" />
        <InputField
          label="Commodity Description"
          form={form}
          name="commodity_description"
        />
        <InputField label="Price" form={form} name="price" type="number" />
        <SelectField
          label="Commodity Type"
          form={form}
          name="commodity_type"
          items={[
            { label: "Good", value: "GOOD" },
            { label: "Service", value: "SERVICE" },
          ]}
        />
        <InputField label="Quantity" name="quantity" form={form} />
        <SelectField
          form={form}
          name="frequency"
          label={"Frequency"}
          placeholder="How often is the quantity available?"
          items={[
            {
              value: "day",
              label: "Daily",
            },
            {
              value: "week",
              label: "Weekly",
            },
            {
              value: "month",
              label: "Monthly",
            },
            {
              value: "year",
              label: "Yearly",
            },
          ]}
        />
        <div className="flex justify-between items-center space-x-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? <Loading /> : product?.id ? "Update" : "Create"}
          </Button>
          {product && (
            <AreYouSureDialog
              disabled={loading}
              title="Are you sure?"
              description="This will remove the Pool from the index"
              onYes={() => onDelete(product.id)}
            />
          )}
        </div>
      </form>
    </FormProvider>
  );
};
