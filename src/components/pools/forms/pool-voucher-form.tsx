// Add and edit pool vouchers form
// Add an address
// Add a voucher code
// Add a voucher type
// Add a voucher amount
// Add a voucher expiration date

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { SwapPoolVoucher } from "../types";

// Add a voucher redemption limit
const schema = z.object({
  pool_address: z.string(),
  voucher_address: z.string(),
  limit: z.number(), // Maximum number of vouchers that are allowd in the pool
});
export function PoolVoucherForm({ pool }: { pool: SwapPoolVoucher }) {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const { data: vouchers } = api..getAll.useQuery();

  return (
    <div>
      <h2>Add a voucher</h2>
      <Form {...form}>
        <form>
          <SelectVoucherField
            form={form}
            name="voucherAddress"
            label="Voucher"
            placeholder="Select voucher"
            className="flex-grow"
            getFormValue={(v) => v.address}
            searchableValue={(v) => `${v.voucher_name}`}
            renderSelectedItem={(v) =>}
            renderItem={(v) => (
              <div className="flex justify-between">
                <div>{v.voucher_name}</div>
              </div>
            )}
            items={vouchers}
          />
          <InputField
            form={form}
            name="limit"
            label="Limit"
            placeholder="Maximum number of vouchers that can be redeemed"
          />
          <Button type="submit">Add</Button>
        </form>
      </Form>
    </div>
  );
}
