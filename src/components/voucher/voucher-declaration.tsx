import { VoucherType } from "~/server/enums";
import { Alert } from "../alert";
import { Row } from "./voucher-info";

export const VoucherDeclaration = ({
  voucher,
  issuer,
  products,
  contract,
}: {
  voucher: {
    voucher_name: string;
    voucher_description: string;
    voucher_uoa: string;
    voucher_value: number;
    voucher_email?: string;
    voucher_website?: string;
    voucher_type: (typeof VoucherType)[keyof typeof VoucherType];
    created_at: string;
  };
  issuer: {
    name: string;
    address: string;
    type: string;
  };
  products?: {
    name: string;
    quantity: number;
    frequency: string;
  }[];
  contract: {
    rate: number;
    period: number;
    symbol: string;
    supply: number;
    communityFund: string;
  };
}) => {
  return (
    <div className="font-light">
      <h1 className="text-3xl font-bold mb-4">
        Community Asset Voucher (CAV) Declaration
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Preamble</h2>
      <p className="mb-4">
        I, <span className="font-semibold">{issuer.name}</span>, hereby agree to
        publish a Community Asset Voucher on the Celo ledger and do not hold
        Grassroots Economics Foundation liable for any damages and understand
        there is no warranty included or implied.
      </p>
      <h2 className="text-2xl font-semibold mb-2">CAV Info</h2>
      <div className="p-2 px-4 shadow-md m-2 break-all">
        <Row label="Name:" value={voucher.voucher_name} />
        <Row label="Description:" value={voucher.voucher_description} />
        <Row label="Symbol:" value={contract.symbol} />
        <Row label="Supply" value={`${contract.supply} ${contract.symbol}`} />

        <Row
          label="Unit of Account and Denomination:"
          value={voucher.voucher_uoa}
        />
        <Row
          label="Value:"
          value={`1 ${contract.symbol} is worth 
              ${voucher?.voucher_value.toString()} ${voucher.voucher_uoa}
               of Goods and Services`}
        />
        <Row label="Contact Email:" value={voucher.voucher_email ?? ""} />
        <Row label="Website:" value={voucher.voucher_website ?? ""} />
        <Row label="Issuer Account Address" value={issuer.address} />
        {voucher.voucher_type === VoucherType.DEMURRAGE && (
          <>
            <Row label="Expiration Rate:" value={`${contract.rate}%`} />
            <Row label="Redistribution Period:" value={contract.period} />
            <Row
              label="Community Account for Expired CAVs:"
              value={contract.communityFund}
            />
          </>
        )}
      </div>
      <br />

      <Alert
        title="Total Value of CAVs"
        variant="info"
        message={`You will be creating an initial supply of ${
          contract.supply
        } ${contract?.symbol} - valued at ${
          contract.supply * voucher.voucher_value
        } ${
          voucher.voucher_uoa
        }, this will be redeemable as payment for the following products:`}
      />
      <br />
      <p className="text-xl font-semibold mb-2">Product Offering and Value:</p>
      <div className="mb-2">
        {products &&
          products.map((product, index) => (
            <li key={index}>
              <strong>{product.quantity}</strong>{" "}
              <strong>{product.name}</strong> will be redeemable every
              <strong> {product.frequency}</strong> using {contract.symbol}
            </li>
          ))}
      </div>
      <br />
      <h2 className="text-2xl font-semibold mb-2">Addendum</h2>
      <p className="mb-2">
        Good Faith: You the issuer of this CAV and any holders into this
        agreement in good faith and holds harmless other members of the
        Grassroots Economics Foundation
      </p>
      <p className="mb-2">
        Entirety: this agreement represents your consent (and or that of the
        association your are representing)
      </p>
      <br />
      <h2 className="text-2xl font-semibold mb-2">Official Signatories</h2>
      <p className="mb-2">
        Title:{" "}
        <span className="font-semibold">
          {issuer.type === "group" ? "Director" : "Individual"}
        </span>
      </p>
      <p className="mb-2">
        Full Name: <span className="font-semibold">{issuer.name}</span>
      </p>
      <p className="mb-2">
        Contact Address:{" "}
        <span className="font-semibold">{voucher.voucher_email}</span>
      </p>
      <p className="mb-2">
        Website:{" "}
        <span className="font-semibold">{voucher.voucher_website}</span>
      </p>
      <p className="mb-2">
        On behalf of: <span className="font-semibold">{issuer.name}</span>
      </p>

      <p className="mb-2">
        Date of Signing:{" "}
        <span className="font-semibold">{voucher.created_at}</span>
      </p>
    </div>
  );
};
