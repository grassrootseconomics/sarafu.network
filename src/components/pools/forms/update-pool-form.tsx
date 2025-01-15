"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Address } from "viem";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Authorization } from "~/hooks/useAuth";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
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
  const isOwner = useIsContractOwner(address);
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
    await update.mutateAsync({
      address: address,
      swap_pool_description: data.poolDescription,
      banner_url: data.bannerUrl,
      tags: data.poolTags,
    });
    await utils.pool.get.invalidate(address);
    toast.success("Pool updated successfully");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <TagsField
          form={form}
          name="poolTags"
          label="Pool Tags"
          mode="multiple"
          placeholder="Select or create tags about your pool"
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
              onYes={() => remove.mutate(address)}
            />
          </Authorization>
        </div>
      </form>
    </Form>
  );
}
