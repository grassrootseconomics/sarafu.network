import { X } from "lucide-react";
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
export const BottomDrawer = (props: PopoverProps) => {
  return (
    <Drawer
      open={props.open}
      onOpenChange={props.onOpenChange}
      dismissible={!props.preventDismiss}
    >
      {props.button && <DrawerTrigger asChild>{props.button}</DrawerTrigger>}
      <DrawerContent className="p-2">
        {props.preventDismiss && (
          <button
            type="button"
            onClick={() => props.onOpenChange?.(false)}
            className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
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
