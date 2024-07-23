import { InfoCircledIcon } from "@radix-ui/react-icons";
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
    <div className="flex flex-col">
      <h2 className="flex items-center justify-between ">
        <div className="flex justify-start text-primary-foreground bg-primary rounded-full p-1 px-6 text-base w-fit font-light text-center">
          <InfoCircledIcon height={25} width={25} className="mr-4" />
          Details
        </div>
      </h2>
      <div className="p-4 bg-white rounded shadow-lg my-4 mx-2">
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
                pool?.tokenLimiter ? (
                  <Address address={pool?.tokenLimiter} />
                ) : (
                  ""
                )
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
    </div>
  );
};
