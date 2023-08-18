import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  string | number | bigint,
  string | number | bigint
>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, string | number, string | number>;

export type Point = {
  x: number;
  y: number;
};

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AccountRoleType {
  value: string;
}

export interface Accounts {
  id: Generated<number>;
  user_identifier: number;
  account_type: string;
  blockchain_address: string;
  created_at: Generated<Timestamp>;
  account_role: Generated<string>;
}

export interface AccountType {
  value: string;
}

export interface GenderType {
  value: string;
}

export interface HdbCatalogHdbActionLog {
  id: Generated<string>;
  action_name: string | null;
  input_payload: Json;
  request_headers: Json;
  session_variables: Json;
  response_payload: Json | null;
  errors: Json | null;
  created_at: Generated<Timestamp>;
  response_received_at: Timestamp | null;
  status: string;
}

export interface HdbCatalogHdbCronEventInvocationLogs {
  id: Generated<string>;
  event_id: string | null;
  status: number | null;
  request: Json | null;
  response: Json | null;
  created_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbCronEvents {
  id: Generated<string>;
  trigger_name: string;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  created_at: Generated<Timestamp | null>;
  next_retry_at: Timestamp | null;
}

export interface HdbCatalogHdbMetadata {
  id: number;
  metadata: Json;
  resource_version: Generated<number>;
}

export interface HdbCatalogHdbScheduledEventInvocationLogs {
  id: Generated<string>;
  event_id: string | null;
  status: number | null;
  request: Json | null;
  response: Json | null;
  created_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbScheduledEvents {
  id: Generated<string>;
  webhook_conf: Json;
  scheduled_time: Timestamp;
  retry_conf: Json | null;
  payload: Json | null;
  header_conf: Json | null;
  status: Generated<string>;
  tries: Generated<number>;
  created_at: Generated<Timestamp | null>;
  next_retry_at: Timestamp | null;
  comment: string | null;
}

export interface HdbCatalogHdbSchemaNotifications {
  id: number;
  notification: Json;
  resource_version: Generated<number>;
  instance_id: string;
  updated_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbVersion {
  hasura_uuid: Generated<string>;
  version: string;
  upgraded_on: Timestamp;
  cli_state: Generated<Json>;
  console_state: Generated<Json>;
}

export interface InterfaceType {
  value: string;
}

export interface Marketplaces {
  id: Generated<number>;
  account: number;
  marketplace_name: string;
  created_at: Generated<Timestamp>;
}

export interface PersonalInformation {
  user_identifier: number;
  year_of_birth: number | null;
  gender: string | null;
  family_name: string | null;
  given_names: string | null;
  location_name: string | null;
  geo: Point | null;
  language_code: Generated<string | null>;
  id: Generated<number>;
}

export interface SchemaVersion {
  version: number;
}

export interface ServiceAcceptedPayment {
  id: Generated<number>;
  voucher: number;
  price: number;
}

export interface Services {
  id: Generated<number>;
  marketplace: number;
  service_type: string;
  service_description: string;
  service_available: Generated<boolean | null>;
  service_accepted_payment: number;
  location_name: string;
  geo: Point | null;
  created_at: Generated<Timestamp>;
}

export interface ServicesImages {
  id: Generated<number>;
  service_id: number | null;
  url_pointer: string;
}

export interface ServicesRatings {
  id: Generated<number>;
  service_id: number;
  rating_by: number;
  score: number;
  created_at: Generated<Timestamp>;
}

export interface ServiceType {
  value: string;
}

export interface Till {
  id: Generated<number>;
  till: string;
  linked_account: number;
  created_at: Generated<Timestamp>;
}

export interface Transactions {
  id: Generated<number>;
  tx_hash: string;
  block_number: number;
  tx_index: number;
  voucher_address: string;
  sender_address: string;
  recipient_address: string;
  tx_value: Int8;
  tx_type: string | null;
  date_block: Timestamp;
  success: boolean;
}

export interface TxType {
  value: string;
}

export interface Users {
  id: Generated<number>;
  interface_type: string;
  interface_identifier: string;
  activated: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
}

export interface VoucherCertifications {
  id: Generated<number>;
  voucher: number;
  certifier: number;
  certifier_weight: Numeric;
  certificate_url_pointer: string;
  created_at: Generated<Timestamp>;
}

export interface VoucherIssuers {
  id: Generated<number>;
  voucher: number;
  backer: number;
  active: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
}

export interface Vouchers {
  id: Generated<number>;
  voucher_address: string;
  symbol: string;
  voucher_name: string;
  voucher_description: string;
  demurrage_rate: Numeric;
  sink_address: string;
  supply: number;
  active: Generated<boolean | null>;
  location_name: string | null;
  geo: Point | null;
  created_at: Generated<Timestamp>;
  radius: number | null;
  internal: Generated<boolean | null>;
}

export interface Vpa {
  id: Generated<number>;
  vpa: string;
  linked_account: number;
  created_at: Generated<Timestamp>;
}

export interface DB {
  account_role_type: AccountRoleType;
  account_type: AccountType;
  accounts: Accounts;
  gender_type: GenderType;
  "hdb_catalog.hdb_action_log": HdbCatalogHdbActionLog;
  "hdb_catalog.hdb_cron_event_invocation_logs": HdbCatalogHdbCronEventInvocationLogs;
  "hdb_catalog.hdb_cron_events": HdbCatalogHdbCronEvents;
  "hdb_catalog.hdb_metadata": HdbCatalogHdbMetadata;
  "hdb_catalog.hdb_scheduled_event_invocation_logs": HdbCatalogHdbScheduledEventInvocationLogs;
  "hdb_catalog.hdb_scheduled_events": HdbCatalogHdbScheduledEvents;
  "hdb_catalog.hdb_schema_notifications": HdbCatalogHdbSchemaNotifications;
  "hdb_catalog.hdb_version": HdbCatalogHdbVersion;
  interface_type: InterfaceType;
  marketplaces: Marketplaces;
  personal_information: PersonalInformation;
  schema_version: SchemaVersion;
  service_accepted_payment: ServiceAcceptedPayment;
  service_type: ServiceType;
  services: Services;
  services_images: ServicesImages;
  services_ratings: ServicesRatings;
  till: Till;
  transactions: Transactions;
  tx_type: TxType;
  users: Users;
  voucher_certifications: VoucherCertifications;
  voucher_issuers: VoucherIssuers;
  vouchers: Vouchers;
  vpa: Vpa;
}
