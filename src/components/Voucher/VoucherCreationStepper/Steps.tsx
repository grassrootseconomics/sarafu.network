import {
  Box,
  FormControl,
  Input,
  InputLabel,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useVoucherCreation } from "./Context";

export function StepContent(props: { stepIndex: number }) {
  switch (props.stepIndex) {
    case 0:
      return <Step0 />;
    case 1:
      return <Step1 />;
    case 2:
      return <Step2 />;
    case 3:
      return <Step3 />;
    case 4:
      return <Step4 />;
    case 5:
      return <Step5 />;
    case 6:
      return <Step6 />;
    default:
      return <div>Unknown stepIndex</div>;
  }
}

export function Step0() {
  return (
    <Box>
      <Typography variant="h5">Introduction</Typography>
      <Typography>
        Community Inclusion Currencies (CICs) are a form of voucher...
        {/* add the rest of the intro text here */}
      </Typography>
      <Typography>
        <Link href="https://docs.grassecon.org/commons/voucher/#voucher">
          Read More
        </Link>
      </Typography>
      <Typography>
        <Link href="youtube …">Watch Video</Link>
      </Typography>
      <Typography variant="h6">Warning</Typography>
      <Typography>
        This walkthrough and lessons learned described here are based...
        {/* add the rest of the warning text here */}
      </Typography>
    </Box>
  );
}

export function Step1() {
  const { updateVoucherData, voucherData } = useVoucherCreation();

  return (
    <Box>
      <Typography variant="h5">About you</Typography>
      <Typography>Please tell us who is issuing this voucher...</Typography>
      <FormControl>
        <TextField
          label="Your name"
          onChange={(e) => updateVoucherData("name", e.target.value)}
        />
        <TextField label="Your Contact information" />

        <TextField label="Your Location" />

        {/* ... */}
      </FormControl>
      <Typography>
        <Link href="https://docs.grassecon.org/commons/voucher/#voucher">
          Read More
        </Link>
      </Typography>
    </Box>
  );
}

export function Step2() {
  return (
    <Box>
      <Typography variant="h5">Name and Products</Typography>
      <Typography>Please give your voucher a name and symbol...</Typography>
      <FormControl>
        <TextField label="Voucher Name (24 characters?)" />
        <TextField label="Voucher Symbol" />
        <TextField label="Products" />
      </FormControl>
      <Typography>
        <Link href="https://docs.grassecon.org/commons/voucher/#voucher">
          Read More
        </Link>
      </Typography>
      <Typography variant="h6">Warning</Typography>
      <Typography>Warning: Fair use (on capacity)...</Typography>
    </Box>
  );
}

export function Step3() {
  return (
    <Box>
      <Typography variant="h5">Value and Supply</Typography>
      <Typography>
        By what standard do you measure the value of your product?...
        {/* And so on... */}
      </Typography>
    </Box>
  );
}

export function Step4() {
  return (
    <Box>
      <Typography variant="h5">Expiration</Typography>
      <Typography>Vouchers generally expire...</Typography>
      {/* And so on... */}
    </Box>
  );
}

export function Step5() {
  return (
    <Box>
      <Typography variant="h5">Other Options</Typography>
      <Typography>Here are some other options...</Typography>
      {/* And so on... */}
    </Box>
  );
}

export function Step6() {
  return (
    <Box>
      <Typography variant="h5">Signing and Publishing</Typography>
      <Typography>Please review everything about your voucher!...</Typography>
      <FormControl>
        <InputLabel>All input here.</InputLabel>
        <Input />
        {/* ... */}
      </FormControl>
      <Typography>
        <Link href="https://docs.grassecon.org/commons/voucher/#voucher">
          Read More
        </Link>
      </Typography>
      <Typography variant="h6">Warning</Typography>
      <Typography>Warning: Publishing your voucher is final!...</Typography>
    </Box>
  );
}
