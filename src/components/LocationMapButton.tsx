import { Box, Button, Modal } from "@mui/material";
import React, { useState } from "react";
import LocationMap from "./LocationMap";

interface LocationMapButtonProps {
  value?: string;
  onSelected: (location: string) => void;
}

const LocationMapButton: React.FC<LocationMapButtonProps> = ({
  value,
  onSelected,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (latLong: string) => {
    onSelected(latLong);
    setOpen(false);
  };
  const location = value
    ? (value.split(",").map((v) => parseFloat(v)) as [number, number])
    : undefined;
  return (
    <Box sx={{ width: "150px", m: "auto", pl: 1, pt: 1 }}>
      <Button
        size="small"
        variant="contained"
        fullWidth={true}
        color="primary"
        onClick={handleOpen}
      >
        Open Map {location}
      </Button>
      <Modal open={open} onClose={() => handleClose("")}>
        <Box sx={{ width: "100%", height: "100%", overflow: "auto" }}>
          <LocationMap value={location} onLocationSelected={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default LocationMapButton;
