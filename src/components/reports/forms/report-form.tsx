"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateRangeField } from "~/components/forms/fields/date-range.field";
import { MapField } from "~/components/forms/fields/map-field";
import { PlateField } from "~/components/forms/fields/plate-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { ResponsiveModal } from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherSelectItem } from "~/components/voucher/select-voucher-item";
import { trpc } from "~/lib/trpc";

const createReportSchema = z.object({
  title: z.string(),

  vouchers: z.array(z.string()),
  description: z.string(),
  image: z.string().url().optional(),
  tags: z.array(z.string()),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  period: z
    .object({
      from: z.date({
        required_error: "A start date is required.",
      }),
      to: z.date({
        required_error: "A end date is required.",
      }),
    })
    .optional(),
  created_by: z.string().optional(),
  modified_by: z.string().optional(),
  verified_by: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
});
[
  {
    children: [
      {
        text: "Title",
      },
    ],
    type: "h1",
  },
  {
    children: [
      {
        text: "asd",
      },
    ],
    type: "p",
  },
];
export function ReportForm() {
  const form = useForm<z.infer<typeof createReportSchema>>({
    resolver: zodResolver(createReportSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      tags: [],
      description:
        '[{"children": [{"text": "Title"}],"type": "h1"}, {"children": [{"text": ""}],"type": "p"}]',
      // Last Month
      period: {
        from: addMonths(new Date(), -1),
        to: new Date(),
      },
    },
  });
  const { data: voucherList } = trpc.voucher.list.useQuery();
  const onSubmit = (data: z.infer<typeof createReportSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SelectVoucherField
          form={form}
          name="vouchers"
          label="Vouchers"
          description="You can select multiple vouchers."
          placeholder="Choose vouchers"
          items={
            voucherList?.map((v) => ({
              address: v.voucher_address as `0x${string}`,
              name: v.voucher_name,
              icon: v.icon_url,
              symbol: v.symbol.toUpperCase(),
            })) ?? []
          }
          renderItem={(v) => (
            <VoucherSelectItem voucher={v} showBalance={false} />
          )}
          searchableValue={(v) => `${v.symbol} ${v.name} `}
          getFormValue={(v) => v.address}
          renderSelectedItem={(v) => (
            <div className="flex items-center gap-1 px-2">
              {v.name}{" "}
              <span className="text-xs text-muted-foreground">
                ({v.symbol})
              </span>
            </div>
          )}
          isMultiSelect
        />
        <DateRangeField form={form} name="period" label="Report Period" />
        <TagsField
          form={form}
          name="tags"
          label="Tags"
          placeholder="Select or create tags about your report"
          mode="multiple"
        />
        <PlateField
          form={form}
          name="description"
          label="Report"
          placeholder="Describe your report"
        />
        <MapField form={form} name="location" label="Report Location" />
        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto my-4">
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
interface ReportFormDialogProps {
  button?: React.ReactNode;
}

export const ReportFormDialog = (props: ReportFormDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Create Report"
      description="Create a report about a pool"
      button={
        props.button ? (
          props.button
        ) : (
          <Button variant={"outline"}>Create Report</Button>
        )
      }
    >
      <ReportForm />
    </ResponsiveModal>
  );
};
