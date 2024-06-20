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

export interface PopoverProps {
  open: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  button: React.ReactNode | undefined;
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  children: React.ReactNode | undefined;
}
export const Modal = (props: PopoverProps) => {
  return (
    <Dialog modal open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>{props.button}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};
export const BottomDrawer = (props: PopoverProps) => {
  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerTrigger asChild>{props.button}</DrawerTrigger>
      <DrawerContent className="p-2">
        <DrawerHeader className="text-left">
          <DrawerTitle>{props.title}</DrawerTitle>
          <DrawerDescription>{props.description}</DrawerDescription>
        </DrawerHeader>
        {props.children}
      </DrawerContent>
    </Drawer>
  );
};

export const ResponsiveModal = (props: PopoverProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (isDesktop) {
    return <Modal {...props} />;
  } else {
    return <BottomDrawer {...props} />;
  }
};
