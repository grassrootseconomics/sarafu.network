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
