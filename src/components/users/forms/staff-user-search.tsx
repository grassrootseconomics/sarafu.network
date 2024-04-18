// External imports

// Internal imports

// Components
import { QrCodeIcon } from "lucide-react";
import React from "react";
import ScanAddressDialog from "~/components/dialogs/scan-address-dialog";
import { Button } from "~/components/ui/button";
import { StaffProfileDialog } from "../dialogs/staff-profile-dialog";

export const StaffUserSearch = () => {
  const [address, setAddress] = React.useState<`0x${string}`>();
  if (address)
    return (
      <StaffProfileDialog
        address={address}
        isOpen={Boolean(address)}
        setIsOpen={() => setAddress(undefined)}
      />
    );
  return (
    <ScanAddressDialog
      button={
        <Button variant={"secondary"} className="flex-col h-20 w-fit">
          <QrCodeIcon className="mb-2" />
          Scan Address
        </Button>
      }
      onAddress={(a) => {
        setAddress(a);
      }}
    />
  );
};
