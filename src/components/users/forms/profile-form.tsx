import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { InputField } from "../../forms/fields/input-field";
import { MapField } from "../../forms/fields/map-field";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";

const VPA_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z]+$/;

export const UserProfileFormSchema = z.object({
  vpa: z
    .string()
    .toLowerCase()
    .trim()
    .optional()
    .refine((v) => {
      if (!v) return true;
      return VPA_PATTERN.test(v);
    }, "Invalid VPA format"),
  year_of_birth: z.coerce.number().nullable(),
  family_name: z.string().trim().nullable(),
  given_names: z.string().trim().nullable(),
  location_name: z.string().trim().max(64).nullable(),
  default_voucher: z.string().nullable(),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});

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
  });
  const utils = api.useUtils();
  const vouchersQuery = api.voucher.list.useQuery();
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
            searchableValue={(x) => `${x.voucher_name} ${x.symbol}`}
            renderItem={(x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                {x.voucher_name}
                <div className="ml-2 bg-gray-100 rounded-md px-2 py-1">
                  <strong>{x.symbol}</strong>
                </div>
              </div>
            )}
            renderSelectedItem={(x) => `${x.voucher_name} (${x.symbol})`}
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
