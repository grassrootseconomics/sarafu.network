import { DialogClose } from "@radix-ui/react-dialog";
import { Button, buttonVariants } from "../ui/button";
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
  onClose,
  onYes,
}: {
  onClose?: () => void;
  onYes: () => void;
}) => {
  return (
    <Dialog>
      <DialogTrigger
        className={buttonVariants({
          variant: "destructive",
        })}
      >
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button onClick={onClose}>No</Button>
          </DialogClose>
          <DialogClose>
            <Button
              variant="destructive"
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
