import {
  Box,
  Button,
  Card,
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
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
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
import { OnResultFunction } from "../src/components/QRCodeReader/types";
import { abi } from "../src/contracts/erc20-demurrage-token/contract";
import { useQuery } from "../src/gqty";
import { getChain } from "../src/lib/web3";
const QrReader = dynamic(() => import("../src/components/QRCodeReader"), {
  ssr: false,
});
export const publicClient = createPublicClient({
  chain: getChain(),
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
    setQrCode(encryptedKey);
  };

  const handleScan: OnResultFunction = (result, error, codeReader) => {
    console.log("scan", error);
    if (!!result) {
      const decryptedKey = decryptPrivateKey(result.getText(), password);
      console.log({ decryptedKey });
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
          chain: getChain(),
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
        chain: getChain(),
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
    <Box component="form" sx={{ mt: 4 }} noValidate autoComplete="off">
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
        {qrCode && <QRCodeCanvas value={qrCode} />}
        <p>Password: {password}</p>
      </Box>
      <Box sx={{ width: "500px" }}>
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
      <Typography variant="h6">Address: {client?.account?.address}</Typography>

      <Button variant="contained" onClick={sendTx}>
        Send
      </Button>

      <TextField
        id="recipient-address-input"
        label="Recipient Address"
        type="text"
        onChange={handleRecipientAddressChange}
      />
      <TextField
        id="amount-input"
        label="Amount to Send"
        type="text"
        onChange={handleAmountToSendChange}
      />
      <Button variant="contained" onClick={sendTx}>
        Send
      </Button>
      <p>Balance: {formatUnits(balance, 18)}</p>
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
              }}
            />
          );
        })}
      </List>
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
  };
}) => {
  const { data: token } = useToken({
    address: voucher.voucher_address as `0x${string}`,
  });
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amountToSend, setAmountToSend] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const { data: balance } = useBalance({
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
      chain: getChain(),
      address: token?.address as `0x${string}`,
      abi: abi,
      functionName: "transfer",
      args: args,
    });
    console.log({ tx });
  };
  return (
    <ListItem
      secondaryAction={
        <>
          <Button variant="contained" onClick={() => setModal(!modal)}>
            Send
          </Button>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            sx={{ width: "500px" }}
          >
            <Card>
              <Stack>
                <TextField
                  id="recipient-address-input"
                  label="Recipient Address"
                  type="text"
                  onChange={handleRecipientAddressChange}
                />
                <TextField
                  id="amount-input"
                  label="Amount to Send"
                  type="text"
                  onChange={handleAmountToSendChange}
                />
                <Button variant="contained" onClick={sendTx}>
                  Send
                </Button>
              </Stack>
            </Card>
          </Modal>
        </>
      }
    >
      <ListItemText
        primary={voucher.voucher_name}
        secondary={
          balance?.value && token?.decimals
            ? formatUnits(balance.value, token.decimals)
            : 0
        }
      />
    </ListItem>
  );
};

export default PrivateKeyPage;
