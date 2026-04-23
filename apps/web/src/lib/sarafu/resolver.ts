// Server functions re-exported from @sarafu/contracts
export {
  registerENS,
  upsertENS,
  getAddressFromENS,
  getENSFromAddress,
  ENSResolverError,
  isAddressResolution,
  isNameResolution,
  type ENSResolutionParams,
} from "@sarafu/contracts/sarafu/resolver";

// React hooks (local)
export { useENS, useENSExists, useENSAddress } from "./resolver-hooks";
