import { CreationDisabledPage } from "~/components/migration/creation-disabled-page";

export default function CreateVoucherPage() {
  return (
    <CreationDisabledPage resource="voucher" fallbackHref="/vouchers" />
  );
}
