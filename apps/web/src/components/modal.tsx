import { useState } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { BottomDrawer } from "./bottom-drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

type PopoverProps = ControlledPopoverProps | UnControlledPopoverProps;

interface ControlledPopoverProps {
  open: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  button?: React.ReactNode | undefined;
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  children: React.ReactNode | undefined;
  preventDismiss?: boolean;
}
interface UnControlledPopoverProps {
  open?: undefined;
  onOpenChange?: undefined;
  button?: React.ReactNode | undefined;
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  children: React.ReactNode | undefined;
  preventDismiss?: boolean;
}
export const Modal = (props: PopoverProps) => {
  return (
    <Dialog modal open={props?.open} onOpenChange={props?.onOpenChange}>
      {props.button && <DialogTrigger asChild>{props.button}</DialogTrigger>}
      <DialogContent
        className="max-w-xl"
        {...(props.preventDismiss && {
          onInteractOutside: (e: Event) => e.preventDefault(),
          onPointerDownOutside: (e: Event) => e.preventDefault(),
          onEscapeKeyDown: (e: KeyboardEvent) => e.preventDefault(),
        })}
      >
        <DialogHeader>
          {props.title && <DialogTitle>{props.title}</DialogTitle>}
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="overflow-y-auto max-h-[85vh]">
          {props.children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
export const ResponsiveModal = (props: PopoverProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(open);
    } else {
      setIsOpen(open);
    }
  };

  const open = props.open !== undefined ? props.open : isOpen;

  if (isDesktop) {
    return <Modal {...props} open={open} onOpenChange={handleOpenChange} />;
  } else {
    return (
      <BottomDrawer {...props} open={open} onOpenChange={handleOpenChange} />
    );
  }
};
