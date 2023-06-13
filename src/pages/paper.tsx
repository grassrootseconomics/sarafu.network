/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// TODO: Fix all the eslint-disable comments above
// TODO: Switch from crypto-browserify to global.subtle
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import crypto from "crypto-browserify";
import { type NextPage } from "next/types";
import { useEffect, useRef, useState } from "react";

import { Close, FileOpen, QrCode as QrCodeIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  isAddress,
  parseUnits,
  type Account,
  type WalletClient,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useBalance, useToken } from "wagmi";
import AddressQRCode from "../components/QRCode/AddressQRCode";
import PrivateKeyQRCode from "../components/QRCode/PrivateKeyQRCode";
// import QrReader from "../src/components/QRCode/Reader";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { type OnResultFunction } from "../components/QRCode/Reader/types";
import { abi } from "../contracts/erc20-demurrage-token/contract";
import { getViemChain } from "../lib/web3";

const QrReader = dynamic(() => import("../components/QRCode/Reader"), {
  ssr: false,
});
export const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});
// Constants
const CIPHER_ALGORITHM = "aes-256-cbc";

function QrReaderModal(props: {
  scan: boolean;
  setScan: (arg0: boolean) => void;
  handleScan: OnResultFunction;
}) {
  return (
    <Modal open={props.scan} onClose={() => props.setScan(false)}>
      <Stack height={"100%"} width={"100%"} alignContent={"center"}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <IconButton>
            <Close />
          </IconButton>
          <IconButton>
            <FileOpen />
          </IconButton>
        </Stack>
        <Box
          sx={{
            width: "100%",
            margin: "auto",
            maxWidth: "600px",
            height: "100%",
          }}
        >
          {props.scan && (
            <QrReader
              constraints={{
                facingMode: "environment",
              }}
              scanDelay={300}
              onResult={props.handleScan}
            />
          )}
        </Box>
      </Stack>
    </Modal>
  );
}

