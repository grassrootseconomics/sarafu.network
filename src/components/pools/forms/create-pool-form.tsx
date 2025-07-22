"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConnectButton } from "~/components/buttons/connect-button";
import StatusDisplay from "~/components/deploy-status";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Button, buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { PoolIndex } from "~/contracts";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { type InferAsyncGenerator } from "~/server/api/routers/pool";
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
  sproutLicense: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
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
  const { mutateAsync: deploy } = trpc.pool.create.useMutation({
    trpc: {
      context: {
        // Use HTTP streaming for this request
        stream: true,
      },
    },
  });
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
        router.push(`/pools/${data.address}`);
        break;
      }
      if (data.status === "error") {
        toast.error(data.error ?? "An error occurred");
        setStatus((s) => [...s, data]);
        break;
      }
    }
  };

  return (
    <div className="w-full rounded-2xl border-2 border-blue-100 bg-white p-8 shadow-xl backdrop-blur-sm">
      {status.length === 0 ? (
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Pool Details</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill out the information below to create your community pool
            </p>
          </div>
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
              label="Pool Shortcode"
              placeholder="Enter pool shortcode, eg. ABC1"
              type="text"
            />
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
            <div className="flex-col items-center justify-center mt-4">
              <CheckBoxField
                form={form}
                name="termsAndConditions"
                label={
                  <>
                    <span className="font-normal">Accept </span>
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "link", size: "xs" }),
                        "p-0"
                      )}
                      href="https://grassecon.org/pages/terms-and-conditions"
                    >
                      Terms and Conditions
                    </Link>
                  </>
                }
                description="You agree to our Terms of Service and Privacy Policy"
              />
              <CheckBoxField
                form={form}
                name="sproutLicense"
                label={
                  <>
                    <span className="font-normal">Accept </span>
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "link", size: "xs" }),
                        "p-0"
                      )}
                      href="https://docs.grassecon.org/commons/sprout/"
                    >
                      SPROUT License
                    </Link>
                  </>
                }
                description="This Pool operates under the SPROUT License (v1.0): Stewarded Pools for Relational Obligations and Unified Trust. It circulates symbolic commitments, not enforceable payments or contractual wages. Participation is voluntary, curated, and governed by peer trust.
"
              />
            </div>
            {auth?.user ? (
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                🚀 Create My Pool
              </Button>
            ) : (
              <ConnectButton className="w-full" />
            )}
          </form>
        </Form>
        </div>
      ) : (
        <StatusDisplay
          title="Creating Your Pool"
          steps={status}
          expectedSteps={4}
        />
      )}
    </div>
  );
}
