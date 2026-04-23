"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { DateField } from "~/components/forms/fields/date-field";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { VoucherSelectField } from "~/components/voucher/voucher-select-field";
import { CUSD_TOKEN_ADDRESS } from "@sarafu/core/contacts";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { InputField } from "../../forms/fields/input-field";
import { MapField } from "../../forms/fields/map-field";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import { UserProfileFormSchema } from "@sarafu/schemas/user";

export type UserProfileFormType = z.infer<typeof UserProfileFormSchema>;

interface ProfileFormProps {
  viewOnly?: boolean;
  initialValues: UserProfileFormType;
  isLoading?: boolean;
  buttonLabel: string;
  className?: string;
  onSubmit: (data: UserProfileFormType) => void;
}
export function ProfileForm(props: ProfileFormProps) {
  const form = useForm<UserProfileFormType>({
    resolver: zodResolver(UserProfileFormSchema),
    mode: "onBlur",
    values: props.initialValues,
    defaultValues: {
      default_voucher: CUSD_TOKEN_ADDRESS,
    },
  });
  const vouchersQuery = trpc.voucher.list.useQuery({});
  const onSubmit = (data: UserProfileFormType) => props.onSubmit(data);

  const currentYear = new Date().getFullYear();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4",
          props.className,
        )}
      >
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <ImageUploadField
            form={form}
            name="profile_photo_url"
            folder="profiles"
            label="Profile Photo"
            aspectRatio={1}
            circularCrop
            description="Optional"
            className="h-35"
            disabled={props.viewOnly}
          />
        </div>
        <div className="space-y-4">
          <VoucherSelectField
            form={form}
            name="default_voucher"
            label="Default Voucher"
            placeholder="The voucher you use the most"
            className="space-y-2"
            disabled={props.viewOnly}
            items={vouchersQuery.data ?? []}
          />
          <InputField
            form={form}
            name="given_names"
            placeholder="Given Names"
            label="Given Names"
            disabled={props.viewOnly}
          />
          <InputField
            form={form}
            name="family_name"
            placeholder="Family Name"
            label="Family Name"
            disabled={props.viewOnly}
          />
          <InputField
            form={form}
            name="email"
            placeholder="you@example.com"
            label="Email"
            type="email"
            disabled={props.viewOnly}
          />
          <DateField
            form={form}
            name="date_of_birth"
            label="Date of Birth"
            placeholder="Select your date of birth"
            disabledDate={(date) => date > new Date()}
            fromYear={1920}
            toYear={currentYear}
          />
        </div>
        <div className="space-y-4">
          <MapField
            form={form}
            label="Your Location"
            disabled={props.viewOnly}
            name={"geo"}
            locationName={"location_name"}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell the community about yourself..."
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                    disabled={props.viewOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-center pt-6">
          <Button disabled={props.isLoading || props.viewOnly} type="submit">
            {props.isLoading ? <Loading /> : props.buttonLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
