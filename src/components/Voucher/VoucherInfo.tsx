import { Box, Card, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { formatUnits } from "viem";
import { useAccount, useBalance, useToken } from "wagmi";
import { useIsMounted } from "~/hooks/useIsMounted";
import { explorerUrl } from "../../utils/celo";
import { type ContractType } from "../Contract/ContractFunctions";

export function VoucherInfo({
  contract,
  voucher,
}: {
  contract: ContractType;
  voucher: {
    voucher_name?: string;
    voucher_description?: string;
    location_name?: string | null;
    voucher_address?: string;
    sink_address?: string;
    demurrage_rate?: string;
  };
}) {
  const { address } = useAccount();
  const isMounted = useIsMounted();
  const { data: token } = useToken({
    address: contract.address,
  });
  const { data: balance } = useBalance({
    address,
    token: contract.address,
  });
  const parseValue = (value?: bigint) =>
    value ? formatUnits(value, token?.decimals || 6) : 0;
  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <>
      <Grid xs={12} sm={4}>
        <Typography variant="body2">
          <strong>{label}</strong>
        </Typography>
      </Grid>
      <Grid xs={12} sm={8}>
        <Typography variant="body2">{value}</Typography>
      </Grid>
    </>
  );
  return (
    <Box>
      <Typography mb={2} textAlign={"center"} variant="h5">
        Information
      </Typography>
      <Card sx={{ p: 2, m: 2 }}>
        <Grid container spacing={2}>
          <Row label="Name" value={voucher.voucher_name ?? ""} />
          <Row label="Description" value={voucher.voucher_description ?? ""} />
          <Row label="Location" value={voucher.location_name ?? ""} />
          <Row label="Contract Address" value={voucher.voucher_address ?? ""} />
          <Row label="Sink Address" value={voucher.sink_address ?? ""} />
          <Row
            label="Your Balance"
            value={
              isMounted
                ? `${parseValue(balance?.value)} ${token?.symbol ?? ""}`
                : ""
            }
          />
          <Row
            label="Demurrage Rate"
            value={`${
              voucher?.demurrage_rate
                ? parseFloat(voucher?.demurrage_rate) * 100
                : "?"
            }%`}
          />
          <Row
            label="Total Supply"
            value={
              isMounted
                ? `${parseValue(token?.totalSupply.value)} ${
                    token?.symbol ?? ""
                  }`
                : ""
            }
          />
        </Grid>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <a target="_blank" href={explorerUrl().token(contract.address)}>
            View on Explorer
          </a>
        </Box>
      </Card>
    </Box>
  );
}
