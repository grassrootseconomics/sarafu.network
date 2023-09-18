import React from "react";
import { cn } from "~/lib/utils";
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
import LocationMap from "./location-map";

interface LocationMapButtonProps {
  value?: {
    lat: number;
    lng: number;
  };
  onSelected: (location?: { lat: number; lng: number }) => void;
}

const LocationMapButton: React.FC<LocationMapButtonProps> = ({
  value,
  onSelected,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="m-auto">
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          Map
        </DialogTrigger>
        <DialogContent className="w-full max-w-none h-full">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              {"Select a location for your voucher"}
            </DialogDescription>
          </DialogHeader>
          <div className="row-span-6 flex-col flex-grow h-full w-full">
            <LocationMap value={value} onChange={onSelected} />
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationMapButton;
