import { useState } from "react";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { BottomDrawer } from "./bottom-drawer";
import { Modal } from "./modal";

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
