import BigNumber from "bignumber.js";

interface ETHUrlParsed {
  scheme: "ethereum";
  target_address: string;
  prefix?: string;
  chain_id?: string;
  function_name?: string;
  parameters?: Record<string, string>;
}
/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 */
export function parseEthUrl(uri: string): ETHUrlParsed {
  if (!uri || typeof uri !== "string") {
    throw new Error("uri must be a string");
  }

  if (uri.substring(0, 9) !== "ethereum:") {
    throw new Error("Not an Ethereum URI");
  }

  let prefix;
  let address_regex = "(0x[\\w]{40})";

  if (uri.substring(9, 11).toLowerCase() === "0x") {
    prefix = null;
  } else {
    const cutOff = uri.indexOf("-", 9);

    if (cutOff === -1) {
      throw new Error("Missing prefix");
    }
    prefix = uri.substring(9, cutOff);
    const rest = uri.substring(cutOff + 1);

    // Adapting the regex if ENS name detected
    if (rest.substring(0, 2).toLowerCase() !== "0x") {
      address_regex = "([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})";
    }
  }

  const full_regex =
    "^ethereum:(" +
    prefix +
    "-)?" +
    address_regex +
    "\\@?([\\w]*)*\\/?([\\w]*)*";

  const exp = new RegExp(full_regex);
  const data = uri.match(exp);
  if (!data || !data[2]) {
    throw new Error("Couldn not parse the url");
  }

  const parms = uri.split("?");
  const parameters = parms.length > 1 ? parms[1] : "";
  const params = Object.fromEntries(new URLSearchParams(parameters)); // {abc: "foo", def: "[asf]", xyz: "5"}

  const obj: ETHUrlParsed = {
    scheme: "ethereum",
    target_address: data[2],
  };

  if (prefix) {
    obj.prefix = prefix;
  }

  if (data[3]) {
    obj.chain_id = data[3];
  }

  if (data[4]) {
    obj.function_name = data[4];
  }

  if (Object.keys(params).length) {
    obj.parameters = params;
    const amountKey = obj.function_name === "transfer" ? "uint256" : "value";

    if (obj.parameters[amountKey]) {
      const amount = new BigNumber(obj.parameters[amountKey] as string, 10);
      if (!amount.isFinite()) throw new Error("Invalid amount");
      if (amount.isLessThanOrEqualTo(0)) throw new Error("Invalid amount");
      obj.parameters[amountKey] = amount.toString(10);
    }
  }

  return obj;
}

interface BuildEthURIArgs {
  prefix?: string;
  target_address: string;
  chain_id?: string;
  function_name?: string;
  parameters?: Record<string, string>;
}
/**
 * Builds a valid Ethereum URI based on the initial parameters
 */
export function buildEthUrl({
  prefix,
  target_address,
  chain_id,
  function_name,
  parameters,
}: BuildEthURIArgs): string {
  let query = null;
  if (parameters) {
    const amountKey = function_name === "transfer" ? "uint256" : "value";
    if (parameters[amountKey]) {
      const amount = BigNumber(parameters[amountKey]!, 10);
      if (!amount.isFinite()) throw new Error("Invalid amount");
      if (amount.isLessThanOrEqualTo(0)) throw new Error("Invalid amount");
      // This is weird. Scientific notation in JS is usually 2.014e+18
      // but the EIP 681 shows no "+" sign ¯\_(ツ)_/¯
      // source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md#semantics
      parameters[amountKey] = amount
        .toExponential()
        .replace("+", "")
        .replace("e0", "");
    }
    query = new URLSearchParams(parameters).toString();
  }

  const url = `ethereum:${prefix ? prefix + "-" : ""}${target_address}${
    chain_id ? `@${chain_id}` : ""
  }${function_name ? `/${function_name}` : ""}${query ? "?" + query : ""}`;
  return url;
}
