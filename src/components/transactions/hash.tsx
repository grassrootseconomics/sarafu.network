import Link from "next/link";
import { celoscanUrl } from "~/utils/celo";
import { truncateEthAddress } from "~/utils/dmr-helpers";

interface IAddressProps {
  hash?: string;
}

function Hash(props: IAddressProps) {
  return (
    <Link className="text-slate-400" href={celoscanUrl.tx(props.hash || "")}>
      TX Hash: {truncateEthAddress(props.hash)}
    </Link>
  );
}

export default Hash;
