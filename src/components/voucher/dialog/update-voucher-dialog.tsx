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
import { type RouterOutput } from "~/server/api/root";
import UpdateVoucherForm from "../forms/update-voucher-form";

interface UpdateFormProps {
  voucher: Exclude<RouterOutput["voucher"]["byAddress"], undefined>;
}
const UpdateVoucherDialog = ({ voucher }: UpdateFormProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Pencil2Icon className="mr-2"/>
          Edit Voucher
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
