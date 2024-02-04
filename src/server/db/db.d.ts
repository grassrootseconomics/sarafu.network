import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, number | string, number | string>;

export type Point = {
  x: number;
  y: number;
};

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AccountRoleType {
  value: string;
}

export interface Accounts {
  account_role: Generated<string>;
  account_type: string;
  blockchain_address: string;
  created_at: Generated<Timestamp>;
  default_voucher: string | null;
  gas_approver: number | null;
  gas_gift_status: Generated<string>;
  id: Generated<number>;
  user_identifier: number;
}

export interface AccountType {
  value: string;
}

export interface CommodityListings {
  account: number;
  commodity_available: Generated<boolean | null>;
  commodity_description: string;
  commodity_name: string;
  commodity_type: string;
  created_at: Generated<Timestamp>;
  frequency: string;
  geo: Point | null;
  id: Generated<number>;
  location_name: string;
  quantity: number;
  voucher: number;
}

export interface CommodityType {
  value: string;
}

export interface GasGiftStatusType {
  value: string;
}

export interface GenderType {
  value: string;
}

export interface HdbCatalogHdbActionLog {
  action_name: string | null;
  created_at: Generated<Timestamp>;
  errors: Json | null;
  id: Generated<string>;
  input_payload: Json;
  request_headers: Json;
  response_payload: Json | null;
  response_received_at: Timestamp | null;
  session_variables: Json;
  status: string;
}

export interface HdbCatalogHdbCronEventInvocationLogs {
  created_at: Generated<Timestamp | null>;
  event_id: string | null;
  id: Generated<string>;
  request: Json | null;
  response: Json | null;
  status: number | null;
}

export interface HdbCatalogHdbCronEvents {
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  next_retry_at: Timestamp | null;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  trigger_name: string;
}

export interface HdbCatalogHdbMetadata {
  id: number;
  metadata: Json;
  resource_version: Generated<number>;
}

export interface HdbCatalogHdbScheduledEventInvocationLogs {
  created_at: Generated<Timestamp | null>;
  event_id: string | null;
  id: Generated<string>;
  request: Json | null;
  response: Json | null;
  status: number | null;
}

export interface HdbCatalogHdbScheduledEvents {
  comment: string | null;
  created_at: Generated<Timestamp | null>;
  header_conf: Json | null;
  id: Generated<string>;
  next_retry_at: Timestamp | null;
  payload: Json | null;
  retry_conf: Json | null;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  webhook_conf: Json;
}

export interface HdbCatalogHdbSchemaNotifications {
  id: number;
  instance_id: string;
  notification: Json;
  resource_version: Generated<number>;
  updated_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbVersion {
  cli_state: Generated<Json>;
  console_state: Generated<Json>;
  hasura_uuid: Generated<string>;
  upgraded_on: Timestamp;
  version: string;
}

export interface InterfaceType {
  value: string;
}

export interface Marketplaces {
  account: number;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  marketplace_name: string;
}

export interface PersonalInformation {
  family_name: string | null;
  gender: string | null;
  geo: Point | null;
  given_names: string | null;
  id: Generated<number>;
  language_code: Generated<string | null>;
  location_name: string | null;
  user_identifier: number;
  year_of_birth: number | null;
}

export interface SchemaVersion {
  version: number;
}

export interface ServiceAcceptedPayment {
  id: Generated<number>;
  price: number;
  voucher: number;
}

export interface Services {
  created_at: Generated<Timestamp>;
  geo: Point | null;
  id: Generated<number>;
  location_name: string;
  marketplace: number;
  service_accepted_payment: number;
  service_available: Generated<boolean | null>;
  service_description: string;
  service_type: string;
}

export interface ServicesImages {
  id: Generated<number>;
  service_id: number | null;
  url_pointer: string;
}

export interface ServicesRatings {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  rating_by: number;
  score: number;
  service_id: number;
}

export interface ServiceType {
  value: string;
}

export interface Till {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  linked_account: number;
  till: string;
}

export interface Transactions {
  block_number: number;
  date_block: Timestamp;
  id: Generated<number>;
  recipient_address: string;
  sender_address: string;
  success: boolean;
  tx_hash: string;
  tx_index: number;
  tx_type: string | null;
  tx_value: Int8;
  voucher_address: string;
}

export interface TxType {
  value: string;
}

export interface Users {
  activated: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  interface_identifier: string;
  interface_type: string;
}

export interface VoucherCertifications {
  certificate_url_pointer: string;
  certifier: number;
  certifier_weight: Numeric;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  voucher: number;
}

export interface VoucherIssuers {
  active: Generated<boolean | null>;
  backer: number;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  voucher: number;
}

export interface Vouchers {
  active: Generated<boolean | null>;
  contract_version: string | null;
  created_at: Generated<Timestamp>;
  geo: Point | null;
  id: Generated<number>;
  internal: Generated<boolean | null>;
  location_name: string | null;
  radius: number | null;
  sink_address: string;
  symbol: string;
  voucher_address: string;
  voucher_description: string;
  voucher_email: string | null;
  voucher_name: string;
  voucher_type: string;
  voucher_uoa: string;
  voucher_value: number;
  voucher_website: string | null;
}

export interface VoucherType {
  value: string;
}

export interface Vpa {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  linked_account: number;
  vpa: string;
}

export interface DB {
  account_role_type: AccountRoleType;
  account_type: AccountType;
  accounts: Accounts;
  commodity_listings: CommodityListings;
  commodity_type: CommodityType;
  gas_gift_status_type: GasGiftStatusType;
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
  voucher_type: VoucherType;
  vouchers: Vouchers;
  vpa: Vpa;
}
