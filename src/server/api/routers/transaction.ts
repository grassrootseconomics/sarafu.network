import { sql } from "kysely";
import { z } from "zod";
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
      let query = ctx.indexerDB
        .selectFrom("token_transfer")
        .leftJoin("tx", "tx_id", "tx.id")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .orderBy("tx.date_block", "desc");
      if (input?.voucherAddress) {
        query = query.where("contract_address", "=", input.voucherAddress);
      }
      if (input?.voucherAddress) {
        query = query.where("contract_address", "=", input.voucherAddress);
      }
      if (input?.accountAddress) {
        const accountAddress = input.accountAddress;
        query = query.where((eb) =>
          eb.or([
            eb("sender_address", "=", accountAddress),
            eb("recipient_address", "=", accountAddress),
          ])
        );
      }
      const transactions = await query.execute();
      return {
        transactions,
        nextCursor: transactions.length == limit ? cursor + limit : undefined,
      };
    }),
  events: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        accountAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const cursor = input.cursor ?? 0;
      const accountAddress = input.accountAddress;

      const query = ctx.indexerDB
        .with("all_events", (db) => {
          const tokenTransferSent = db
            .selectFrom("token_transfer")
            .innerJoin("tx", "tx.id", "token_transfer.tx_id")
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_transfer.id",
              "token_transfer.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "token_transfer.contract_address as token_out_address",
              "token_transfer.sender_address as from_address",
              "token_transfer.recipient_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(token_transfer.transfer_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("token_transfer.sender_address", "=", accountAddress);

          const tokenTransferReceived = db
            .selectFrom("token_transfer")
            .innerJoin("tx", "tx.id", "token_transfer.tx_id")
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_transfer.id",
              "token_transfer.tx_id",
              "token_transfer.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "token_transfer.sender_address as from_address",
              "token_transfer.recipient_address as to_address",
              sql<string>`CAST(token_transfer.transfer_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("token_transfer.recipient_address", "=", accountAddress);

          const tokenMint = db
            .selectFrom("token_mint")
            .innerJoin("tx", "tx.id", "token_mint.tx_id")
            .select([
              sql<string>`'token_mint'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_mint.id",
              "token_mint.tx_id",
              "token_mint.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "token_mint.minter_address as from_address",
              "token_mint.recipient_address as to_address",
              sql<string>`CAST(token_mint.mint_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("token_mint.recipient_address", "=", accountAddress);

          const tokenBurn = db
            .selectFrom("token_burn")
            .innerJoin("tx", "tx.id", "token_burn.tx_id")
            .select([
              sql<string>`'token_burn'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_burn.id",
              "token_burn.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "token_burn.contract_address as token_out_address",
              "token_burn.burner_address as from_address",
              sql<string>`NULL::TEXT`.as("to_address"),
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(token_burn.burn_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("token_burn.burner_address", "=", accountAddress);

          const poolDeposit = db
            .selectFrom("pool_deposit")
            .innerJoin("tx", "tx.id", "pool_deposit.tx_id")
            .select([
              sql<string>`'pool_deposit'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "pool_deposit.id",
              "pool_deposit.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "pool_deposit.token_in_address as token_out_address",
              "pool_deposit.initiator_address as from_address",
              "pool_deposit.contract_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(pool_deposit.in_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("pool_deposit.initiator_address", "=", accountAddress);

          const poolSwap = db
            .selectFrom("pool_swap")
            .innerJoin("tx", "tx.id", "pool_swap.tx_id")
            .select([
              sql<string>`'pool_swap'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "pool_swap.id",
              "pool_swap.tx_id",
              "pool_swap.token_in_address as token_in_address",
              "pool_swap.token_out_address as token_out_address",
              "pool_swap.contract_address as from_address",
              "pool_swap.initiator_address as to_address",
              sql<string>`CAST(pool_swap.in_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`CAST(pool_swap.out_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("pool_swap.initiator_address", "=", accountAddress);

          const faucetGive = db
            .selectFrom("faucet_give")
            .innerJoin("tx", "tx.id", "faucet_give.tx_id")
            .select([
              sql<string>`'faucet_give'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "faucet_give.id",
              "faucet_give.tx_id",
              "faucet_give.token_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "faucet_give.contract_address as from_address",
              "faucet_give.recipient_address as to_address",
              sql<string>`CAST(faucet_give.give_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("faucet_give.recipient_address", "=", accountAddress);

          return tokenTransferSent
            .unionAll(tokenTransferReceived)
            .unionAll(tokenMint)
            .unionAll(tokenBurn)
            .unionAll(poolDeposit)
            .unionAll(poolSwap)
            .unionAll(faucetGive);
        })
        .selectFrom("all_events")
        .selectAll()
        .orderBy("date_block", "desc")
        .orderBy("id", "desc")
        .limit(limit)
        .offset(cursor);

      const events = await query.execute();

      return {
        events,
        nextCursor: events.length === limit ? cursor + limit : undefined,
      };
    }),
});
