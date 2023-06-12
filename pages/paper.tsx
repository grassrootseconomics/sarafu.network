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
// @ts-ignore
import crypto from "crypto-browserify";
import { NextPage } from "next/types";
import { useEffect, useRef, useState } from "react";

import { QrCode as QrCodeIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import {
  Account,
  WalletClient,
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  isAddress,
  parseUnits,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useBalance, useToken } from "wagmi";
import AddressQRCode from "../src/components/QRCode/AddressQRCode";
import PrivateKeyQRCode from "../src/components/QRCode/PrivateKeyQRCode";
// import QrReader from "../src/components/QRCode/Reader";
import dynamic from "next/dynamic";
import { OnResultFunction } from "../src/components/QRCode/Reader/types";
import { abi } from "../src/contracts/erc20-demurrage-token/contract";
import { useQuery } from "../src/gqty";
import { getViemChain } from "../src/lib/web3";

const QrReader = dynamic(() => import("../src/components/QRCode/Reader"), {
  ssr: false,
});
export const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});
// Constants
const CIPHER_ALGORITHM = "aes-256-cbc";

const PrivateKeyPage: NextPage = () => {
  const [password, setPassword] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [scan, setScan] = useState<boolean>(false);
  const [client, setClient] = useState<WalletClient | undefined>();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const printRef = useRef(null);
  const query = useQuery();
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
    const cipher = crypto.createCipher(CIPHER_ALGORITHM, password);
    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  };

  const decryptPrivateKey = (encryptedKey: string, password: string) => {
    const decipher = crypto.createDecipher(CIPHER_ALGORITHM, password);
    let decrypted = decipher.update(encryptedKey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  const handleGenerateClick = () => {
    const privateKey = generatePrivateKey();
    const encryptedKey = encryptPrivateKey(privateKey, password);
    const account = privateKeyToAccount(privateKey as `0x${string}`);

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
        account: client?.account as Account,
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
      fetchBalance();
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
        <Modal
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          open={scan}
          onClose={() => setScan(false)}
        >
          <Box sx={{ maxWidth: 600, flexGrow: 1 }}>
            {scan && (
              <QrReader
                constraints={{
                  facingMode: "environment",
                }}
                scanDelay={300}
                onResult={handleScan}
              />
            )}
          </Box>
        </Modal>
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
        <Button variant="contained" onClick={sendTx}>
          Send
        </Button>
      </Box>
      <p>Balance: {formatUnits(balance, 18)}</p>
      <Card sx={{ m: 1 }}>
        <Box>
          <List>
            {query.vouchers().map((voucher, idx) => {
              return (
                <VoucherListItem
                  client={client}
                  key={idx}
                  address={client?.account?.address as string}
                  voucher={{
                    voucher_name: voucher.voucher_name,
                    voucher_address: voucher.voucher_address,
                    symbol: voucher.symbol,
                  }}
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
          <Button variant="contained" onClick={sendTx}>
            Send
          </Button>
        </Stack>
      </Card>
    </Modal>
  );
};
export default PrivateKeyPage;
