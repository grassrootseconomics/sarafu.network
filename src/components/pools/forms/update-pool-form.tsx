"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { Authorization } from "~/hooks/useAuth";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { addressSchema } from "~/utils/zod";

const commonPoolSchema = z.object({
  swap_pool_description: z.string().max(900, "Description is too long"),
  banner_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()),
  default_voucher: addressSchema,
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
  const { data: vouchers } = trpc.voucher.list.useQuery({});
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
        <SelectVoucherField
          form={form}
          name="default_voucher"
          label="Default Voucher"
          placeholder="Select voucher"
          className="flex-grow"
          getFormValue={(v) => v.voucher_address}
          searchableValue={(x) => `${x.symbol} ${x.voucher_name}`}
          renderSelectedItem={(item) => (
            <VoucherChip
              voucher_address={item.voucher_address as `0x${string}`}
            />
          )}
          renderItem={(item) => (
            <VoucherChip
              voucher_address={item.voucher_address as `0x${string}`}
            />
          )}
          items={vouchers ?? []}
        />
        <div className="flex justify-between items-center space-x-4">
          <Button
            type="submit"
            disabled={update.isPending || remove.isPending}
            className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
