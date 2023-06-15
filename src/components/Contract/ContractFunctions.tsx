/* eslint-disable @typescript-eslint/ban-ts-comment */
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Container,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { stringify } from "viem";
import { useContractRead, useContractWrite } from "wagmi";
import { DMRAbiType } from "../../contracts/erc20-demurrage-token/contract";
import { convertToAbiType } from "../../lib/web3";
import { Transaction } from "../TransactionReceipt";

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
export function ContractFunctions({ contract }: { contract: ContractType }) {
  const [searchTerm, setSearchTerm] = useState("");
  const functions = contract.abi.filter(
    (item) => item.type === "function"
  ) as ContractFunctions[];

  functions.sort((a, b) => a.name.localeCompare(b.name));
  const funcs = functions.reduce(
    (acc, item) => {
      if (item.stateMutability === "view" || item.stateMutability === "pure") {
        acc.read.push(item);
      } else {
        acc.write.push(item);
      }
      return acc;
    },
    { read: [], write: [] } as {
      read: ContractReadFunctions[];
      write: ContractWriteFunctions[];
    }
  );
  const [filteredFuncs, setFilteredFuncs] = useState(funcs);

  const handleSearch = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setSearchTerm(target.value);
    const filtered = {
      read: funcs.read.filter((func) =>
        func.name.toLowerCase().includes(target.value.toLowerCase())
      ),
      write: funcs.write.filter((func) =>
        func.name.toLowerCase().includes(target.value.toLowerCase())
      ),
    };
    setFilteredFuncs(filtered);
  };
  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="column"
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
    >
      <Container>
        <TextField
          id="search"
          type="search"
          label="Search Contract Function"
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          fullWidth
          sx={{ width: 600, m: "auto", display: "block" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Container>
      {filteredFuncs.write.map((item, idx) => {
        return (
          <WriteContractFunction
            key={`write-contract-function-${idx}`}
            contract={contract}
            func={item}
          />
        );
      })}
      {filteredFuncs.read.map((item, idx) => {
        return (
          <ReadContractFunction
            key={`read-contract-function-${idx}`}
            contract={contract}
            func={item}
          />
        );
      })}
    </Stack>
  );
}
export function ReadContractFunction({
  contract,
  func,
}: {
  contract: ContractType;
  func: Extract<
    ContractType["abi"][number],
    { type: "function"; stateMutability: "pure" | "view" }
  >;
}) {
  const { name, inputs } = func;
  const [args, setArgs] = useState(Array(inputs.length).fill(undefined));

  const { data, error, isError, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: func.name,
    enabled: false,
    //@ts-ignore
    args: args.length > 0 ? args : undefined,
  });
  const disabled = args.some((item) => item === undefined);
  return (
    <Container>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <Box sx={{ backgroundColor: "lightblue", p: 1, borderRadius: 2 }}>
          <Typography variant="body1">{`${name}`}</Typography>
        </Box>
        {inputs.map((input, idx) => (
          <TextField
            key={input.name}
            label={input.name}
            size="small"
            placeholder={input.type}
            onChange={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const newArgs = [...args];
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              newArgs[idx] = convertToAbiType(e.target.value, input.type);
              setArgs(newArgs);
            }}
          />
        ))}
        {/*  eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <IconButton disabled={isLoading || disabled} onClick={() => refetch()}>
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
      {isLoading && <Skeleton variant="text" sx={{ fontSize: "1rem" }} />}
      <Typography variant="body1" sx={{ fontSize: "1rem" }}>
        {stringify(data)}
      </Typography>
      <ErrorDisplay isError={isError} error={error} />
    </Container>
  );
}
export function WriteContractFunction({
  contract,
  func,
}: {
  contract: ContractType;
  func: Extract<
    ContractType["abi"][number],
    { type: "function"; stateMutability: "nonpayable" }
  >;
}) {
  const { name, inputs } = func;

  const [args, setArgs] = useState(Array(inputs.length).fill(undefined));

  const { data, error, isError, isLoading, write } = useContractWrite({
    ...contract,
    functionName: func.name,
  });
  const disabled = args.some((item) => item === undefined);

  return (
    <Container>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <Box sx={{ backgroundColor: "orange", p: 1, borderRadius: 2 }}>
          <Typography variant="body1">{`${name}`}</Typography>
        </Box>
        {inputs.map((input, idx) => (
          <TextField
            key={input.name}
            label={input.name}
            size="small"
            placeholder={input.type}
            onChange={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const newArgs = [...args];
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              newArgs[idx] = convertToAbiType(e.target.value, input.type);
              setArgs(newArgs);
            }}
          />
        ))}
        <IconButton
          disabled={isLoading || disabled}
          onClick={() =>
            write({
              args: args.length > 0 ? args : undefined,
            })
          }
        >
          {<ArrowForwardIcon />}
        </IconButton>
      </Stack>
      <Box>
        {isLoading && <Skeleton variant="text" sx={{ fontSize: "1rem" }} />}
        {data && <Transaction hash={data.hash} />}
        <ErrorDisplay isError={isError} error={error} />
      </Box>
    </Container>
  );
}

function ErrorDisplay({
  isError,
  error,
}: {
  isError: boolean;
  error: Error | null;
}) {
  if (!isError) return null;
  return (
    <Typography variant="body1" style={{ color: "red" }}>
      {error?.message}
    </Typography>
  );
}
