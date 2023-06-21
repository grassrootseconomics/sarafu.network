import { QrCode } from "@mui/icons-material";
import {
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useBalance } from "wagmi";

export const SendModal = ({
  open,
  onClose,
  voucher,
}: {
  open: boolean;
  onClose: () => void;
  voucher: {
    voucher_name?: string;
    voucher_address?: string;
    symbol?: string;
  };
}) => {
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [amountToSend, setAmountToSend] = React.useState("");
  const balance = useBalance({
    address: voucher.voucher_address as `0x${string}`,
  });
  const handleRecipientAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipientAddress(event.target.value);
  };
  const handleAmountToSendChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAmountToSend(event.target.value);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ p: 1, m: 1, maxWidth: "500px", flexGrow: 1 }}>
        <Typography textAlign={"center"} variant="h6">
          Send {voucher.voucher_name} Voucher
        </Typography>
        <Stack spacing={1}>
          <TextField
            id="recipient-address-input"
            label="Recipient Address"
            type="text"
            fullWidth
            value={recipientAddress}
            onChange={handleRecipientAddressChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="scan qr code" edge="end">
                    <QrCode />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="amount-input"
            label="Amount"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Chip label={voucher.symbol} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  Max ({balance.data?.formatted})
                </InputAdornment>
              ),
            }}
            value={amountToSend}
            onChange={handleAmountToSendChange}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button variant="contained">Send</Button>
        </Stack>
      </Card>
    </Modal>
  );
};
