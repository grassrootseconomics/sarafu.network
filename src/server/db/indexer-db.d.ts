import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Numeric = ColumnType<string, number | string, number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Contracts {
  contract_address: string;
  contract_description: string;
  id: Generated<number>;
  is_token: boolean;
}

export interface FaucetGive {
  contract_address: string;
  give_value: Numeric;
  id: Generated<number>;
  recipient_address: string;
  token_address: string;
  tx_id: number | null;
}

export interface PoolDeposit {
  contract_address: string;
  id: Generated<number>;
  in_value: Numeric;
  initiator_address: string;
  token_in_address: string;
  tx_id: number | null;
}

export interface PoolSwap {
  contract_address: string;
  fee: Numeric;
  id: Generated<number>;
  in_value: Numeric;
  initiator_address: string;
  out_value: Numeric;
  token_in_address: string;
  token_out_address: string;
  tx_id: number | null;
}

export interface PriceIndexUpdates {
  contract_address: string;
  exchange_rate: Numeric;
  id: Generated<number>;
  token: string;
  tx_id: number | null;
}

export interface SchemaVersion {
  version: number;
}

export interface TokenBurn {
  burn_value: Numeric;
  burner_address: string;
  contract_address: string;
  id: Generated<number>;
  tx_id: number | null;
}

export interface TokenMint {
  contract_address: string;
  id: Generated<number>;
  mint_value: Numeric;
  minter_address: string;
  recipient_address: string;
  tx_id: number | null;
}

export interface Tokens {
  contract_address: string;
  id: Generated<number>;
  token_decimals: number;
  token_name: string;
  token_symbol: string;
  token_type: string;
  token_version: string;
}

export interface TokenTransfer {
  contract_address: string;
  id: Generated<number>;
  recipient_address: string;
  sender_address: string;
  transfer_value: Numeric;
  tx_id: number | null;
}

export interface Tx {
  block_number: number;
  date_block: Timestamp;
  id: Generated<number>;
  success: boolean;
  tx_hash: string;
}

export interface DB {
  contracts: Contracts;
  faucet_give: FaucetGive;
  pool_deposit: PoolDeposit;
  pool_swap: PoolSwap;
  price_index_updates: PriceIndexUpdates;
  schema_version: SchemaVersion;
  token_burn: TokenBurn;
  token_mint: TokenMint;
  token_transfer: TokenTransfer;
  tokens: Tokens;
  tx: Tx;
}
