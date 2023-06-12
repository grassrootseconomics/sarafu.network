import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import { useAccount, useBalance } from "wagmi";

export const VoucherListItem = ({
  voucher,
}: {
  voucher: {
    id: number | undefined;
    voucher_address: string | undefined;
    voucher_name: string | undefined;
    voucher_description: string | undefined;
    supply: number | undefined;
  };
}) => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: voucher.voucher_address as `0x${string}`,
    address: address as `0x${string}`,
  });
  return (
    <ListItem
      onClick={() => router.push(`/vouchers/${voucher.voucher_address}`)}
      key={voucher.voucher_address}
      secondaryAction={<ListItemText primary={balance?.formatted} />}
    >
      <ListItemButton>
        <ListItemText
          primary={voucher.voucher_name}
          secondary={voucher.voucher_description}
          about={voucher.voucher_address}
        />
      </ListItemButton>
    </ListItem>
  );
};
