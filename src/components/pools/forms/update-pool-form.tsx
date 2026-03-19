"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { UoaField } from "~/components/forms/fields/uoa-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Authorization } from "~/hooks/useAuth";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { addressSchema } from "~/utils/zod";

const commonPoolSchema = z.object({
  pool_name: z.string().max(255).optional().nullable(),
  swap_pool_description: z.string().max(900, "Description is too long"),
  banner_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()),
  unit_of_account: z.string().min(1, "Unit of account is required"),
});

// removed unused createPoolSchema in this file

const updatePoolSchema = commonPoolSchema.extend({
  pool_address: addressSchema,
});

export function UpdatePoolForm({
  initialValues,
}: {
  initialValues: z.infer<typeof updatePoolSchema>;
}) {
  const form = useForm<z.infer<typeof updatePoolSchema>>({
    resolver: zodResolver(updatePoolSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });
  const isOwner = useIsContractOwner(initialValues.pool_address);
  const utils = trpc.useUtils();
  const router = useRouter();
  const update = trpc.pool.update.useMutation({
    onError(error) {
      console.error(error);
      toast.error("Something went wrong");
    },
  });
  const remove = trpc.pool.remove.useMutation({
    onError(error) {
      console.error(error);
      toast.error("Something went wrong");
    },
    onSuccess() {
      toast.success("Pool removed successfully");
      router.push("/pools");
    },
  });
  const onSubmit = async (data: z.infer<typeof updatePoolSchema>) => {
    await update.mutateAsync(data);
    await utils.pool.get.refetch(data.pool_address);
    toast.success("Pool updated successfully");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <InputField
          form={form}
          name="pool_name"
          label="Pool Name"
          placeholder="Custom display name for this pool"
        />
        <TagsField
          form={form}
          name="tags"
          label="Pool Tags"
          mode="multiple"
          placeholder="Select or create tags about your pool"
        />

        <TextAreaField
          form={form}
          name="swap_pool_description"
          label="Pool Description"
          placeholder=""
          rows={6}
        />
        <ImageUploadField
          form={form}
          folder="pools"
          name="banner_url"
          aspectRatio={16 / 9}
          label="Pool Image"
          placeholder="Upload banner image"
        />
        <UoaField
          form={form}
          name="unit_of_account"
          label="Unit of Account"
          description="The unit used for pricing in this pool"
          currentValue={initialValues.unit_of_account}
        />
        <div className="flex justify-between items-center space-x-4">
          <Button
            type="submit"
            disabled={update.isPending || remove.isPending}
            className="w-full font-bold py-2 px-4 rounded focus:outline-hidden focus:shadow-outline"
          >
            {update.isPending || remove.isPending ? <Loading /> : "Update"}
          </Button>
          <Authorization resource={"Pools"} action="DELETE" isOwner={isOwner}>
            <AreYouSureDialog
              disabled={update.isPending || remove.isPending}
              title="Are you sure?"
              description="This will remove the Pool from the index"
              onYes={() => remove.mutate(initialValues.pool_address)}
            />
          </Authorization>
        </div>
      </form>
    </Form>
  );
}
