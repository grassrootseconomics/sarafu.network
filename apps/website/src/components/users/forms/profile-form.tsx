import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { UpdateUserProfileInput } from "@grassroots/validators/user";
import { updateUserProfileInput } from "@grassroots/validators/user";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { InputField } from "../../forms/fields/input-field";
import { MapField } from "../../forms/fields/map-field";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";


interface ProfileFormProps {
  viewOnly?: boolean;
  initialValues: UpdateUserProfileInput;
  isLoading?: boolean;
  buttonLabel: string;
  className?: string;
  onSubmit: (data: UpdateUserProfileInput) => void;
}
export const ProfileForm = (props: ProfileFormProps) => {
  const form = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileInput),
    mode: "onBlur",
    values: props.initialValues,
  });
  const utils = api.useUtils();
  const vouchersQuery = api.voucher.list.useQuery();
  const onSubmit = async (data: UpdateUserProfileInput) => {
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
            placeholder="name@x"
            label="Alias"
            description="Your alias is a unique identifier that can be used by others to send you vouchers. It must be in the following format name@domain"
            disabled={props.viewOnly}
          />
          <SelectVoucherField
            form={form}
            name="default_voucher"
            label="Default Voucher"
            placeholder="Default Voucher"
            className="space-y-2 mt-2"
            getFormValue={(v) => v.voucher_address}
            searchableValue={(v) => `${v.voucher_name} (${v.symbol})`}
            renderSelectedItem={(v) => `${v.voucher_name} (${v.symbol})`}
            disabled={props.viewOnly}
            renderItem={(v) => `${v.voucher_name} (${v.symbol})`}
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
