import { useMediaQuery } from "@mui/material";
import { type Theme } from "~/lib/theme";
import { celoscanUrl } from "~/utils/celo";
import { truncateEthAddress } from "~/utils/dmr-helpers";
import { NextLinkComposed } from "./Link";

interface IAddressProps {
  address?: string;
  shrink?: boolean;
}

function Address(props: IAddressProps) {
  const isMD = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const address =
    isMD && props.shrink ? truncateEthAddress(props.address) : props.address;
  return (
    <NextLinkComposed href={celoscanUrl.address(props.address || "")}>
      {address}
    </NextLinkComposed>
  );
}

export default Address;
