"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateRangeField } from "~/components/forms/fields/date-range.field";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { PlateField } from "~/components/forms/fields/plate-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { Loading } from "~/components/loading";
import { ResponsiveModal } from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherSelectItem } from "~/components/voucher/select-voucher-item";
import { Authorization, useAuth } from "~/hooks/useAuth";
import { RouterOutputs, trpc } from "~/lib/trpc";
import { ReportStatus } from "~/server/enums";
import { RejectionNotice } from "./rejection-notice";
import { ReportStatusActions } from "./report-status-actions";

const createReportSchema = z.object({
  title: z.string(),

  vouchers: z.array(z.string()),
  report: z.string(),
  description: z.string(),
  image_url: z.string().url().nullable(),
  tags: z.array(z.string()),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  period: z
    .object({
      from: z.date({
        required_error: "A start date is required.",
      }),
      to: z.date({
        required_error: "A end date is required.",
      }),
    })
    .nullable(),
  status: z.nativeEnum(ReportStatus),
});
export function ReportForm(props: {
  report?: RouterOutputs["report"]["findById"];
}) {
  const router = useRouter();
  const report = props.report;
  const utils = trpc.useUtils();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const create = trpc.report.create.useMutation();
  const auth = useAuth();
  const updateReport = trpc.report.update.useMutation();
  const deleteReport = trpc.report.delete.useMutation();

  const isOwner = !report || auth?.session?.user?.id === report?.created_by;

  const form = useForm<z.infer<typeof createReportSchema>>({
    resolver: zodResolver(createReportSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: report ?? {
      tags: [] as string[],
      vouchers: [] as string[],
      report: '[{"type": "field-report-form","children": [{"text": ""}]}]',
      // Last Month
      period: {
        from: addMonths(new Date(), -1),
        to: new Date(),
      },
      status: ReportStatus.DRAFT,
    },
  });
  const { data: voucherList } = trpc.voucher.list.useQuery();
  const onSubmit = async (data: z.infer<typeof createReportSchema>) => {
    if (isRedirecting) return;

    try {
      if (report) {
        await updateReport.mutateAsync({
          id: report.id,
          ...data,
          location: data.location ? data.location : undefined,
        });

        setIsRedirecting(true);
        router.push(`/reports/${report?.id}`);
      } else {
        const r = await create.mutateAsync(data);
        setIsRedirecting(true);
        router.push(`/reports/${r?.id}`);
      }
    } catch (error) {
      setIsRedirecting(false);
      // Let React Hook Form handle the error
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
        {report?.status === ReportStatus.REJECTED &&
          report.rejection_reason && (
            <RejectionNotice reason={report.rejection_reason} />
          )}
        <InputField
          form={form}
          name="title"
          label="Title"
          placeholder="e.g. Repairing a mud wall with a stick interior"
        />
        <PlateField
          form={form}
          name="report"
          label=""
          description_name="description"
          image_name="image_url"
          placeholder="Describe your report"
        />
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

        <MapField form={form} name="location" label="Report Location" />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-3">
            {report ? (
              <Authorization
                resource="Reports"
                action="UPDATE"
                isOwner={isOwner}
              >
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isDirty || form.formState.isSubmitting
                  }
                  className="flex-1 min-w-[120px]"
                >
                  {form.formState.isSubmitting ? <Loading /> : "Save"}
                </Button>
              </Authorization>
            ) : (
              <Authorization
                resource="Reports"
                action="CREATE"
                isOwner={isOwner}
              >
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    isRedirecting ||
                    create.isPending
                  }
                  className="flex-1 min-w-[120px]"
                >
                  {form.formState.isSubmitting || create.isPending ? (
                    <Loading />
                  ) : (
                    "Create Report"
                  )}
                </Button>
              </Authorization>
            )}

            {report && (
              <ReportStatusActions
                report={report}
                isOwner={isOwner}
                isPending={updateReport.isPending || deleteReport.isPending}
                onDelete={async () => {
                  if (report.id) {
                    await deleteReport.mutateAsync({ id: report.id });
                    void utils.report.list.invalidate();
                  }
                  router.push("/reports");
                }}
              />
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

// Owner can Save Draft
// Owner can Publish

// Staff, Admin And SuperAdmin can Approve
//  Staff, Admin And SuperAdmin can Reject

// Admin, Owner And SuperAdmin can Delete
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
