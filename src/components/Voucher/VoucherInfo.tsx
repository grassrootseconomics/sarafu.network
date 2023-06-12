import { Box, Card, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { formatUnits } from "viem";
import { useAccount, useBalance, useToken } from "wagmi";
import { DMRAbiType } from "../../contracts/erc20-demurrage-token/contract";
import { vouchers } from "../../gqty";
import { explorerUrl } from "../../utils/celo";

//0x5b39291da35612546c2b0a809ef7a9d4e134db0a
export type ContractType = {
  address: `0x${string}`;
  abi: DMRAbiType;
};

export type ContractFunctions = Extract<
  ContractType["abi"][number],
  { type: "function" }
>;

export type ContractWriteFunctions = Extract<
  ContractFunctions,
  { stateMutability: "nonpayable" }
>;

export type ContractReadFunctions = Extract<
  ContractFunctions,
  { stateMutability: "pure" | "view" }
>;
export function VoucherInfo({
  contract,
  voucher,
}: {
  contract: ContractType;
  voucher: vouchers;
}) {
  const { address } = useAccount();

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
    <Card sx={{ p: 2, m: 2, width: "100%" }}>
      <Grid container spacing={2}>
        <Row label="Name" value={voucher.voucher_name ?? ""} />
        <Row label="Description" value={voucher.voucher_description ?? ""} />
        <Row label="Location" value={voucher.location_name ?? ""} />
        <Row label="Contract Address" value={voucher.voucher_address ?? ""} />
        <Row label="Sink Address" value={voucher.sink_address ?? ""} />
        <Row
          label="Your Balance"
          value={`${parseValue(balance?.value)} ${token?.symbol}`}
        />
        <Row
          label="Demurrage Rate"
          value={`${parseFloat(voucher?.demurrage_rate) * 100}%`}
        />
        <Row
          label="Total Supply"
          value={`${parseValue(token?.totalSupply.value)} ${token?.symbol}`}
        />
      </Grid>

      <Box sx={{ mt: 1, textAlign: "center" }}>
        <a target="_blank" href={explorerUrl().token(contract.address)}>
          View on Explorer
        </a>
      </Box>
    </Card>
  );
}
