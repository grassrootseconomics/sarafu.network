import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { useAccount, useBalance } from "wagmi";
import { useIsMounted } from "~/hooks/useIsMounted";
import { SarafuIcon } from "../Icons/SarafuIcon";
import { SendModal } from "../Layout/Modals/SendModal";
import { NextLinkComposed } from "../Link";

export const VoucherListItem = ({
  voucher,
  sx,
}: {
  voucher: {
    id: number | undefined;
    voucher_address: string | undefined;
    symbol: string | undefined;
    voucher_name: string | undefined;
    voucher_description: string | undefined;
    supply: number | undefined;
  };
  sx?: SxProps<Theme>;
}) => {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const isMounted = useIsMounted();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: voucher.voucher_address as `0x${string}`,
    address: address as `0x${string}`,
  });

  return (
    <ListItem
      sx={sx}
      key={voucher.voucher_address}
      secondaryAction={
        <Box display={"flex"} alignItems={"center"}>
          {/* <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            Send
          </Button> */}
          {isMounted && <ListItemText primary={balance?.formatted} />}
        </Box>
      }
    >
      <ListItemButton
        component={NextLinkComposed}
        to={`/vouchers/[address]`}
        linkAs={`/vouchers/${voucher?.voucher_address || ""}`}
      >
        <SarafuIcon
          sx={{ width: "30px", height: "30px", borderRadius: "100%" }}
        />
        <SendModal
          open={open}
          onClose={() => setOpen(false)}
          voucher={voucher}
        />
        <ListItemText
          primary={voucher.voucher_name}
          secondary={voucher.voucher_description}
          about={voucher.voucher_address}
        />
      </ListItemButton>
    </ListItem>
  );
};
