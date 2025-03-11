import { sql } from "kysely";
import { z } from "zod";
import { ZERO_ADDRESS } from "~/lib/contacts";
import { publicProcedure, router } from "~/server/api/trpc";

export const transactionRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        voucherAddress: z.string().nullish(),
        accountAddress: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? 0;

      // Token transfers query
      let transfersQuery = ctx.indexerDB
        .selectFrom("token_transfer")
        .leftJoin("tx", "token_transfer.tx_id", "tx.id")
        .select([
          sql<string>`'token_transfer'`.as("event_type"),
          "tx.date_block",
          "tx.tx_hash",
          "token_transfer.contract_address as voucher_address",
          "token_transfer.sender_address as from_address",
          "token_transfer.recipient_address as to_address",
          "tx.success as success",
          sql<string>`CAST(token_transfer.transfer_value AS TEXT)`.as("value"),
        ]);

      // Token mints query
      let mintsQuery = ctx.indexerDB
        .selectFrom("token_mint")
        .leftJoin("tx", "token_mint.tx_id", "tx.id")
        .select([
          sql<string>`'token_mint'`.as("event_type"),
          "tx.date_block",
          "tx.tx_hash",
          "token_mint.contract_address as voucher_address",
          "token_mint.contract_address as from_address",
          "token_mint.recipient_address as to_address",
          "tx.success as success",
          sql<string>`CAST(token_mint.mint_value AS TEXT)`.as("value"),
        ]);

      // Token burns query
      let burnsQuery = ctx.indexerDB
        .selectFrom("token_burn")
        .leftJoin("tx", "token_burn.tx_id", "tx.id")
        .select([
          sql<string>`'token_burn'`.as("event_type"),
          "tx.date_block",
          "tx.tx_hash",
          "token_burn.contract_address as voucher_address",
          "token_burn.burner_address as from_address",
          sql<string>`${ZERO_ADDRESS}`.as("to_address"),
          "tx.success as success",
          sql<string>`CAST(token_burn.burn_value AS TEXT)`.as("value"),
        ]);

      // Apply filters to all queries
      if (input?.voucherAddress) {
        transfersQuery = transfersQuery.where(
          "token_transfer.contract_address",
          "=",
          input.voucherAddress
        );
        mintsQuery = mintsQuery.where(
          "token_mint.contract_address",
          "=",
          input.voucherAddress
        );
        burnsQuery = burnsQuery.where(
          "token_burn.contract_address",
          "=",
          input.voucherAddress
        );
      }

      if (input?.accountAddress) {
        const accountAddress = input.accountAddress;
        transfersQuery = transfersQuery.where((eb) =>
          eb.or([
            eb("sender_address", "=", accountAddress),
            eb("recipient_address", "=", accountAddress),
          ])
        );

        mintsQuery = mintsQuery.where((eb) =>
          eb.or([
            eb("minter_address", "=", accountAddress),
            eb("recipient_address", "=", accountAddress),
          ])
        );

        burnsQuery = burnsQuery.where("burner_address", "=", accountAddress);
      }

      // Union all queries and order by date
      const unionQuery = transfersQuery
        .union(mintsQuery)
        .union(burnsQuery)
        .orderBy("date_block", "desc")
        .limit(limit)
        .offset(cursor);

      const transactions = await unionQuery.execute();

      return {
        transactions,
        nextCursor: transactions.length == limit ? cursor + limit : undefined,
      };
    }),
});
