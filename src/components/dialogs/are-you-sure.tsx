import { DialogClose } from "@radix-ui/react-dialog";
import { Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const AreYouSureDialog = ({
  title,
  description,
  onClose,
  disabled,
  onYes,
  button,
}: {
  title: string;
  description: string;
  disabled?: boolean;
  button?: React.ReactNode;
  onClose?: () => void;
  onYes: () => void;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {button ?? (
          <Button variant="ghost" className="text-red-500">
            <Trash2Icon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onClose}>No</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              disabled={disabled}
              onClick={() => {
                onClose?.();
                onYes();
              }}
            >
              Yes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AreYouSureDialog;
