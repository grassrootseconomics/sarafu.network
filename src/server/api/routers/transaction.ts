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

      try {
        // Pre-filter each query with ORDER BY and LIMIT to reduce dataset size
        const subqueryLimit = Math.max(limit * 3, 100); // Get more from each to ensure we have enough

        // Token transfers query with pre-sorting
        let transfersQuery = ctx.federatedDB
          .selectFrom("chain_data.token_transfer")
          .leftJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
          .select([
            sql<string>`'token_transfer'`.as("event_type"),
            "chain_data.tx.date_block",
            "chain_data.tx.tx_hash", 
            "chain_data.token_transfer.contract_address as voucher_address",
            "chain_data.token_transfer.sender_address as from_address",
            "chain_data.token_transfer.recipient_address as to_address",
            "chain_data.tx.success as success",
            sql<string>`CAST(chain_data.token_transfer.transfer_value AS TEXT)`.as("value"),
          ])
          .orderBy("chain_data.tx.date_block", "desc")
          .limit(subqueryLimit);

        // Token mints query with pre-sorting
        let mintsQuery = ctx.federatedDB
          .selectFrom("chain_data.token_mint")
          .leftJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_mint.tx_id")
          .select([
            sql<string>`'token_mint'`.as("event_type"),
            "chain_data.tx.date_block",
            "chain_data.tx.tx_hash",
            "chain_data.token_mint.contract_address as voucher_address", 
            "chain_data.token_mint.contract_address as from_address",
            "chain_data.token_mint.recipient_address as to_address",
            "chain_data.tx.success as success",
            sql<string>`CAST(chain_data.token_mint.mint_value AS TEXT)`.as("value"),
          ])
          .orderBy("chain_data.tx.date_block", "desc")
          .limit(subqueryLimit);

        // Token burns query with pre-sorting
        let burnsQuery = ctx.federatedDB
          .selectFrom("chain_data.token_burn")
          .leftJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_burn.tx_id")
          .select([
            sql<string>`'token_burn'`.as("event_type"),
            "chain_data.tx.date_block",
            "chain_data.tx.tx_hash",
            "chain_data.token_burn.contract_address as voucher_address",
            "chain_data.token_burn.burner_address as from_address",
            sql<string>`${ZERO_ADDRESS}`.as("to_address"),
            "chain_data.tx.success as success",
            sql<string>`CAST(chain_data.token_burn.burn_value AS TEXT)`.as("value"),
          ])
          .orderBy("chain_data.tx.date_block", "desc")
          .limit(subqueryLimit);

        // Apply filters to all queries
        if (input?.voucherAddress) {
          transfersQuery = transfersQuery.where(
            "chain_data.token_transfer.contract_address",
            "=",
            input.voucherAddress
          );
          mintsQuery = mintsQuery.where(
            "chain_data.token_mint.contract_address",
            "=",
            input.voucherAddress
          );
          burnsQuery = burnsQuery.where(
            "chain_data.token_burn.contract_address",
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

        // Execute all queries in parallel to reduce latency
        const [transfers, mints, burns] = await Promise.all([
          transfersQuery.execute(),
          mintsQuery.execute(),
          burnsQuery.execute(),
        ]);

        // Merge and sort results in application code
        const allTransactions = [...transfers, ...mints, ...burns]
          .sort((a, b) => {
            const dateA = a.date_block ? new Date(a.date_block).getTime() : 0;
            const dateB = b.date_block ? new Date(b.date_block).getTime() : 0;
            return dateB - dateA;
          })
          .slice(cursor, cursor + limit);

        return {
          transactions: allTransactions,
          nextCursor: allTransactions.length === limit ? cursor + limit : undefined,
        };

      } catch (error) {
        console.error("Transaction query error:", error);
        
        // Fallback to simpler query if complex one fails
        const fallbackQuery = ctx.federatedDB
          .selectFrom("chain_data.token_transfer")
          .leftJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
          .select([
            sql<string>`'token_transfer'`.as("event_type"),
            "chain_data.tx.date_block",
            "chain_data.tx.tx_hash",
            "chain_data.token_transfer.contract_address as voucher_address",
            "chain_data.token_transfer.sender_address as from_address",
            "chain_data.token_transfer.recipient_address as to_address",
            "chain_data.tx.success as success",
            sql<string>`CAST(chain_data.token_transfer.transfer_value AS TEXT)`.as("value"),
          ])
          .where((eb) => 
            input?.voucherAddress ? 
              eb("chain_data.token_transfer.contract_address", "=", input.voucherAddress) :
              eb("chain_data.token_transfer.id", "is not", null)
          )
          .orderBy("chain_data.tx.date_block", "desc")
          .limit(limit)
          .offset(cursor);

        const transactions = await fallbackQuery.execute();
        
        return {
          transactions,
          nextCursor: transactions.length === limit ? cursor + limit : undefined,
        };
      }
    }),
});
