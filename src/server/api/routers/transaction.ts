import { sql } from "kysely";
import { z } from "zod";
import { publicProcedure, router } from "~/server/api/trpc";
import { normalizedDateRangeSchema } from "~/utils/zod";

export const transactionRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z
          .object({
            date: z.date(),
            hash: z.string(), // tx_hash as text
            eventType: z.enum(["token_transfer", "token_mint", "token_burn"]),
            rowId: z.string(),
          })
          .nullish(),
        voucherAddress: z.string().nullish(), // varchar
        accountAddress: z.string().nullish(), // varchar
        dateRange: normalizedDateRangeSchema.nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor; // ✅ don't coerce to number

      type TransactionResult = {
        event_type: "token_transfer" | "token_mint" | "token_burn";
        date_block: Date | null;
        tx_hash: string | null; // text/varchar
        voucher_address: string | null; // varchar
        from_address: string | null; // varchar
        to_address: string | null; // varchar
        success: boolean | null;
        value: string | null; // keep as text if your API expects it
        row_id: string; // bigint::text
      };

      // If your DB stores addresses with "0x" prefix, keep it here; otherwise remove "0x".
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

      // Cursor tuple: all TEXT (no bytea anywhere)
      const cursorTuple = cursor
        ? sql`(${cursor.date}::timestamptz,
                ${cursor.hash}::text,
                ${cursor.eventType}::text,
                ${cursor.rowId}::bigint)`
        : sql`(NULL::timestamptz, NULL::text, NULL::text, NULL::bigint)`;

      const allTransactions = await sql<TransactionResult>`
        WITH combined AS (
          /* token_transfer — generic (no account filter) */
          SELECT
            'token_transfer'::text AS event_type,
            tx.date_block,
            tx.tx_hash::text AS tx_hash,
            tt.contract_address::text AS voucher_address,
            tt.sender_address::text AS from_address,
            tt.recipient_address::text AS to_address,
            tx.success,
            tt.transfer_value::text AS value,
            tt.id::bigint AS row_id
          FROM chain_data.token_transfer tt
          JOIN chain_data.tx tx ON tx.id = tt.tx_id
          WHERE ${input?.accountAddress ? sql`FALSE` : sql`TRUE`}
            AND ${
              input?.voucherAddress
                ? sql`tt.contract_address = ${input.voucherAddress}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.from
                ? sql`tx.date_block >= ${input.dateRange.from}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.to
                ? sql`tx.date_block <= ${input.dateRange.to}`
                : sql`TRUE`
            }

          UNION ALL
          /* token_transfer — sender arm */
          SELECT
            'token_transfer', tx.date_block, tx.tx_hash::text,
            tt.contract_address::text, tt.sender_address::text, tt.recipient_address::text,
            tx.success, tt.transfer_value::text, tt.id::bigint
          FROM chain_data.token_transfer tt
          JOIN chain_data.tx tx ON tx.id = tt.tx_id
          WHERE ${
            input?.accountAddress
              ? sql`tt.sender_address = ${input.accountAddress}`
              : sql`FALSE`
          }
            AND ${
              input?.voucherAddress
                ? sql`tt.contract_address = ${input.voucherAddress}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.from
                ? sql`tx.date_block >= ${input.dateRange.from}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.to
                ? sql`tx.date_block <= ${input.dateRange.to}`
                : sql`TRUE`
            }

          UNION ALL
          /* token_transfer — recipient arm */
          SELECT
            'token_transfer', tx.date_block, tx.tx_hash::text,
            tt.contract_address::text, tt.sender_address::text, tt.recipient_address::text,
            tx.success, tt.transfer_value::text, tt.id::bigint
          FROM chain_data.token_transfer tt
          JOIN chain_data.tx tx ON tx.id = tt.tx_id
          WHERE ${
            input?.accountAddress
              ? sql`tt.recipient_address = ${input.accountAddress}`
              : sql`FALSE`
          }
            AND ${
              input?.voucherAddress
                ? sql`tt.contract_address = ${input.voucherAddress}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.from
                ? sql`tx.date_block >= ${input.dateRange.from}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.to
                ? sql`tx.date_block <= ${input.dateRange.to}`
                : sql`TRUE`
            }

          UNION ALL
          /* token_mint */
          SELECT
            'token_mint', tx.date_block, tx.tx_hash::text,
            tm.contract_address::text,
            tm.contract_address::text,
            tm.recipient_address::text,
            tx.success, tm.mint_value::text, tm.id::bigint
          FROM chain_data.token_mint tm
          JOIN chain_data.tx tx ON tx.id = tm.tx_id
          WHERE ${
            input?.voucherAddress
              ? sql`tm.contract_address = ${input.voucherAddress}`
              : sql`TRUE`
          }
            AND ${
              input?.dateRange?.from
                ? sql`tx.date_block >= ${input.dateRange.from}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.to
                ? sql`tx.date_block <= ${input.dateRange.to}`
                : sql`TRUE`
            }
            AND ${
              input?.accountAddress
                ? sql`(tm.minter_address = ${input.accountAddress} OR tm.recipient_address = ${input.accountAddress})`
                : sql`TRUE`
            }

          UNION ALL
          /* token_burn */
          SELECT
            'token_burn', tx.date_block, tx.tx_hash::text,
            tb.contract_address::text,
            tb.burner_address::text,
            ${ZERO_ADDRESS}::text AS to_address,
            tx.success, tb.burn_value::text, tb.id::bigint
          FROM chain_data.token_burn tb
          JOIN chain_data.tx tx ON tx.id = tb.tx_id
          WHERE ${
            input?.voucherAddress
              ? sql`tb.contract_address = ${input.voucherAddress}`
              : sql`TRUE`
          }
            AND ${
              input?.dateRange?.from
                ? sql`tx.date_block >= ${input.dateRange.from}`
                : sql`TRUE`
            }
            AND ${
              input?.dateRange?.to
                ? sql`tx.date_block <= ${input.dateRange.to}`
                : sql`TRUE`
            }
            AND ${
              input?.accountAddress
                ? sql`tb.burner_address = ${input.accountAddress}`
                : sql`TRUE`
            }
        )
        SELECT event_type, date_block, tx_hash, voucher_address, from_address, to_address, success, value, row_id
        FROM combined
        WHERE ${
          cursor
            ? sql`(date_block, tx_hash, event_type, row_id) < ${cursorTuple}`
            : sql`TRUE`
        }
        ORDER BY date_block DESC, tx_hash DESC, event_type DESC, row_id DESC
        LIMIT ${sql.raw(limit.toString())}
      `.execute(ctx.federatedDB);

      const rows = allTransactions.rows;
      const lastRow = rows[rows.length - 1];
      const nextCursor =
        lastRow && rows.length === limit && rows.length > 0
          ? {
              date: lastRow.date_block,
              hash: lastRow.tx_hash, // text
              eventType: lastRow.event_type,
              rowId: lastRow.row_id,
            }
          : undefined;

      return {
        transactions: rows.map(({ row_id: _rowId, ...r }) => r),
        nextCursor,
      };
    }),
});
