import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { isAddress } from "viem";

interface ContractAddressInputProps {
  value: string;
  onChange: (value: `0x${string}`) => void;
}
const ContractAddressInput = (props: ContractAddressInputProps) => {
  const [contractAddress, setContractAddress] = useState(props.value);
  const handleGoClick = () => {
    if (isAddress(contractAddress)) {
      props.onChange(contractAddress);
    }
  };

  return (
    <Stack direction={"row"} sx={{ alignItems: "center" }}>
      <TextField
        size="small"
        label="Contract Address"
        sx={{ flexGrow: 1 }}
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoClick}
        disabled={!isAddress(contractAddress)}
        sx={{ ml: 2 }}
      >
        Go
      </Button>
    </Stack>
  );
};

export default ContractAddressInput;