const PrivateKeyPage: NextPage = () => {
  const [password, setPassword] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [scan, setScan] = useState<boolean>(true);
  const [client, setClient] = useState<WalletClient | undefined>();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const { data: vouchers } = api.voucher.getAll.useQuery();
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

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

  const encryptPrivateKey = (privateKey: string, password: string) => {
    //@ts-ignore
    const cipher = crypto.createCipher(CIPHER_ALGORITHM, password);
    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted as string;
  };

  const decryptPrivateKey = (encryptedKey: string, password: string) => {
    //@ts-ignore
    const decipher = crypto.createDecipher(CIPHER_ALGORITHM, password);
    let decrypted = decipher.update(encryptedKey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted as string;
  };

  const handleGenerateClick = () => {
    const privateKey = generatePrivateKey();
    const encryptedKey = encryptPrivateKey(privateKey, password);
    const account = privateKeyToAccount(privateKey);

    setClient(
      createWalletClient({
        account,
        chain: getViemChain(),
        transport: http(),
      })
    );
    setQrCode(encryptedKey);
  };

  const handleScan: OnResultFunction = (result, error) => {
    console.error("scan", error);
    if (!!result) {
      const decryptedKey = decryptPrivateKey(result.getText(), password);
      setDecryptedKey(decryptedKey);
      setScan(false);
    }

    if (!!error && error.name !== "NotFoundException") {
      console.info(error);
      setScan(false);
    }
  };

  // Effect to set client after decrypted key is received
  useEffect(() => {
    if (decryptedKey) {
      const account = privateKeyToAccount(decryptedKey as `0x${string}`);
      setClient(
        createWalletClient({
          account,
          chain: getViemChain(),
          transport: http(),
        })
      );
    }
  }, [decryptedKey]);

  // Function to send a transaction
  const sendTx = async () => {
    if (client?.account && isAddress(recipientAddress)) {
      const tx = await client?.sendTransaction({
        to: recipientAddress,
        account: client?.account,
        chain: getViemChain(),
        value: BigInt(amountToSend),
      });
      alert(`Hash ${tx}`);
    }
  };

  // Function to fetch the balance
  const fetchBalance = async () => {
    if (client?.account?.address) {
      const balance = await publicClient?.getBalance({
        address: client?.account?.address,
      });
      setBalance(balance);
    }
  };

  // Fetch balance when the client is set or changes
  useEffect(() => {
    if (client) {
      void fetchBalance();
    }
  }, [client, client?.account?.address]);

  return (
    <Box component="form" sx={{ mt: 4, p: 2 }} noValidate autoComplete="off">
      <TextField
        id="outlined-password-input"
        label="Password"
        type="password"
        autoComplete="current-password"
        onChange={handlePasswordChange}
      />
      <Button variant="contained" onClick={handleGenerateClick}>
        Generate
      </Button>
      <Button variant="contained" onClick={handlePrint}>
        Print
      </Button>
      <Button variant="contained" onClick={() => setScan(!scan)}>
        Scan
      </Button>
      <Box ref={printRef} sx={{ p: 3 }}>
        {qrCode && <PrivateKeyQRCode encryptedPubicKey={qrCode} />}
        {client?.account?.address && (
          <Box display={"flex"} flexDirection={"column"}>
            <AddressQRCode address={client?.account?.address} />
            <Typography variant="body2">
              Address: {client?.account?.address}
            </Typography>
          </Box>
        )}
        <p>Password: {password}</p>
      </Box>
      <Box sx={{ width: "500px" }}>
        <QrReaderModal scan={scan} setScan={setScan} handleScan={handleScan} />
      </Box>
      <Box display={"flex"} flexWrap={"wrap"} flexDirection={"row"}>
        <TextField
          id="recipient-address-input"
          label="Recipient Address"
          type="text"
          size="small"
          onChange={handleRecipientAddressChange}
        />
        <TextField
          id="amount-input"
          label="Amount to Send"
          size="small"
          type="text"
          onChange={handleAmountToSendChange}
        />
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Button variant="contained" onClick={sendTx}>
          Send
        </Button>
      </Box>
      <p>Balance: {formatUnits(balance, 18)}</p>
      <Card sx={{ m: 1 }}>
        <Box>
          <List>
            {vouchers?.map((voucher, idx) => {
              return (
                <VoucherListItem
                  client={client}
                  key={idx}
                  address={client?.account?.address as string}
                  voucher={voucher}
                />
              );
            })}
          </List>
        </Box>
      </Card>
    </Box>
  );
};
const VoucherListItem = ({
  voucher,
  address,
  client,
}: {
  address: string;
  client?: WalletClient;
  voucher: {
    voucher_name?: string;
    voucher_address?: string;
    symbol?: string;
  };
}) => {
  const { data: token } = useToken({
    address: voucher.voucher_address as `0x${string}`,
  });
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const { data: balanceData } = useBalance({
    token: voucher.voucher_address as `0x${string}`,
    address: address as `0x${string}`,
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

  const sendTx = async () => {
    const args = [
      recipientAddress as `0x${string}`,
      BigInt(
        parseUnits(amountToSend as `${number}`, token?.decimals as number)
      ),
    ] as const;
    const tx = await client?.writeContract({
      account: client?.account as Account,
      chain: getViemChain(),
      address: token?.address as `0x${string}`,
      abi: abi,
      functionName: "transfer",
      args: args,
    });
    alert(tx);
  };

  const balance =
    balanceData?.value && token?.decimals
      ? formatUnits(balanceData.value, token.decimals)
      : "0";

  return (
    <ListItem
      secondaryAction={
        <>
          <Button variant="contained" onClick={() => setModal(!modal)}>
            Send
          </Button>
          <SendModal
            open={modal}
            onClose={() => setModal(false)}
            voucher={voucher}
            balance={balance}
            recipientAddress={recipientAddress}
            handleRecipientAddressChange={handleRecipientAddressChange}
            amountToSend={amountToSend}
            handleAmountToSendChange={handleAmountToSendChange}
            sendTx={sendTx}
          />
        </>
      }
    >
      <ListItemText primary={voucher.voucher_name} secondary={balance} />
    </ListItem>
  );
};

const SendModal = ({
  open,
  onClose,
  voucher,
  balance,
  recipientAddress,
  handleRecipientAddressChange,
  amountToSend,
  handleAmountToSendChange,
  sendTx,
}: {
  open: boolean;
  onClose: () => void;
  voucher: {
    voucher_name?: string;
    voucher_address?: string;
    symbol?: string;
  };
  balance: string;
  recipientAddress: string;
  handleRecipientAddressChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  amountToSend: string;
  handleAmountToSendChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  sendTx: () => Promise<void>;
}) => {
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
            onChange={handleRecipientAddressChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="scan qr code" edge="end">
                    <QrCodeIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="amount-input"
            label="Amount"
            type="text"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Chip label={voucher.symbol} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="start">
                  Max ({balance})
                </InputAdornment>
              ),
            }}
            onChange={handleAmountToSendChange}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button variant="contained" onClick={sendTx}>
            Send
          </Button>
        </Stack>
      </Card>
    </Modal>
  );
};
export default PrivateKeyPage;
