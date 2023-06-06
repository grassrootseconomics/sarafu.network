import { Button, Card, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { formatUnits } from "viem";
import { useBalance, useToken } from "wagmi";
import { DMRAbiType } from "../../contracts/erc20-demurrage-token/contract";
import { useQuery, vouchers } from "../../gqty";
import { ContractFunctions } from "./ContractFunctions";

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
export function Contract({
  contract,
  voucher,
}: {
  contract: ContractType;
  voucher: vouchers;
}) {
  const [showFunctions, setShowFunctions] = useState(false);
  const query = useQuery();
  const { data: token } = useToken({
    address: contract.address,
  });
  const { data: balance } = useBalance({
    address: contract.address,
    token: contract.address,
  });
  const parseValue = (value?: bigint) =>
    value ? formatUnits(value, token?.decimals || 6) : 0;

  return (
    <>
      <Card sx={{ p: 2, m: 2, width: "100%" }}>
        <Stack
          direction="column"
          alignContent={"center"}
          justifyContent={"center"}
        >
          <Typography variant="body2">
            <strong>Name:</strong> {token?.name}
          </Typography>
          <Typography variant="body2">
            <strong>Symbol:</strong> {token?.symbol}
          </Typography>
          <Typography variant="body2">
            <strong>Your Balance:</strong> {parseValue(balance?.value)}
          </Typography>
          <Typography variant="body2">
            <strong>Supply:</strong> {parseValue(token?.totalSupply.value)}
          </Typography>

          <Typography variant="body2">
            <strong>Contract Address:</strong> {contract.address}
          </Typography>
          <Typography variant="body2">
            <strong>Description:</strong> {voucher.voucher_description}
          </Typography>
          <Button onClick={() => setShowFunctions(!showFunctions)}>
            {showFunctions ? "Hide" : "Show"} Functions
          </Button>
        </Stack>
      </Card>
      {showFunctions && (
        <Card
          sx={{
            backgroundColor: "white",
            overflow: "auto",
            m: "auto",
            width: "100%",
            p: 2,
          }}
        >
          <ContractFunctions contract={contract} />
        </Card>
      )}
    </>
  );
}
