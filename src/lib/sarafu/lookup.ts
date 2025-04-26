import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { normalizePhoneNumber } from "~/utils/phone-number";

const url = "https://kvviseru.v3.grassecon.net";

type SuccessResponse = {
  ok: true;
  description: string;
  result: {
    address: Address;
  };
};

type ErrorResponse = {
  ok: false;
  description: string;
};

type Response = SuccessResponse | ErrorResponse;

const getLookUp = async (phoneNumber: string) => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const response = await fetch(
    `${url}/api/v1/lookup/address/${normalizedPhoneNumber}`
  );
  const data = (await response.json()) as Response;
  console.log(data);
  if (!data.ok) {
    return null;
  }
  return data.result.address;
};

export const useLookupPhoneNumber = (phoneNumber: string, enabled: boolean) =>
  useQuery({
    queryKey: ["lookup", phoneNumber],
    queryFn: () => getLookUp(phoneNumber),
    enabled,
  });

export default getLookUp;
