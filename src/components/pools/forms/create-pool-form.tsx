import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConnectButton } from "~/components/buttons/connect-button";
import { ComboBoxField } from "~/components/forms/fields/combo-box-field";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { PoolIndex } from "~/contracts";
import { useAuth } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { type InferAsyncGenerator } from "~/server/api/routers/pool";
import { api } from "~/utils/api";
import CreatePoolStats from "../create-pool-status";

const createPoolSchema = z.object({
  poolName: z.string().min(3, "Pool name must be at least 3 characters"),
  poolSymbol: z
    .string()
    .min(2, "Pool symbol must be at least 2 characters")
    .refine(
      async (value) => {
        try {
          const exists = await PoolIndex.exists(value);
          return !exists;
        } catch (error) {
          console.error(error);
        }
      },
      { message: "Symbol already exists please pick another" }
    ),
  poolDescription: z.string().max(900, "Description is too long"),
  bannerUrl: z.string().url().optional(),
  poolTags: z.array(z.string()),
});

export function CreatePoolForm() {
  const form = useForm<z.infer<typeof createPoolSchema>>({
    resolver: zodResolver(createPoolSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolTags: [],
    },
  });
  const router = useRouter();
  const [status, setStatus] = useState<
    InferAsyncGenerator<RouterOutput["pool"]["create"]>[]
  >([]);
  const auth = useAuth();
  const utils = api.useUtils();
  const { mutateAsync: deploy } = api.pool.create.useMutation({
    trpc: {
      context: {
        // Use HTTP streaming for this request
        stream: true,
      },
    },
  });
  const { data: tags } = api.tags.list.useQuery();
  const { mutateAsync: createTag } = api.tags.create.useMutation();
  const onSubmit = async (data: z.infer<typeof createPoolSchema>) => {
    const generator = await deploy({
      name: data.poolName,
      symbol: data.poolSymbol,
      description: data.poolDescription,
      banner_url: data.bannerUrl,
      tags: data.poolTags,
      decimals: 6,
    });
    for await (const data of generator) {
      setStatus((s) => [...s, data]);
      if (data.status === "success") {
        await router.push(`/pools/${data.address}`);
        break;
      }
      if (data.status === "error") {
        toast.error(data.error ?? "An error occurred");
        setStatus((s) => [...s, data]);
        break;
      }
    }
  };

  const onCreateTag = async (tag: string) => {
    await createTag({ name: tag });
    await utils.tags.list.invalidate();
  };
  return (
    <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-lg">
      {!form.formState.isSubmitting ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              form={form}
              name="poolName"
              label="Pool Name"
              placeholder="Enter pool name"
              type="text"
            />
            <InputField
              form={form}
              name="poolSymbol"
              label="Pool Symbol"
              placeholder="Enter pool symbol"
              type="text"
            />
            <ComboBoxField
              getValue={(item) => item.tag}
              getLabel={(item) => item.tag}
              form={form}
              name="poolTags"
              label="Pool Tags"
              mode="multiple"
              onCreate={onCreateTag}
              description="Select or create tags for your pool"
              options={tags ?? []}
            />
            <TextAreaField
              form={form}
              name="poolDescription"
              label="Pool Description"
              placeholder="Describe your pool"
              rows={4}
            />
            <ImageUploadField
              form={form}
              folder="pools"
              name="bannerUrl"
              aspectRatio={16 / 9}
              label="Pool Banner Image"
              placeholder="Upload banner image"
            />
            {auth?.user ? (
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                type="submit"
                className="w-full"
              >
                Create Pool
              </Button>
            ) : (
              <ConnectButton className="w-full" />
            )}
          </form>
        </Form>
      ) : (
        <CreatePoolStats status={status} />
      )}
    </div>
  );
}
