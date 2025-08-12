"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
export function ProfileForm(props: ProfileFormProps) {
  const t = useTranslations("forms");
  
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4",
          props.className
        )}
      >
        <div className="space-y-4">
          <SelectVoucherField
            form={form}
            name="default_voucher"
            label={t("defaultVoucher")}
            placeholder={t("defaultVoucherPlaceholder")}
            className="space-y-2"
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
            placeholder={t("givenNames")}
            label={t("givenNames")}
            disabled={props.viewOnly}
          />
          <InputField
            form={form}
            name="family_name"
            placeholder={t("familyName")}
            label={t("familyName")}
            disabled={props.viewOnly}
          />
          <InputField
            form={form}
            name="year_of_birth"
            placeholder={t("yearOfBirth")}
            label={t("yearOfBirth")}
            disabled={props.viewOnly}
          />
          <Authorization resource="Users" action={"UPDATE_ROLE"}>
            <SelectField
              form={form}
              name="role"
              label={t("role")}
              items={Object.keys(AccountRoleType).map((value) => ({
                value: value,
                label: value,
              }))}
            />
          </Authorization>
        </div>
        <div className="space-y-4">
          <MapField
            form={form}
            label={t("yourLocation")}
            disabled={props.viewOnly}
            name={"geo"}
            locationName={"location_name"}
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
