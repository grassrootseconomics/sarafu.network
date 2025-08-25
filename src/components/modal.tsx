import { useState } from "react";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";

type PopoverProps = ControlledPopoverProps | UnControlledPopoverProps;

interface ControlledPopoverProps {
  open: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  button?: React.ReactNode | undefined;
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  children: React.ReactNode | undefined;
}
interface UnControlledPopoverProps {
  open?: undefined;
  onOpenChange?: undefined;
  button?: React.ReactNode | undefined;
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  children: React.ReactNode | undefined;
}
export const Modal = (props: PopoverProps) => {
  return (
    <Dialog modal open={props?.open} onOpenChange={props?.onOpenChange}>
      {props.button && <DialogTrigger asChild>{props.button}</DialogTrigger>}
      <DialogContent className="max-w-xl">
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
export const BottomDrawer = (props: PopoverProps) => {
  return (
    <Drawer
      open={props.open}
      onOpenChange={props.onOpenChange}
      dismissible={true}
    >
      {props.button && <DrawerTrigger asChild>{props.button}</DrawerTrigger>}
      <DrawerContent className="p-2">
        {(props.title || props.description) && (
          <DrawerHeader className="text-left">
            {props.title && <DrawerTitle>{props.title}</DrawerTitle>}
            {props.description && (
              <DrawerDescription>{props.description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <ScrollArea className="overflow-y-auto max-h-[85svh]">
          {props.children}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
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
