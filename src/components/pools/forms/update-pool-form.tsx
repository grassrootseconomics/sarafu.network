import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Address } from "viem";
import { z } from "zod";
import { ComboBoxField } from "~/components/forms/fields/combo-box-field";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { api } from "~/utils/api";

const updatePoolSchema = z.object({
  poolDescription: z.string().max(900, "Description is too long"),
  bannerUrl: z.string().url().optional().nullable(),
  poolTags: z.array(z.string()),
});

export function UpdatePoolForm({
  address,
  poolDescription,
  bannerUrl,
  poolTags,
}: {
  address: Address;
  poolDescription: string | undefined;
  bannerUrl: string | undefined | null;
  poolTags: string[] | undefined;
}) {
  const form = useForm<z.infer<typeof updatePoolSchema>>({
    resolver: zodResolver(updatePoolSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolDescription: poolDescription ?? "",
      bannerUrl: bannerUrl,
      poolTags: poolTags ?? [],
    },
  });
  const utils = api.useUtils();
  const { mutateAsync: update, isPending } = api.pool.update.useMutation({
    onError(error) {
      console.log(error);
      toast.error("Something went wrong");
    },
  });
  const { data: tags } = api.tags.list.useQuery();
  const { mutateAsync: createTag } = api.tags.create.useMutation();
  const onSubmit = async (data: z.infer<typeof updatePoolSchema>) => {
    await update({
      address: address,
      swap_pool_description: data.poolDescription,
      banner_url: data.bannerUrl,
      tags: data.poolTags,
    });
    await utils.pool.get.invalidate(address);
    toast.success("Pool updated successfully");
  };

  const onCreateTag = async (tag: string) => {
    await createTag({ name: tag });
    await utils.tags.list.invalidate();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <ComboBoxField
          getValue={(item) => item.tag}
          getLabel={(item) => item.tag}
          form={form}
          name="poolTags"
          label="Pool Tags"
          mode="multiple"
          onCreate={onCreateTag}
          description="Select the tags for your pool."
          options={tags ?? []}
        />

        <TextAreaField
          form={form}
          name="poolDescription"
          label="Pool Description"
          placeholder=""
          rows={6}
        />
        <ImageUploadField
          form={form}
          folder="pools"
          name="bannerUrl"
          aspectRatio={16 / 9}
          label="Pool Image"
          placeholder="Upload banner image"
        />
        <Button type="submit" className="w-full">
          {isPending ? <Loading /> : "Update"}
        </Button>
      </form>
    </Form>
  );
}
