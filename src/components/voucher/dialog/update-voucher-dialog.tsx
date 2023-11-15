import { Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { type Point } from "~/server/db/db";
import UpdateVoucherForm from "../forms/update-voucher-form";

interface UpdateFormProps {
  voucher: {
    voucher_name?: string | undefined;
    voucher_description?: string | undefined;
    location_name?: string | null | undefined;
    voucher_address?: string | undefined;
    geo: Point | null;
    sink_address?: string | undefined;
    demurrage_rate?: string | undefined;
  };
}
const UpdateVoucherDialog = ({ voucher }: UpdateFormProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil2Icon />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Edit Voucher</DialogTitle>
          <DialogDescription>
            {"Make changes to the voucher here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <UpdateVoucherForm voucher={voucher} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateVoucherDialog;
