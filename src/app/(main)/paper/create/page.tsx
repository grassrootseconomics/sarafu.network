import { CreationDisabledPage } from "~/components/migration/creation-disabled-page";

export default function CreatePaperWalletPage() {
  return (
    <CreationDisabledPage resource="paper-wallet" fallbackHref="/wallet" />
  );
}
