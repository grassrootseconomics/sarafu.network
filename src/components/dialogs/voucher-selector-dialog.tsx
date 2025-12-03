"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilter } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { ResponsiveModal } from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { trpc } from "~/lib/trpc";
import { VoucherChip } from "../voucher/voucher-chip";

const formSchema = z.object({
  default_voucher: z.string().min(1, "Please select a voucher"),
});

type FormValues = z.infer<typeof formSchema>;

interface VoucherSelectorDialogProps {
  currentVoucher?: string;
  button: React.ReactNode;
  onVoucherChange?: (voucherAddress: string) => void;
}

/**
 * Dialog for selecting a primary voucher
 * Uses ResponsiveModal (drawer on mobile, dialog on desktop)
 * Reuses SelectVoucherField component for consistency
 */
export function VoucherSelectorDialog({
  currentVoucher,
  button,
  onVoucherChange,
}: VoucherSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const utils = trpc.useUtils();

  // Fetch user's vouchers
  const { data: myVouchers, isLoading: isLoadingMyVouchers } = trpc.me.vouchers.useQuery(undefined, {
    enabled: open,
  });

  // Fetch all vouchers in the system
  const { data: allVouchersData, isLoading: isLoadingAllVouchers } = trpc.voucher.list.useQuery(
    { sortBy: "name", sortDirection: "asc" },
    { enabled: open && showAllVouchers }
  );

  // Determine which vouchers to display
  const vouchers = showAllVouchers ? allVouchersData : myVouchers;
  const isLoading = showAllVouchers ? isLoadingAllVouchers : isLoadingMyVouchers;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      default_voucher: currentVoucher || "",
    },
  });

  // Update form when currentVoucher changes
  useEffect(() => {
    if (currentVoucher) {
      form.reset({ default_voucher: currentVoucher });
    }
  }, [currentVoucher, form]);

  // Mutation to update primary voucher
  const updateMutation = trpc.me.updatePrimary.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      void utils.me.get.invalidate();
      toast.success("Primary voucher updated successfully!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update voucher: ${error.message}`);
    },
  });

  const onSubmit = (data: FormValues) => {
    if (data.default_voucher === currentVoucher) {
      setOpen(false);
      return;
    }

    updateMutation.mutate({
      default_voucher: data.default_voucher,
    });

    // Call callback if provided
    if (onVoucherChange) {
      onVoucherChange(data.default_voucher);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title="Select Primary Voucher"
      description="Choose which voucher to use as your primary voucher. This will be displayed on your wallet home and used as the default for transactions."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading vouchers...
            </div>
          ) : vouchers && vouchers.length > 0 ? (
            <>
              {/* Toggle for showing all vouchers */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <ListFilter className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">
                    {showAllVouchers ? "All Vouchers" : "My Vouchers"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant={showAllVouchers ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllVouchers(!showAllVouchers)}
                  className="rounded-full"
                  aria-label={showAllVouchers ? "Show only my vouchers" : "Show all vouchers in the system"}
                  aria-pressed={showAllVouchers}
                >
                  {showAllVouchers ? "Show My Vouchers" : "Show All Vouchers"}
                </Button>
              </div>

              <SelectVoucherField
                form={form}
                name="default_voucher"
                label="Primary Voucher"
                placeholder="Select a voucher"
                items={vouchers}
                getFormValue={(v) => v.voucher_address as `0x${string}`}
                searchableValue={(v) => `${v.symbol} ${v.voucher_name}`}
                renderItem={(v) => (
                  <VoucherChip voucher_address={v.voucher_address as `0x${string}`} />
                )}
                renderSelectedItem={(v) => (
                  <VoucherChip voucher_address={v.voucher_address as `0x${string}`} />
                )}
                description={
                  showAllVouchers
                    ? `Showing all ${vouchers.length} vouchers in the system`
                    : vouchers.length > 1
                    ? `Showing ${vouchers.length} vouchers you hold`
                    : "This is your only voucher"
                }
              />

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending
                    ? "Updating..."
                    : "Update Primary Voucher"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <p className="font-medium">No vouchers available</p>
              <p className="text-sm">
                Receive your first voucher to get started
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </Form>
    </ResponsiveModal>
  );
}
