import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../../src/contracts/erc20-token-index/contract";
import { resolve } from "../../src/gqty";
import { ironOptions } from "../../src/lib/iron";
import { getChain } from "../../src/lib/web3";

// Set up environment variables and related constants
const authorizedAddresses = (
  process.env.NEXT_PUBLIC_AUTHORIZED_ADDRESSES as string
).split(",");
const tokenIndexWriterPrivateKey = process.env
  .TOKEN_INDEX_WRITER_PRIVATE_KEY as `0x${string}`;
const tokenIndexAddress = process.env
  .NEXT_PUBLIC_TOKEN_INDEX_ADDRESS as `0x${string}`;

// Create an account from the private key
const account = privateKeyToAccount(tokenIndexWriterPrivateKey);

// Define the request body structure
export interface InsertVoucherBody {
  voucher: {
    demurrageRate: number;
    periodMinutes: number;
    geo: string; // "-1.286389, 36.817223"
    locationName: string;
    sinkAddress: `0x${string}`;
    decimals: number;
    supply: number;
    symbol: string;
    voucherAddress: `0x${string}`;
    voucherName: string;
    voucherDescription: string;
  };
}

// Define the main request handling function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const address = req.session?.siwe?.address;

  // Check for valid address and authorized access
  if (
    typeof address !== "string" ||
    !isAddress(address) ||
    !authorizedAddresses.includes(address)
  ) {
    console.log(
      "Invalid or unauthorized address: ",
      req.session?.siwe?.address
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse request body
  let requestData: InsertVoucherBody;
  try {
    requestData = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: "Invalid JSON in body" });
  }

  // Get Chain
  const chain = getChain();

  // Handle request based on method
  const { method } = req;
  console.log({ account });
  switch (method) {
    case "POST":
      // Initialize clients
      const client = createWalletClient({
        account,
        chain: chain,
        transport: http(),
      });
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      // Write contract and get receipt
      console.log({
        address: tokenIndexAddress,
        functionName: "add",
        args: [requestData.voucher.voucherAddress],
      });
      try {
        const hash = await client.writeContract({
          abi: abi,
          address: tokenIndexAddress,
          functionName: "add",
          args: [requestData.voucher.voucherAddress],
        });
        console.log({ hash });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status == "reverted") {
          return res.status(500).json({
            error: `Failed to write to Token Index: Transaction ${hash} on ${
              getChain().name
            } was Reverted`,
          });
        }
      } catch (error) {
        console.error(
          "Failed to write contract or get transaction receipt:",
          error
        );
        return res.status(500).json({
          error: "Failed to write contract or get transaction receipt",
        });
      }

      // Deploy to CIC Graph and return result
      const data = await resolve(({ mutation }) => {
        const voucher = mutation.insert_vouchers_one({
          object: createVoucherObject(requestData.voucher),
        });
        return { ...voucher };
      });

      console.log(data);
      return res.send({ result: "Success" });

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Helper function to create the voucher object
function createVoucherObject(voucherData: InsertVoucherBody["voucher"]) {
  return {
    active: true,
    demurrage_rate: voucherData.demurrageRate,
    geo: voucherData.geo,
    location_name: voucherData.locationName,
    sink_address: voucherData.sinkAddress,
    supply: voucherData.supply || 10,
    symbol: voucherData.symbol,
    voucher_name: voucherData.voucherName,
    voucher_description: voucherData.voucherDescription,
    voucher_address: voucherData.voucherAddress,
  };
}

export default withIronSessionApiRoute(handler, ironOptions);
