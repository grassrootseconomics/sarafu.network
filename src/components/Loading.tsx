import { Box, CircularProgress, Typography } from "@mui/material";
import * as React from "react";

type LoadingProps = {
  status?: string;
};

export const Loading: React.FC<LoadingProps> = ({ status }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
      {status && <Typography mt={2}>{status}</Typography>}
    </Box>
  );
};

