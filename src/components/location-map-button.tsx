import { type LatLng } from "leaflet";
import React from "react";
import LocationMap from "./location-map";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface LocationMapButtonProps {
  value?: LatLng;
  onSelected: (location?: LatLng) => void;
}

const LocationMapButton: React.FC<LocationMapButtonProps> = ({
  value,
  onSelected,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClose = (latLong?: LatLng) => {
    setOpen(false);
    onSelected(latLong);
  };

  return (
    <div className="m-auto">
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogTrigger>Open Map</DialogTrigger>
        <DialogContent className="w-full max-w-none h-full">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              {"Select a location for your voucher"}
            </DialogDescription>
          </DialogHeader>
          <div className="row-span-6 h-full w-full">
            <LocationMap value={value} onLocationSelected={handleClose} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationMapButton;
