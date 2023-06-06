import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
} from "@mui/material";
import type { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useAccount, useBalance } from "wagmi";
import { resolve, vouchers } from "../../src/gqty";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
`;
const selectVoucher = (voucher: vouchers) => ({
  id: voucher.id,
  voucher_address: voucher.voucher_address,
  voucher_name: voucher.voucher_name,
  voucher_description: voucher.voucher_description,
  supply: voucher.supply,
});
export const getServerSideProps = async () => {
  const data = await resolve(({ query: { vouchers } }) => ({
    vouchers: vouchers().map(selectVoucher),
  }));
  return { props: { vouchers: data.vouchers } };
};

const VouchersPage = ({
  vouchers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Box>
      <List>
        {vouchers.map((voucher, idx) => (
          <VoucherListItem key={idx} voucher={voucher} />
        ))}
      </List>
    </Box>
  );
};

const VoucherListItem = ({
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

export default VouchersPage;
