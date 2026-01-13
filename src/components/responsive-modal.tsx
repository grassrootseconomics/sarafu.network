import { useState } from "react";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { useMounted } from "~/hooks/use-mounted";
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
  const mounted = useMounted();
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

  // Always render Modal during SSR/hydration for consistency
  // Switch to responsive behavior only after mount
  if (!mounted || isDesktop) {
    return <Modal {...props} open={open} onOpenChange={handleOpenChange} />;
  } else {
    return (
      <BottomDrawer {...props} open={open} onOpenChange={handleOpenChange} />
    );
  }
};
