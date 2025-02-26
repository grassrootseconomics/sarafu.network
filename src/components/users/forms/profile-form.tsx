"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { SelectField } from "~/components/forms/fields/select-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { Authorization } from "~/hooks/useAuth";
import { CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { AccountRoleType } from "~/server/enums";
import { InputField } from "../../forms/fields/input-field";
import { MapField } from "../../forms/fields/map-field";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { UserProfileFormSchema } from "../schemas";

export type UserProfileFormType = z.infer<typeof UserProfileFormSchema>;

interface ProfileFormProps {
  viewOnly?: boolean;
  initialValues: UserProfileFormType;
  isLoading?: boolean;
  buttonLabel: string;
  className?: string;
  onSubmit: (data: UserProfileFormType) => void;
}
export const ProfileForm = (props: ProfileFormProps) => {
  const form = useForm<UserProfileFormType>({
    resolver: zodResolver(UserProfileFormSchema),
    mode: "onBlur",
    values: props.initialValues,
    defaultValues: {
      default_voucher: CUSD_TOKEN_ADDRESS,
    },
  });
  const utils = trpc.useUtils();
  const vouchersQuery = trpc.voucher.list.useQuery();
  const onSubmit = async (data: UserProfileFormType) => {
    try {
      if (data.vpa) {
        const result = await utils.client.user.getAddressBySearchTerm.query({
          searchTerm: data.vpa,
        });
        // TODO Fix this check
        if (
          result?.blockchain_address &&
          data.vpa !== props.initialValues.vpa
        ) {
          form.setError("vpa", {
            type: "manual",
            message: "VPA already exists",
          });
          form.setFocus("vpa");
          return; // Return early if VPA already exists
        }
      }
      props.onSubmit(data); // Call onSubmit outside of the else block
    } catch (error) {
      console.error("Failed to check username", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 md:gap-8",
          props.className
        )}
      >
        <div>
          <InputField
            form={form}
            name="vpa"
            placeholder="Shortcode/Alias"
            label="Shortcode/Alias"
            description="This is a unique identifier that can be used by others to send you vouchers."
            disabled={props.viewOnly}
          />
          <SelectVoucherField
            form={form}
            name="default_voucher"
            label="Default Voucher"
            placeholder="The voucher you use the most"
            className="space-y-2 mt-2"
            getFormValue={(v) => v.voucher_address}
            searchableValue={(x) => `${x.voucher_name} ${x.symbol}`}
            renderItem={(x) => (
              <VoucherChip
                voucher_address={x.voucher_address as `0x${string}`}
              />
            )}
            renderSelectedItem={(x) => (
              <VoucherChip
                voucher_address={x.voucher_address as `0x${string}`}
              />
            )}
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
            name="year_of_birth"
            placeholder="Year of Birth"
            label="Year of Birth"
            disabled={props.viewOnly}
          />
          <Authorization resource="Users" action={"UPDATE_ROLE"}>
            <SelectField
              form={form}
              name="role"
              label="Role"
              items={Object.keys(AccountRoleType).map((value) => ({
                value: value,
                label: value,
              }))}
            />
          </Authorization>
        </div>
        <div>
          <MapField
            form={form}
            label="Your Location"
            disabled={props.viewOnly}
            name={"geo"}
            locationName={"location_name"}
          />
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-evenly align-middle py-8">
          <Button disabled={props.isLoading || props.viewOnly} type="submit">
            {props.isLoading ? <Loading /> : props.buttonLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
