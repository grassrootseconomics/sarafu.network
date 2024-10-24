"use client";
import Address from "../address";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Row } from "../voucher/voucher-info";
import { useSwapPool } from "./hooks";

export const PoolDetails = ({ address }: { address: `0x${string}` }) => {
  const { data: pool } = useSwapPool(address);
  return (
    <div className="">
      <Row label="Name" value={pool?.name ?? ""} />
      <Row label="Vouchers" value={pool?.vouchers.length ?? ""} />
      <Row label="Fee" value={pool?.feePercentage.toString() + " %"} />
      <Row
        label="Address"
        value={address ? <Address address={address} /> : ""}
      />
      <Collapsible>
        <CollapsibleContent>
          <Row
            label="Owner"
            value={pool?.owner ? <Address address={pool?.owner} /> : ""}
          />
          <Row
            label="Quoter"
            value={pool?.quoter ? <Address address={pool?.quoter} /> : ""}
          />
          <Row
            label="Voucher Registry"
            value={
              pool?.tokenRegistry ? (
                <Address address={pool?.tokenRegistry} />
              ) : (
                ""
              )
            }
          />
          <Row
            label="Limiter"
            value={
              pool?.tokenLimiter ? <Address address={pool?.tokenLimiter} /> : ""
            }
          />
          <Row
            label="Fee Address"
            value={
              pool?.feeAddress ? <Address address={pool?.feeAddress} /> : ""
            }
          />
        </CollapsibleContent>
        <CollapsibleTrigger className="text-sm font-light  mx-auto w-full">
          Show More
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
};
