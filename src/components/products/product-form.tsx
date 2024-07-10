import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Override } from "~/utils/type-helpers";
import { InputField } from "../forms/fields/input-field";
import { Loading } from "../loading";
import { Button } from "../ui/button";
import {
  updateProductListingInput,
  type UpdateProductListingInput,
} from "./schema";

interface ProductFormProps {
  loading: boolean;
  onCreate: (data: Omit<UpdateProductListingInput, "id">) => Promise<void>;
  onUpdate: (data: UpdateProductListingInput) => Promise<void>;
  product: Override<UpdateProductListingInput, { price: number | null }> | null;
}

export const ProductForm = ({
  onCreate,
  onUpdate,
  loading,
  product,
}: ProductFormProps) => {
  const form = useForm<UpdateProductListingInput>({
    resolver: zodResolver(updateProductListingInput),
    mode: "onBlur",
    defaultValues: { ...product, price: product?.price ?? undefined },
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: UpdateProductListingInput) => {
    if (product) {
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
        <InputField label="Commodity Type" form={form} name="commodity_type" />
        <InputField label="Quantity" name="quantity" form={form} />
        <InputField form={form} label="Frequency" name="frequency" />
        <Button type="submit" disabled={loading}>
          {loading ? <Loading /> : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
};
