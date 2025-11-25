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
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { Authorization, useAuth } from "~/hooks/useAuth";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { ReportStatusEnum } from "~/server/enums";
import { RejectionNotice } from "../rejection-notice";

import { useEffect } from "react";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { useLocalStorage } from "~/hooks/useLocalStorage";

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
  // Status is handled internally
});

export function ReportForm(props: {
  report?: RouterOutputs["report"]["findById"];
}) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const utils = trpc.useUtils();
  const create = trpc.report.create.useMutation();
  const auth = useAuth();
  const updateReport = trpc.report.update.useMutation();
  const deleteReport = trpc.report.delete.useMutation();
  const updateStatus = trpc.report.updateStatus.useMutation();

  const reportQuery = trpc.report.findById.useQuery(
    { id: props.report?.id ?? 0 },
    {
      initialData: props.report ?? undefined,
      enabled: !!props.report?.id,
    }
  );
  const report = reportQuery.data;

  const isOwner = !report || auth?.session?.user?.id === report?.created_by;
  const isLoading =
    create.isPending ||
    updateReport.isPending ||
    deleteReport.isPending ||
    reportQuery.isLoading ||
    updateStatus.isPending ||
    isRedirecting;

  // Local storage for drafts (only for new reports)
  const [draft, setDraft] = useLocalStorage<z.infer<
    typeof createReportSchema
  > | null>("report-form-draft", null);
  const isRejected = report?.status === ReportStatusEnum.REJECTED;
  const defaultValues = report ??
    draft ?? {
      tags: [] as string[],
      vouchers: [] as string[],
      report: '[{"type": "field-report-form","children": [{"text": ""}]}]',
      // Last Month
      period: {
        from: addMonths(new Date(), -1),
        to: new Date(),
      },
      title: "",
      description: "",
      image_url: null,
      location: null,
    };

  const form = useForm<z.infer<typeof createReportSchema>>({
    resolver: zodResolver(createReportSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: defaultValues,
  });

  // Watch form changes and save to local storage if it's a new report
  useEffect(() => {
    if (report) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const subscription = form.watch((value) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (!form.formState.isDirty) return;
        setDraft(value as z.infer<typeof createReportSchema>);
      }, 400);
    });

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [form, report, setDraft]);

  const { data: voucherList } = trpc.voucher.list.useQuery({});

  const onSubmit = async (data: z.infer<typeof createReportSchema>) => {
    if (isRedirecting) return;

    try {
      if (report) {
        await updateReport.mutateAsync({
          id: report.id,
          ...data,
          location: data.location ? data.location : undefined,
        });
        if (isRejected) {
          // If resubmitting a rejected report, update status to SUBMITTED
          await updateStatus.mutateAsync({
            id: report.id,
            status: ReportStatusEnum.SUBMITTED,
          });
        }
        setIsRedirecting(true);
        router.push(`/reports/${report?.id}`);
      } else {
        const r = await create.mutateAsync(data);

        // Auto-publish (Submit)
        await updateStatus.mutateAsync({
          id: r.id,
          status: ReportStatusEnum.SUBMITTED,
        });

        // Clearing draft
        setDraft(null);

        setIsRedirecting(true);
        router.push(`/reports/${r?.id}`);
      }
    } catch (error) {
      setIsRedirecting(false);
      // Let React Hook Form handle the error
      throw error;
    }
  };

  const handleDelete = async () => {
    if (report?.id) {
      await deleteReport.mutateAsync({ id: report.id });
      void utils.report.list.invalidate();
      router.push("/reports");
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isRejected && report.rejection_reason && (
          <RejectionNotice reason={report.rejection_reason} />
        )}

        {/* Basic Information Section */}
        <div className="space-y-6">
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
        </div>

        {/* Metadata Section */}
        <div className="space-y-6 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Details
          </h2>
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
            renderSelectedItem={(item) => (
              <VoucherChip voucher_address={item.address} />
            )}
            renderItem={(item) => (
              <VoucherChip voucher_address={item.address} />
            )}
            searchableValue={(v) => `${v.symbol} ${v.name} `}
            getFormValue={(v) => v.address}
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
        </div>

        {/* Action Buttons */}
        {report ? (
          <div className="flex flex-row items-center  justify-between gap-3 pt-8 border-t">
            <Authorization resource="Reports" action="DELETE" isOwner={isOwner}>
              <AreYouSureDialog
                title="Delete Report"
                description="Are you sure you want to delete this report?"
                onYes={handleDelete}
              />
            </Authorization>
            <Authorization resource="Reports" action="UPDATE" isOwner={isOwner}>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <Loading />
                ) : isRejected ? (
                  "Resubmit Report"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Authorization>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 border-t">
            <Button
              type="button"
              className="w-full sm:w-auto"
              variant="ghost"
              size="lg"
              onClick={() => {
                setDraft(null);
                router.back();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Authorization resource="Reports" action="CREATE" isOwner={isOwner}>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? <Loading /> : "Publish Report"}
              </Button>
            </Authorization>
          </div>
        )}
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
