import { useQuery } from "@tanstack/react-query";
import getLookUp from "@sarafu/contracts/sarafu/lookup";

export const useLookupPhoneNumber = (phoneNumber: string, enabled: boolean) =>
  useQuery({
    queryKey: ["lookup", phoneNumber],
    queryFn: () => getLookUp(phoneNumber),
    enabled,
  });
