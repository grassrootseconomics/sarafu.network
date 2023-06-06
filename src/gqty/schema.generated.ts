/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  bigint: any;
  float8: any;
  numeric: any;
  point: any;
  timestamp: any;
}

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export interface Boolean_comparison_exp {
  _eq?: InputMaybe<Scalars["Boolean"]>;
  _gt?: InputMaybe<Scalars["Boolean"]>;
  _gte?: InputMaybe<Scalars["Boolean"]>;
  _in?: InputMaybe<Array<Scalars["Boolean"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["Boolean"]>;
  _lte?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<Scalars["Boolean"]>;
  _nin?: InputMaybe<Array<Scalars["Boolean"]>>;
}

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export interface Int_comparison_exp {
  _eq?: InputMaybe<Scalars["Int"]>;
  _gt?: InputMaybe<Scalars["Int"]>;
  _gte?: InputMaybe<Scalars["Int"]>;
  _in?: InputMaybe<Array<Scalars["Int"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["Int"]>;
  _lte?: InputMaybe<Scalars["Int"]>;
  _neq?: InputMaybe<Scalars["Int"]>;
  _nin?: InputMaybe<Array<Scalars["Int"]>>;
}

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export interface String_comparison_exp {
  _eq?: InputMaybe<Scalars["String"]>;
  _gt?: InputMaybe<Scalars["String"]>;
  _gte?: InputMaybe<Scalars["String"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["String"]>;
  _in?: InputMaybe<Array<Scalars["String"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["String"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["String"]>;
  _lt?: InputMaybe<Scalars["String"]>;
  _lte?: InputMaybe<Scalars["String"]>;
  _neq?: InputMaybe<Scalars["String"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["String"]>;
  _nin?: InputMaybe<Array<Scalars["String"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["String"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["String"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["String"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["String"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["String"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["String"]>;
}

/** Boolean expression to filter rows from the table "account_type". All fields are combined with a logical 'AND'. */
export interface account_type_bool_exp {
  _and?: InputMaybe<Array<account_type_bool_exp>>;
  _not?: InputMaybe<account_type_bool_exp>;
  _or?: InputMaybe<Array<account_type_bool_exp>>;
  accounts?: InputMaybe<accounts_bool_exp>;
  accounts_aggregate?: InputMaybe<accounts_aggregate_bool_exp>;
  value?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "account_type" */
export enum account_type_constraint {
  /** unique or primary key constraint on columns "value" */
  account_type_pkey = "account_type_pkey",
}

export enum account_type_enum {
  CUSTODIAL_BUSINESS = "CUSTODIAL_BUSINESS",
  CUSTODIAL_COMMUNITY = "CUSTODIAL_COMMUNITY",
  CUSTODIAL_PERSONAL = "CUSTODIAL_PERSONAL",
  CUSTODIAL_SYSTEM = "CUSTODIAL_SYSTEM",
  NON_CUSTODIAL_BUSINESS = "NON_CUSTODIAL_BUSINESS",
  NON_CUSTODIAL_COMMUNITY = "NON_CUSTODIAL_COMMUNITY",
  NON_CUSTODIAL_PERSONAL = "NON_CUSTODIAL_PERSONAL",
  NON_CUSTODIAL_SYSTEM = "NON_CUSTODIAL_SYSTEM",
}

/** Boolean expression to compare columns of type "account_type_enum". All fields are combined with logical 'AND'. */
export interface account_type_enum_comparison_exp {
  _eq?: InputMaybe<account_type_enum>;
  _in?: InputMaybe<Array<account_type_enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<account_type_enum>;
  _nin?: InputMaybe<Array<account_type_enum>>;
}

/** input type for inserting data into table "account_type" */
export interface account_type_insert_input {
  accounts?: InputMaybe<accounts_arr_rel_insert_input>;
  value?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "account_type" */
export interface account_type_obj_rel_insert_input {
  data: account_type_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<account_type_on_conflict>;
}

/** on_conflict condition type for table "account_type" */
export interface account_type_on_conflict {
  constraint: account_type_constraint;
  update_columns?: Array<account_type_update_column>;
  where?: InputMaybe<account_type_bool_exp>;
}

/** Ordering options when selecting data from "account_type". */
export interface account_type_order_by {
  accounts_aggregate?: InputMaybe<accounts_aggregate_order_by>;
  value?: InputMaybe<order_by>;
}

/** primary key columns input for table: account_type */
export interface account_type_pk_columns_input {
  value: Scalars["String"];
}

/** select columns of table "account_type" */
export enum account_type_select_column {
  /** column name */
  value = "value",
}

/** input type for updating data in table "account_type" */
export interface account_type_set_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "account_type" */
export interface account_type_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: account_type_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface account_type_stream_cursor_value_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "account_type" */
export enum account_type_update_column {
  /** column name */
  value = "value",
}

export interface account_type_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<account_type_set_input>;
  /** filter the rows which have to be updated */
  where: account_type_bool_exp;
}

export interface accounts_aggregate_bool_exp {
  count?: InputMaybe<accounts_aggregate_bool_exp_count>;
}

export interface accounts_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<accounts_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<accounts_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "accounts" */
export interface accounts_aggregate_order_by {
  avg?: InputMaybe<accounts_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<accounts_max_order_by>;
  min?: InputMaybe<accounts_min_order_by>;
  stddev?: InputMaybe<accounts_stddev_order_by>;
  stddev_pop?: InputMaybe<accounts_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<accounts_stddev_samp_order_by>;
  sum?: InputMaybe<accounts_sum_order_by>;
  var_pop?: InputMaybe<accounts_var_pop_order_by>;
  var_samp?: InputMaybe<accounts_var_samp_order_by>;
  variance?: InputMaybe<accounts_variance_order_by>;
}

/** input type for inserting array relation for remote table "accounts" */
export interface accounts_arr_rel_insert_input {
  data: Array<accounts_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<accounts_on_conflict>;
}

/** order by avg() on columns of table "accounts" */
export interface accounts_avg_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "accounts". All fields are combined with a logical 'AND'. */
export interface accounts_bool_exp {
  _and?: InputMaybe<Array<accounts_bool_exp>>;
  _not?: InputMaybe<accounts_bool_exp>;
  _or?: InputMaybe<Array<accounts_bool_exp>>;
  accountTypeByAccountType?: InputMaybe<account_type_bool_exp>;
  account_type?: InputMaybe<account_type_enum_comparison_exp>;
  blockchain_address?: InputMaybe<String_comparison_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  marketplace?: InputMaybe<marketplaces_bool_exp>;
  services_ratings?: InputMaybe<services_ratings_bool_exp>;
  services_ratings_aggregate?: InputMaybe<services_ratings_aggregate_bool_exp>;
  tills?: InputMaybe<till_bool_exp>;
  tills_aggregate?: InputMaybe<till_aggregate_bool_exp>;
  user?: InputMaybe<users_bool_exp>;
  user_identifier?: InputMaybe<Int_comparison_exp>;
  voucher_backers?: InputMaybe<voucher_issuers_bool_exp>;
  voucher_backers_aggregate?: InputMaybe<voucher_issuers_aggregate_bool_exp>;
  voucher_certifications?: InputMaybe<voucher_certifications_bool_exp>;
  voucher_certifications_aggregate?: InputMaybe<voucher_certifications_aggregate_bool_exp>;
  vpas?: InputMaybe<vpa_bool_exp>;
  vpas_aggregate?: InputMaybe<vpa_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "accounts" */
export enum accounts_constraint {
  /** unique or primary key constraint on columns "blockchain_address" */
  accounts_blockchain_address_key = "accounts_blockchain_address_key",
  /** unique or primary key constraint on columns "id" */
  accounts_pkey = "accounts_pkey",
}

/** input type for incrementing numeric columns in table "accounts" */
export interface accounts_inc_input {
  user_identifier?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "accounts" */
export interface accounts_insert_input {
  accountTypeByAccountType?: InputMaybe<account_type_obj_rel_insert_input>;
  account_type?: InputMaybe<account_type_enum>;
  blockchain_address?: InputMaybe<Scalars["String"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  marketplace?: InputMaybe<marketplaces_obj_rel_insert_input>;
  services_ratings?: InputMaybe<services_ratings_arr_rel_insert_input>;
  tills?: InputMaybe<till_arr_rel_insert_input>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
  voucher_backers?: InputMaybe<voucher_issuers_arr_rel_insert_input>;
  voucher_certifications?: InputMaybe<voucher_certifications_arr_rel_insert_input>;
  vpas?: InputMaybe<vpa_arr_rel_insert_input>;
}

/** order by max() on columns of table "accounts" */
export interface accounts_max_order_by {
  blockchain_address?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** order by min() on columns of table "accounts" */
export interface accounts_min_order_by {
  blockchain_address?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "accounts" */
export interface accounts_obj_rel_insert_input {
  data: accounts_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<accounts_on_conflict>;
}

/** on_conflict condition type for table "accounts" */
export interface accounts_on_conflict {
  constraint: accounts_constraint;
  update_columns?: Array<accounts_update_column>;
  where?: InputMaybe<accounts_bool_exp>;
}

/** Ordering options when selecting data from "accounts". */
export interface accounts_order_by {
  accountTypeByAccountType?: InputMaybe<account_type_order_by>;
  account_type?: InputMaybe<order_by>;
  blockchain_address?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<marketplaces_order_by>;
  services_ratings_aggregate?: InputMaybe<services_ratings_aggregate_order_by>;
  tills_aggregate?: InputMaybe<till_aggregate_order_by>;
  user?: InputMaybe<users_order_by>;
  user_identifier?: InputMaybe<order_by>;
  voucher_backers_aggregate?: InputMaybe<voucher_issuers_aggregate_order_by>;
  voucher_certifications_aggregate?: InputMaybe<voucher_certifications_aggregate_order_by>;
  vpas_aggregate?: InputMaybe<vpa_aggregate_order_by>;
}

/** primary key columns input for table: accounts */
export interface accounts_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "accounts" */
export enum accounts_select_column {
  /** column name */
  account_type = "account_type",
  /** column name */
  blockchain_address = "blockchain_address",
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  user_identifier = "user_identifier",
}

/** input type for updating data in table "accounts" */
export interface accounts_set_input {
  account_type?: InputMaybe<account_type_enum>;
  blockchain_address?: InputMaybe<Scalars["String"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "accounts" */
export interface accounts_stddev_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "accounts" */
export interface accounts_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "accounts" */
export interface accounts_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "accounts" */
export interface accounts_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: accounts_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface accounts_stream_cursor_value_input {
  account_type?: InputMaybe<account_type_enum>;
  blockchain_address?: InputMaybe<Scalars["String"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "accounts" */
export interface accounts_sum_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** update columns of table "accounts" */
export enum accounts_update_column {
  /** column name */
  account_type = "account_type",
  /** column name */
  blockchain_address = "blockchain_address",
  /** column name */
  created_at = "created_at",
  /** column name */
  user_identifier = "user_identifier",
}

export interface accounts_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<accounts_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<accounts_set_input>;
  /** filter the rows which have to be updated */
  where: accounts_bool_exp;
}

/** order by var_pop() on columns of table "accounts" */
export interface accounts_var_pop_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "accounts" */
export interface accounts_var_samp_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "accounts" */
export interface accounts_variance_order_by {
  id?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
}

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export interface bigint_comparison_exp {
  _eq?: InputMaybe<Scalars["bigint"]>;
  _gt?: InputMaybe<Scalars["bigint"]>;
  _gte?: InputMaybe<Scalars["bigint"]>;
  _in?: InputMaybe<Array<Scalars["bigint"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["bigint"]>;
  _lte?: InputMaybe<Scalars["bigint"]>;
  _neq?: InputMaybe<Scalars["bigint"]>;
  _nin?: InputMaybe<Array<Scalars["bigint"]>>;
}

/** ordering argument of a cursor */
export enum cursor_ordering {
  /** ascending ordering of the cursor */
  ASC = "ASC",
  /** descending ordering of the cursor */
  DESC = "DESC",
}

/** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
export interface float8_comparison_exp {
  _eq?: InputMaybe<Scalars["float8"]>;
  _gt?: InputMaybe<Scalars["float8"]>;
  _gte?: InputMaybe<Scalars["float8"]>;
  _in?: InputMaybe<Array<Scalars["float8"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["float8"]>;
  _lte?: InputMaybe<Scalars["float8"]>;
  _neq?: InputMaybe<Scalars["float8"]>;
  _nin?: InputMaybe<Array<Scalars["float8"]>>;
}

/** Boolean expression to filter rows from the table "gender_type". All fields are combined with a logical 'AND'. */
export interface gender_type_bool_exp {
  _and?: InputMaybe<Array<gender_type_bool_exp>>;
  _not?: InputMaybe<gender_type_bool_exp>;
  _or?: InputMaybe<Array<gender_type_bool_exp>>;
  personal_informations?: InputMaybe<personal_information_bool_exp>;
  personal_informations_aggregate?: InputMaybe<personal_information_aggregate_bool_exp>;
  value?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "gender_type" */
export enum gender_type_constraint {
  /** unique or primary key constraint on columns "value" */
  gender_type_pkey = "gender_type_pkey",
}

export enum gender_type_enum {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

/** Boolean expression to compare columns of type "gender_type_enum". All fields are combined with logical 'AND'. */
export interface gender_type_enum_comparison_exp {
  _eq?: InputMaybe<gender_type_enum>;
  _in?: InputMaybe<Array<gender_type_enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<gender_type_enum>;
  _nin?: InputMaybe<Array<gender_type_enum>>;
}

/** input type for inserting data into table "gender_type" */
export interface gender_type_insert_input {
  personal_informations?: InputMaybe<personal_information_arr_rel_insert_input>;
  value?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "gender_type" */
export interface gender_type_obj_rel_insert_input {
  data: gender_type_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<gender_type_on_conflict>;
}

/** on_conflict condition type for table "gender_type" */
export interface gender_type_on_conflict {
  constraint: gender_type_constraint;
  update_columns?: Array<gender_type_update_column>;
  where?: InputMaybe<gender_type_bool_exp>;
}

/** Ordering options when selecting data from "gender_type". */
export interface gender_type_order_by {
  personal_informations_aggregate?: InputMaybe<personal_information_aggregate_order_by>;
  value?: InputMaybe<order_by>;
}

/** primary key columns input for table: gender_type */
export interface gender_type_pk_columns_input {
  value: Scalars["String"];
}

/** select columns of table "gender_type" */
export enum gender_type_select_column {
  /** column name */
  value = "value",
}

/** input type for updating data in table "gender_type" */
export interface gender_type_set_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "gender_type" */
export interface gender_type_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: gender_type_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface gender_type_stream_cursor_value_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "gender_type" */
export enum gender_type_update_column {
  /** column name */
  value = "value",
}

export interface gender_type_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<gender_type_set_input>;
  /** filter the rows which have to be updated */
  where: gender_type_bool_exp;
}

/** Boolean expression to filter rows from the table "interface_type". All fields are combined with a logical 'AND'. */
export interface interface_type_bool_exp {
  _and?: InputMaybe<Array<interface_type_bool_exp>>;
  _not?: InputMaybe<interface_type_bool_exp>;
  _or?: InputMaybe<Array<interface_type_bool_exp>>;
  users?: InputMaybe<users_bool_exp>;
  users_aggregate?: InputMaybe<users_aggregate_bool_exp>;
  value?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "interface_type" */
export enum interface_type_constraint {
  /** unique or primary key constraint on columns "value" */
  interface_type_pkey = "interface_type_pkey",
}

export enum interface_type_enum {
  APP = "APP",
  TELEGRAM = "TELEGRAM",
  USSD = "USSD",
}

/** Boolean expression to compare columns of type "interface_type_enum". All fields are combined with logical 'AND'. */
export interface interface_type_enum_comparison_exp {
  _eq?: InputMaybe<interface_type_enum>;
  _in?: InputMaybe<Array<interface_type_enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<interface_type_enum>;
  _nin?: InputMaybe<Array<interface_type_enum>>;
}

/** input type for inserting data into table "interface_type" */
export interface interface_type_insert_input {
  users?: InputMaybe<users_arr_rel_insert_input>;
  value?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "interface_type" */
export interface interface_type_obj_rel_insert_input {
  data: interface_type_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<interface_type_on_conflict>;
}

/** on_conflict condition type for table "interface_type" */
export interface interface_type_on_conflict {
  constraint: interface_type_constraint;
  update_columns?: Array<interface_type_update_column>;
  where?: InputMaybe<interface_type_bool_exp>;
}

/** Ordering options when selecting data from "interface_type". */
export interface interface_type_order_by {
  users_aggregate?: InputMaybe<users_aggregate_order_by>;
  value?: InputMaybe<order_by>;
}

/** primary key columns input for table: interface_type */
export interface interface_type_pk_columns_input {
  value: Scalars["String"];
}

/** select columns of table "interface_type" */
export enum interface_type_select_column {
  /** column name */
  value = "value",
}

/** input type for updating data in table "interface_type" */
export interface interface_type_set_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "interface_type" */
export interface interface_type_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: interface_type_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface interface_type_stream_cursor_value_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "interface_type" */
export enum interface_type_update_column {
  /** column name */
  value = "value",
}

export interface interface_type_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<interface_type_set_input>;
  /** filter the rows which have to be updated */
  where: interface_type_bool_exp;
}

/** Boolean expression to filter rows from the table "marketplaces". All fields are combined with a logical 'AND'. */
export interface marketplaces_bool_exp {
  _and?: InputMaybe<Array<marketplaces_bool_exp>>;
  _not?: InputMaybe<marketplaces_bool_exp>;
  _or?: InputMaybe<Array<marketplaces_bool_exp>>;
  account?: InputMaybe<Int_comparison_exp>;
  accountByAccount?: InputMaybe<accounts_bool_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  marketplace_name?: InputMaybe<String_comparison_exp>;
  services?: InputMaybe<services_bool_exp>;
  services_aggregate?: InputMaybe<services_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "marketplaces" */
export enum marketplaces_constraint {
  /** unique or primary key constraint on columns "account" */
  marketplaces_account_key = "marketplaces_account_key",
  /** unique or primary key constraint on columns "id" */
  marketplaces_pkey = "marketplaces_pkey",
}

/** input type for incrementing numeric columns in table "marketplaces" */
export interface marketplaces_inc_input {
  account?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "marketplaces" */
export interface marketplaces_insert_input {
  account?: InputMaybe<Scalars["Int"]>;
  accountByAccount?: InputMaybe<accounts_obj_rel_insert_input>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  marketplace_name?: InputMaybe<Scalars["String"]>;
  services?: InputMaybe<services_arr_rel_insert_input>;
}

/** input type for inserting object relation for remote table "marketplaces" */
export interface marketplaces_obj_rel_insert_input {
  data: marketplaces_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<marketplaces_on_conflict>;
}

/** on_conflict condition type for table "marketplaces" */
export interface marketplaces_on_conflict {
  constraint: marketplaces_constraint;
  update_columns?: Array<marketplaces_update_column>;
  where?: InputMaybe<marketplaces_bool_exp>;
}

/** Ordering options when selecting data from "marketplaces". */
export interface marketplaces_order_by {
  account?: InputMaybe<order_by>;
  accountByAccount?: InputMaybe<accounts_order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  marketplace_name?: InputMaybe<order_by>;
  services_aggregate?: InputMaybe<services_aggregate_order_by>;
}

/** primary key columns input for table: marketplaces */
export interface marketplaces_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "marketplaces" */
export enum marketplaces_select_column {
  /** column name */
  account = "account",
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  marketplace_name = "marketplace_name",
}

/** input type for updating data in table "marketplaces" */
export interface marketplaces_set_input {
  account?: InputMaybe<Scalars["Int"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  marketplace_name?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "marketplaces" */
export interface marketplaces_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: marketplaces_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface marketplaces_stream_cursor_value_input {
  account?: InputMaybe<Scalars["Int"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  marketplace_name?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "marketplaces" */
export enum marketplaces_update_column {
  /** column name */
  account = "account",
  /** column name */
  created_at = "created_at",
  /** column name */
  marketplace_name = "marketplace_name",
}

export interface marketplaces_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<marketplaces_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<marketplaces_set_input>;
  /** filter the rows which have to be updated */
  where: marketplaces_bool_exp;
}

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export interface numeric_comparison_exp {
  _eq?: InputMaybe<Scalars["numeric"]>;
  _gt?: InputMaybe<Scalars["numeric"]>;
  _gte?: InputMaybe<Scalars["numeric"]>;
  _in?: InputMaybe<Array<Scalars["numeric"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["numeric"]>;
  _lte?: InputMaybe<Scalars["numeric"]>;
  _neq?: InputMaybe<Scalars["numeric"]>;
  _nin?: InputMaybe<Array<Scalars["numeric"]>>;
}

/** column ordering options */
export enum order_by {
  /** in ascending order, nulls last */
  asc = "asc",
  /** in ascending order, nulls first */
  asc_nulls_first = "asc_nulls_first",
  /** in ascending order, nulls last */
  asc_nulls_last = "asc_nulls_last",
  /** in descending order, nulls first */
  desc = "desc",
  /** in descending order, nulls first */
  desc_nulls_first = "desc_nulls_first",
  /** in descending order, nulls last */
  desc_nulls_last = "desc_nulls_last",
}

export interface personal_information_aggregate_bool_exp {
  count?: InputMaybe<personal_information_aggregate_bool_exp_count>;
}

export interface personal_information_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<personal_information_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<personal_information_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "personal_information" */
export interface personal_information_aggregate_order_by {
  avg?: InputMaybe<personal_information_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<personal_information_max_order_by>;
  min?: InputMaybe<personal_information_min_order_by>;
  stddev?: InputMaybe<personal_information_stddev_order_by>;
  stddev_pop?: InputMaybe<personal_information_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<personal_information_stddev_samp_order_by>;
  sum?: InputMaybe<personal_information_sum_order_by>;
  var_pop?: InputMaybe<personal_information_var_pop_order_by>;
  var_samp?: InputMaybe<personal_information_var_samp_order_by>;
  variance?: InputMaybe<personal_information_variance_order_by>;
}

/** input type for inserting array relation for remote table "personal_information" */
export interface personal_information_arr_rel_insert_input {
  data: Array<personal_information_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<personal_information_on_conflict>;
}

/** order by avg() on columns of table "personal_information" */
export interface personal_information_avg_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "personal_information". All fields are combined with a logical 'AND'. */
export interface personal_information_bool_exp {
  _and?: InputMaybe<Array<personal_information_bool_exp>>;
  _not?: InputMaybe<personal_information_bool_exp>;
  _or?: InputMaybe<Array<personal_information_bool_exp>>;
  family_name?: InputMaybe<String_comparison_exp>;
  gender?: InputMaybe<gender_type_enum_comparison_exp>;
  gender_type?: InputMaybe<gender_type_bool_exp>;
  geo?: InputMaybe<point_comparison_exp>;
  given_names?: InputMaybe<String_comparison_exp>;
  language_code?: InputMaybe<String_comparison_exp>;
  location_name?: InputMaybe<String_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
  user_identifier?: InputMaybe<Int_comparison_exp>;
  year_of_birth?: InputMaybe<Int_comparison_exp>;
}

/** unique or primary key constraints on table "personal_information" */
export enum personal_information_constraint {
  /** unique or primary key constraint on columns "user_identifier" */
  personal_information_user_identifier_key = "personal_information_user_identifier_key",
}

/** input type for incrementing numeric columns in table "personal_information" */
export interface personal_information_inc_input {
  user_identifier?: InputMaybe<Scalars["Int"]>;
  year_of_birth?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "personal_information" */
export interface personal_information_insert_input {
  family_name?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<gender_type_enum>;
  gender_type?: InputMaybe<gender_type_obj_rel_insert_input>;
  geo?: InputMaybe<Scalars["point"]>;
  given_names?: InputMaybe<Scalars["String"]>;
  language_code?: InputMaybe<Scalars["String"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
  year_of_birth?: InputMaybe<Scalars["Int"]>;
}

/** order by max() on columns of table "personal_information" */
export interface personal_information_max_order_by {
  family_name?: InputMaybe<order_by>;
  given_names?: InputMaybe<order_by>;
  language_code?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** order by min() on columns of table "personal_information" */
export interface personal_information_min_order_by {
  family_name?: InputMaybe<order_by>;
  given_names?: InputMaybe<order_by>;
  language_code?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "personal_information" */
export interface personal_information_obj_rel_insert_input {
  data: personal_information_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<personal_information_on_conflict>;
}

/** on_conflict condition type for table "personal_information" */
export interface personal_information_on_conflict {
  constraint: personal_information_constraint;
  update_columns?: Array<personal_information_update_column>;
  where?: InputMaybe<personal_information_bool_exp>;
}

/** Ordering options when selecting data from "personal_information". */
export interface personal_information_order_by {
  family_name?: InputMaybe<order_by>;
  gender?: InputMaybe<order_by>;
  gender_type?: InputMaybe<gender_type_order_by>;
  geo?: InputMaybe<order_by>;
  given_names?: InputMaybe<order_by>;
  language_code?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** select columns of table "personal_information" */
export enum personal_information_select_column {
  /** column name */
  family_name = "family_name",
  /** column name */
  gender = "gender",
  /** column name */
  geo = "geo",
  /** column name */
  given_names = "given_names",
  /** column name */
  language_code = "language_code",
  /** column name */
  location_name = "location_name",
  /** column name */
  user_identifier = "user_identifier",
  /** column name */
  year_of_birth = "year_of_birth",
}

/** input type for updating data in table "personal_information" */
export interface personal_information_set_input {
  family_name?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<gender_type_enum>;
  geo?: InputMaybe<Scalars["point"]>;
  given_names?: InputMaybe<Scalars["String"]>;
  language_code?: InputMaybe<Scalars["String"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
  year_of_birth?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "personal_information" */
export interface personal_information_stddev_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "personal_information" */
export interface personal_information_stddev_pop_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "personal_information" */
export interface personal_information_stddev_samp_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "personal_information" */
export interface personal_information_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: personal_information_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface personal_information_stream_cursor_value_input {
  family_name?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<gender_type_enum>;
  geo?: InputMaybe<Scalars["point"]>;
  given_names?: InputMaybe<Scalars["String"]>;
  language_code?: InputMaybe<Scalars["String"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  user_identifier?: InputMaybe<Scalars["Int"]>;
  year_of_birth?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "personal_information" */
export interface personal_information_sum_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** update columns of table "personal_information" */
export enum personal_information_update_column {
  /** column name */
  family_name = "family_name",
  /** column name */
  gender = "gender",
  /** column name */
  geo = "geo",
  /** column name */
  given_names = "given_names",
  /** column name */
  language_code = "language_code",
  /** column name */
  location_name = "location_name",
  /** column name */
  user_identifier = "user_identifier",
  /** column name */
  year_of_birth = "year_of_birth",
}

export interface personal_information_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<personal_information_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<personal_information_set_input>;
  /** filter the rows which have to be updated */
  where: personal_information_bool_exp;
}

/** order by var_pop() on columns of table "personal_information" */
export interface personal_information_var_pop_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "personal_information" */
export interface personal_information_var_samp_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "personal_information" */
export interface personal_information_variance_order_by {
  user_identifier?: InputMaybe<order_by>;
  year_of_birth?: InputMaybe<order_by>;
}

/** Boolean expression to compare columns of type "point". All fields are combined with logical 'AND'. */
export interface point_comparison_exp {
  _eq?: InputMaybe<Scalars["point"]>;
  _gt?: InputMaybe<Scalars["point"]>;
  _gte?: InputMaybe<Scalars["point"]>;
  _in?: InputMaybe<Array<Scalars["point"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["point"]>;
  _lte?: InputMaybe<Scalars["point"]>;
  _neq?: InputMaybe<Scalars["point"]>;
  _nin?: InputMaybe<Array<Scalars["point"]>>;
}

export interface service_accepted_payment_aggregate_bool_exp {
  avg?: InputMaybe<service_accepted_payment_aggregate_bool_exp_avg>;
  corr?: InputMaybe<service_accepted_payment_aggregate_bool_exp_corr>;
  count?: InputMaybe<service_accepted_payment_aggregate_bool_exp_count>;
  covar_samp?: InputMaybe<service_accepted_payment_aggregate_bool_exp_covar_samp>;
  max?: InputMaybe<service_accepted_payment_aggregate_bool_exp_max>;
  min?: InputMaybe<service_accepted_payment_aggregate_bool_exp_min>;
  stddev_samp?: InputMaybe<service_accepted_payment_aggregate_bool_exp_stddev_samp>;
  sum?: InputMaybe<service_accepted_payment_aggregate_bool_exp_sum>;
  var_samp?: InputMaybe<service_accepted_payment_aggregate_bool_exp_var_samp>;
}

export interface service_accepted_payment_aggregate_bool_exp_avg {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_corr {
  arguments: service_accepted_payment_aggregate_bool_exp_corr_arguments;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_corr_arguments {
  X: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns;
  Y: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns;
}

export interface service_accepted_payment_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<service_accepted_payment_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: Int_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_covar_samp {
  arguments: service_accepted_payment_aggregate_bool_exp_covar_samp_arguments;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_covar_samp_arguments {
  X: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns;
  Y: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns;
}

export interface service_accepted_payment_aggregate_bool_exp_max {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_min {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_stddev_samp {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_sum {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

export interface service_accepted_payment_aggregate_bool_exp_var_samp {
  arguments: service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<service_accepted_payment_bool_exp>;
  predicate: float8_comparison_exp;
}

/** order by aggregate values of table "service_accepted_payment" */
export interface service_accepted_payment_aggregate_order_by {
  avg?: InputMaybe<service_accepted_payment_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<service_accepted_payment_max_order_by>;
  min?: InputMaybe<service_accepted_payment_min_order_by>;
  stddev?: InputMaybe<service_accepted_payment_stddev_order_by>;
  stddev_pop?: InputMaybe<service_accepted_payment_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<service_accepted_payment_stddev_samp_order_by>;
  sum?: InputMaybe<service_accepted_payment_sum_order_by>;
  var_pop?: InputMaybe<service_accepted_payment_var_pop_order_by>;
  var_samp?: InputMaybe<service_accepted_payment_var_samp_order_by>;
  variance?: InputMaybe<service_accepted_payment_variance_order_by>;
}

/** input type for inserting array relation for remote table "service_accepted_payment" */
export interface service_accepted_payment_arr_rel_insert_input {
  data: Array<service_accepted_payment_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<service_accepted_payment_on_conflict>;
}

/** order by avg() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_avg_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "service_accepted_payment". All fields are combined with a logical 'AND'. */
export interface service_accepted_payment_bool_exp {
  _and?: InputMaybe<Array<service_accepted_payment_bool_exp>>;
  _not?: InputMaybe<service_accepted_payment_bool_exp>;
  _or?: InputMaybe<Array<service_accepted_payment_bool_exp>>;
  id?: InputMaybe<Int_comparison_exp>;
  price?: InputMaybe<float8_comparison_exp>;
  services?: InputMaybe<services_bool_exp>;
  services_aggregate?: InputMaybe<services_aggregate_bool_exp>;
  voucher?: InputMaybe<Int_comparison_exp>;
  voucherByVoucher?: InputMaybe<vouchers_bool_exp>;
}

/** unique or primary key constraints on table "service_accepted_payment" */
export enum service_accepted_payment_constraint {
  /** unique or primary key constraint on columns "id" */
  service_accepted_payment_pkey = "service_accepted_payment_pkey",
}

/** input type for incrementing numeric columns in table "service_accepted_payment" */
export interface service_accepted_payment_inc_input {
  price?: InputMaybe<Scalars["float8"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "service_accepted_payment" */
export interface service_accepted_payment_insert_input {
  price?: InputMaybe<Scalars["float8"]>;
  services?: InputMaybe<services_arr_rel_insert_input>;
  voucher?: InputMaybe<Scalars["Int"]>;
  voucherByVoucher?: InputMaybe<vouchers_obj_rel_insert_input>;
}

/** order by max() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_max_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by min() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_min_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "service_accepted_payment" */
export interface service_accepted_payment_obj_rel_insert_input {
  data: service_accepted_payment_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<service_accepted_payment_on_conflict>;
}

/** on_conflict condition type for table "service_accepted_payment" */
export interface service_accepted_payment_on_conflict {
  constraint: service_accepted_payment_constraint;
  update_columns?: Array<service_accepted_payment_update_column>;
  where?: InputMaybe<service_accepted_payment_bool_exp>;
}

/** Ordering options when selecting data from "service_accepted_payment". */
export interface service_accepted_payment_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  services_aggregate?: InputMaybe<services_aggregate_order_by>;
  voucher?: InputMaybe<order_by>;
  voucherByVoucher?: InputMaybe<vouchers_order_by>;
}

/** primary key columns input for table: service_accepted_payment */
export interface service_accepted_payment_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column {
  /** column name */
  id = "id",
  /** column name */
  price = "price",
  /** column name */
  voucher = "voucher",
}

/** select "service_accepted_payment_aggregate_bool_exp_avg_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_corr_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_max_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_min_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_sum_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns {
  /** column name */
  price = "price",
}

/** select "service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns" columns of table "service_accepted_payment" */
export enum service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns {
  /** column name */
  price = "price",
}

/** input type for updating data in table "service_accepted_payment" */
export interface service_accepted_payment_set_input {
  price?: InputMaybe<Scalars["float8"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_stddev_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "service_accepted_payment" */
export interface service_accepted_payment_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: service_accepted_payment_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface service_accepted_payment_stream_cursor_value_input {
  id?: InputMaybe<Scalars["Int"]>;
  price?: InputMaybe<Scalars["float8"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_sum_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** update columns of table "service_accepted_payment" */
export enum service_accepted_payment_update_column {
  /** column name */
  price = "price",
  /** column name */
  voucher = "voucher",
}

export interface service_accepted_payment_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<service_accepted_payment_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<service_accepted_payment_set_input>;
  /** filter the rows which have to be updated */
  where: service_accepted_payment_bool_exp;
}

/** order by var_pop() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_var_pop_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_var_samp_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "service_accepted_payment" */
export interface service_accepted_payment_variance_order_by {
  id?: InputMaybe<order_by>;
  price?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "service_type". All fields are combined with a logical 'AND'. */
export interface service_type_bool_exp {
  _and?: InputMaybe<Array<service_type_bool_exp>>;
  _not?: InputMaybe<service_type_bool_exp>;
  _or?: InputMaybe<Array<service_type_bool_exp>>;
  services?: InputMaybe<services_bool_exp>;
  services_aggregate?: InputMaybe<services_aggregate_bool_exp>;
  value?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "service_type" */
export enum service_type_constraint {
  /** unique or primary key constraint on columns "value" */
  service_type_pkey = "service_type_pkey",
}

export enum service_type_enum {
  OFFER = "OFFER",
  WANT = "WANT",
}

/** Boolean expression to compare columns of type "service_type_enum". All fields are combined with logical 'AND'. */
export interface service_type_enum_comparison_exp {
  _eq?: InputMaybe<service_type_enum>;
  _in?: InputMaybe<Array<service_type_enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<service_type_enum>;
  _nin?: InputMaybe<Array<service_type_enum>>;
}

/** input type for inserting data into table "service_type" */
export interface service_type_insert_input {
  services?: InputMaybe<services_arr_rel_insert_input>;
  value?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "service_type" */
export interface service_type_obj_rel_insert_input {
  data: service_type_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<service_type_on_conflict>;
}

/** on_conflict condition type for table "service_type" */
export interface service_type_on_conflict {
  constraint: service_type_constraint;
  update_columns?: Array<service_type_update_column>;
  where?: InputMaybe<service_type_bool_exp>;
}

/** Ordering options when selecting data from "service_type". */
export interface service_type_order_by {
  services_aggregate?: InputMaybe<services_aggregate_order_by>;
  value?: InputMaybe<order_by>;
}

/** primary key columns input for table: service_type */
export interface service_type_pk_columns_input {
  value: Scalars["String"];
}

/** select columns of table "service_type" */
export enum service_type_select_column {
  /** column name */
  value = "value",
}

/** input type for updating data in table "service_type" */
export interface service_type_set_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "service_type" */
export interface service_type_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: service_type_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface service_type_stream_cursor_value_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "service_type" */
export enum service_type_update_column {
  /** column name */
  value = "value",
}

export interface service_type_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<service_type_set_input>;
  /** filter the rows which have to be updated */
  where: service_type_bool_exp;
}

export interface services_aggregate_bool_exp {
  bool_and?: InputMaybe<services_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<services_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<services_aggregate_bool_exp_count>;
}

export interface services_aggregate_bool_exp_bool_and {
  arguments: services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<services_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface services_aggregate_bool_exp_bool_or {
  arguments: services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<services_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface services_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<services_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<services_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "services" */
export interface services_aggregate_order_by {
  avg?: InputMaybe<services_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<services_max_order_by>;
  min?: InputMaybe<services_min_order_by>;
  stddev?: InputMaybe<services_stddev_order_by>;
  stddev_pop?: InputMaybe<services_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<services_stddev_samp_order_by>;
  sum?: InputMaybe<services_sum_order_by>;
  var_pop?: InputMaybe<services_var_pop_order_by>;
  var_samp?: InputMaybe<services_var_samp_order_by>;
  variance?: InputMaybe<services_variance_order_by>;
}

/** input type for inserting array relation for remote table "services" */
export interface services_arr_rel_insert_input {
  data: Array<services_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<services_on_conflict>;
}

/** order by avg() on columns of table "services" */
export interface services_avg_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "services". All fields are combined with a logical 'AND'. */
export interface services_bool_exp {
  _and?: InputMaybe<Array<services_bool_exp>>;
  _not?: InputMaybe<services_bool_exp>;
  _or?: InputMaybe<Array<services_bool_exp>>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  geo?: InputMaybe<point_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  location_name?: InputMaybe<String_comparison_exp>;
  marketplace?: InputMaybe<Int_comparison_exp>;
  marketplaceByMarketplace?: InputMaybe<marketplaces_bool_exp>;
  serviceAcceptedPaymentByServiceAcceptedPayment?: InputMaybe<service_accepted_payment_bool_exp>;
  serviceTypeByServiceType?: InputMaybe<service_type_bool_exp>;
  service_accepted_payment?: InputMaybe<Int_comparison_exp>;
  service_available?: InputMaybe<Boolean_comparison_exp>;
  service_description?: InputMaybe<String_comparison_exp>;
  service_type?: InputMaybe<service_type_enum_comparison_exp>;
  services_images?: InputMaybe<services_images_bool_exp>;
  services_images_aggregate?: InputMaybe<services_images_aggregate_bool_exp>;
  services_ratings?: InputMaybe<services_ratings_bool_exp>;
  services_ratings_aggregate?: InputMaybe<services_ratings_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "services" */
export enum services_constraint {
  /** unique or primary key constraint on columns "id" */
  services_pkey = "services_pkey",
}

export interface services_images_aggregate_bool_exp {
  count?: InputMaybe<services_images_aggregate_bool_exp_count>;
}

export interface services_images_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<services_images_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<services_images_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "services_images" */
export interface services_images_aggregate_order_by {
  avg?: InputMaybe<services_images_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<services_images_max_order_by>;
  min?: InputMaybe<services_images_min_order_by>;
  stddev?: InputMaybe<services_images_stddev_order_by>;
  stddev_pop?: InputMaybe<services_images_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<services_images_stddev_samp_order_by>;
  sum?: InputMaybe<services_images_sum_order_by>;
  var_pop?: InputMaybe<services_images_var_pop_order_by>;
  var_samp?: InputMaybe<services_images_var_samp_order_by>;
  variance?: InputMaybe<services_images_variance_order_by>;
}

/** input type for inserting array relation for remote table "services_images" */
export interface services_images_arr_rel_insert_input {
  data: Array<services_images_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<services_images_on_conflict>;
}

/** order by avg() on columns of table "services_images" */
export interface services_images_avg_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "services_images". All fields are combined with a logical 'AND'. */
export interface services_images_bool_exp {
  _and?: InputMaybe<Array<services_images_bool_exp>>;
  _not?: InputMaybe<services_images_bool_exp>;
  _or?: InputMaybe<Array<services_images_bool_exp>>;
  id?: InputMaybe<Int_comparison_exp>;
  service?: InputMaybe<services_bool_exp>;
  service_id?: InputMaybe<Int_comparison_exp>;
  url_pointer?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "services_images" */
export enum services_images_constraint {
  /** unique or primary key constraint on columns "id" */
  services_images_pkey = "services_images_pkey",
}

/** input type for incrementing numeric columns in table "services_images" */
export interface services_images_inc_input {
  service_id?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "services_images" */
export interface services_images_insert_input {
  service?: InputMaybe<services_obj_rel_insert_input>;
  service_id?: InputMaybe<Scalars["Int"]>;
  url_pointer?: InputMaybe<Scalars["String"]>;
}

/** order by max() on columns of table "services_images" */
export interface services_images_max_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
  url_pointer?: InputMaybe<order_by>;
}

/** order by min() on columns of table "services_images" */
export interface services_images_min_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
  url_pointer?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "services_images" */
export interface services_images_on_conflict {
  constraint: services_images_constraint;
  update_columns?: Array<services_images_update_column>;
  where?: InputMaybe<services_images_bool_exp>;
}

/** Ordering options when selecting data from "services_images". */
export interface services_images_order_by {
  id?: InputMaybe<order_by>;
  service?: InputMaybe<services_order_by>;
  service_id?: InputMaybe<order_by>;
  url_pointer?: InputMaybe<order_by>;
}

/** primary key columns input for table: services_images */
export interface services_images_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "services_images" */
export enum services_images_select_column {
  /** column name */
  id = "id",
  /** column name */
  service_id = "service_id",
  /** column name */
  url_pointer = "url_pointer",
}

/** input type for updating data in table "services_images" */
export interface services_images_set_input {
  service_id?: InputMaybe<Scalars["Int"]>;
  url_pointer?: InputMaybe<Scalars["String"]>;
}

/** order by stddev() on columns of table "services_images" */
export interface services_images_stddev_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "services_images" */
export interface services_images_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "services_images" */
export interface services_images_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "services_images" */
export interface services_images_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: services_images_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface services_images_stream_cursor_value_input {
  id?: InputMaybe<Scalars["Int"]>;
  service_id?: InputMaybe<Scalars["Int"]>;
  url_pointer?: InputMaybe<Scalars["String"]>;
}

/** order by sum() on columns of table "services_images" */
export interface services_images_sum_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** update columns of table "services_images" */
export enum services_images_update_column {
  /** column name */
  service_id = "service_id",
  /** column name */
  url_pointer = "url_pointer",
}

export interface services_images_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<services_images_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<services_images_set_input>;
  /** filter the rows which have to be updated */
  where: services_images_bool_exp;
}

/** order by var_pop() on columns of table "services_images" */
export interface services_images_var_pop_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "services_images" */
export interface services_images_var_samp_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "services_images" */
export interface services_images_variance_order_by {
  id?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** input type for incrementing numeric columns in table "services" */
export interface services_inc_input {
  marketplace?: InputMaybe<Scalars["Int"]>;
  service_accepted_payment?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "services" */
export interface services_insert_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  geo?: InputMaybe<Scalars["point"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  marketplace?: InputMaybe<Scalars["Int"]>;
  marketplaceByMarketplace?: InputMaybe<marketplaces_obj_rel_insert_input>;
  serviceAcceptedPaymentByServiceAcceptedPayment?: InputMaybe<service_accepted_payment_obj_rel_insert_input>;
  serviceTypeByServiceType?: InputMaybe<service_type_obj_rel_insert_input>;
  service_accepted_payment?: InputMaybe<Scalars["Int"]>;
  service_available?: InputMaybe<Scalars["Boolean"]>;
  service_description?: InputMaybe<Scalars["String"]>;
  service_type?: InputMaybe<service_type_enum>;
  services_images?: InputMaybe<services_images_arr_rel_insert_input>;
  services_ratings?: InputMaybe<services_ratings_arr_rel_insert_input>;
}

/** order by max() on columns of table "services" */
export interface services_max_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
  service_description?: InputMaybe<order_by>;
}

/** order by min() on columns of table "services" */
export interface services_min_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
  service_description?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "services" */
export interface services_obj_rel_insert_input {
  data: services_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<services_on_conflict>;
}

/** on_conflict condition type for table "services" */
export interface services_on_conflict {
  constraint: services_constraint;
  update_columns?: Array<services_update_column>;
  where?: InputMaybe<services_bool_exp>;
}

/** Ordering options when selecting data from "services". */
export interface services_order_by {
  created_at?: InputMaybe<order_by>;
  geo?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  marketplaceByMarketplace?: InputMaybe<marketplaces_order_by>;
  serviceAcceptedPaymentByServiceAcceptedPayment?: InputMaybe<service_accepted_payment_order_by>;
  serviceTypeByServiceType?: InputMaybe<service_type_order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
  service_available?: InputMaybe<order_by>;
  service_description?: InputMaybe<order_by>;
  service_type?: InputMaybe<order_by>;
  services_images_aggregate?: InputMaybe<services_images_aggregate_order_by>;
  services_ratings_aggregate?: InputMaybe<services_ratings_aggregate_order_by>;
}

/** primary key columns input for table: services */
export interface services_pk_columns_input {
  id: Scalars["Int"];
}

export interface services_ratings_aggregate_bool_exp {
  count?: InputMaybe<services_ratings_aggregate_bool_exp_count>;
}

export interface services_ratings_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<services_ratings_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<services_ratings_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "services_ratings" */
export interface services_ratings_aggregate_order_by {
  avg?: InputMaybe<services_ratings_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<services_ratings_max_order_by>;
  min?: InputMaybe<services_ratings_min_order_by>;
  stddev?: InputMaybe<services_ratings_stddev_order_by>;
  stddev_pop?: InputMaybe<services_ratings_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<services_ratings_stddev_samp_order_by>;
  sum?: InputMaybe<services_ratings_sum_order_by>;
  var_pop?: InputMaybe<services_ratings_var_pop_order_by>;
  var_samp?: InputMaybe<services_ratings_var_samp_order_by>;
  variance?: InputMaybe<services_ratings_variance_order_by>;
}

/** input type for inserting array relation for remote table "services_ratings" */
export interface services_ratings_arr_rel_insert_input {
  data: Array<services_ratings_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<services_ratings_on_conflict>;
}

/** order by avg() on columns of table "services_ratings" */
export interface services_ratings_avg_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "services_ratings". All fields are combined with a logical 'AND'. */
export interface services_ratings_bool_exp {
  _and?: InputMaybe<Array<services_ratings_bool_exp>>;
  _not?: InputMaybe<services_ratings_bool_exp>;
  _or?: InputMaybe<Array<services_ratings_bool_exp>>;
  account?: InputMaybe<accounts_bool_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  rating_by?: InputMaybe<Int_comparison_exp>;
  score?: InputMaybe<Int_comparison_exp>;
  service?: InputMaybe<services_bool_exp>;
  service_id?: InputMaybe<Int_comparison_exp>;
}

/** unique or primary key constraints on table "services_ratings" */
export enum services_ratings_constraint {
  /** unique or primary key constraint on columns "id" */
  services_ratings_pkey = "services_ratings_pkey",
}

/** input type for incrementing numeric columns in table "services_ratings" */
export interface services_ratings_inc_input {
  rating_by?: InputMaybe<Scalars["Int"]>;
  score?: InputMaybe<Scalars["Int"]>;
  service_id?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "services_ratings" */
export interface services_ratings_insert_input {
  account?: InputMaybe<accounts_obj_rel_insert_input>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  rating_by?: InputMaybe<Scalars["Int"]>;
  score?: InputMaybe<Scalars["Int"]>;
  service?: InputMaybe<services_obj_rel_insert_input>;
  service_id?: InputMaybe<Scalars["Int"]>;
}

/** order by max() on columns of table "services_ratings" */
export interface services_ratings_max_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by min() on columns of table "services_ratings" */
export interface services_ratings_min_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "services_ratings" */
export interface services_ratings_on_conflict {
  constraint: services_ratings_constraint;
  update_columns?: Array<services_ratings_update_column>;
  where?: InputMaybe<services_ratings_bool_exp>;
}

/** Ordering options when selecting data from "services_ratings". */
export interface services_ratings_order_by {
  account?: InputMaybe<accounts_order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service?: InputMaybe<services_order_by>;
  service_id?: InputMaybe<order_by>;
}

/** primary key columns input for table: services_ratings */
export interface services_ratings_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "services_ratings" */
export enum services_ratings_select_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  rating_by = "rating_by",
  /** column name */
  score = "score",
  /** column name */
  service_id = "service_id",
}

/** input type for updating data in table "services_ratings" */
export interface services_ratings_set_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  rating_by?: InputMaybe<Scalars["Int"]>;
  score?: InputMaybe<Scalars["Int"]>;
  service_id?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "services_ratings" */
export interface services_ratings_stddev_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "services_ratings" */
export interface services_ratings_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "services_ratings" */
export interface services_ratings_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "services_ratings" */
export interface services_ratings_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: services_ratings_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface services_ratings_stream_cursor_value_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  rating_by?: InputMaybe<Scalars["Int"]>;
  score?: InputMaybe<Scalars["Int"]>;
  service_id?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "services_ratings" */
export interface services_ratings_sum_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** update columns of table "services_ratings" */
export enum services_ratings_update_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  rating_by = "rating_by",
  /** column name */
  score = "score",
  /** column name */
  service_id = "service_id",
}

export interface services_ratings_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<services_ratings_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<services_ratings_set_input>;
  /** filter the rows which have to be updated */
  where: services_ratings_bool_exp;
}

/** order by var_pop() on columns of table "services_ratings" */
export interface services_ratings_var_pop_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "services_ratings" */
export interface services_ratings_var_samp_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "services_ratings" */
export interface services_ratings_variance_order_by {
  id?: InputMaybe<order_by>;
  rating_by?: InputMaybe<order_by>;
  score?: InputMaybe<order_by>;
  service_id?: InputMaybe<order_by>;
}

/** select columns of table "services" */
export enum services_select_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  geo = "geo",
  /** column name */
  id = "id",
  /** column name */
  location_name = "location_name",
  /** column name */
  marketplace = "marketplace",
  /** column name */
  service_accepted_payment = "service_accepted_payment",
  /** column name */
  service_available = "service_available",
  /** column name */
  service_description = "service_description",
  /** column name */
  service_type = "service_type",
}

/** select "services_aggregate_bool_exp_bool_and_arguments_columns" columns of table "services" */
export enum services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  service_available = "service_available",
}

/** select "services_aggregate_bool_exp_bool_or_arguments_columns" columns of table "services" */
export enum services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  service_available = "service_available",
}

/** input type for updating data in table "services" */
export interface services_set_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  geo?: InputMaybe<Scalars["point"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  marketplace?: InputMaybe<Scalars["Int"]>;
  service_accepted_payment?: InputMaybe<Scalars["Int"]>;
  service_available?: InputMaybe<Scalars["Boolean"]>;
  service_description?: InputMaybe<Scalars["String"]>;
  service_type?: InputMaybe<service_type_enum>;
}

/** order by stddev() on columns of table "services" */
export interface services_stddev_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "services" */
export interface services_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "services" */
export interface services_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "services" */
export interface services_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: services_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface services_stream_cursor_value_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  geo?: InputMaybe<Scalars["point"]>;
  id?: InputMaybe<Scalars["Int"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  marketplace?: InputMaybe<Scalars["Int"]>;
  service_accepted_payment?: InputMaybe<Scalars["Int"]>;
  service_available?: InputMaybe<Scalars["Boolean"]>;
  service_description?: InputMaybe<Scalars["String"]>;
  service_type?: InputMaybe<service_type_enum>;
}

/** order by sum() on columns of table "services" */
export interface services_sum_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** update columns of table "services" */
export enum services_update_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  geo = "geo",
  /** column name */
  location_name = "location_name",
  /** column name */
  marketplace = "marketplace",
  /** column name */
  service_accepted_payment = "service_accepted_payment",
  /** column name */
  service_available = "service_available",
  /** column name */
  service_description = "service_description",
  /** column name */
  service_type = "service_type",
}

export interface services_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<services_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<services_set_input>;
  /** filter the rows which have to be updated */
  where: services_bool_exp;
}

/** order by var_pop() on columns of table "services" */
export interface services_var_pop_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "services" */
export interface services_var_samp_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "services" */
export interface services_variance_order_by {
  id?: InputMaybe<order_by>;
  marketplace?: InputMaybe<order_by>;
  service_accepted_payment?: InputMaybe<order_by>;
}

export interface till_aggregate_bool_exp {
  count?: InputMaybe<till_aggregate_bool_exp_count>;
}

export interface till_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<till_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<till_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "till" */
export interface till_aggregate_order_by {
  avg?: InputMaybe<till_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<till_max_order_by>;
  min?: InputMaybe<till_min_order_by>;
  stddev?: InputMaybe<till_stddev_order_by>;
  stddev_pop?: InputMaybe<till_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<till_stddev_samp_order_by>;
  sum?: InputMaybe<till_sum_order_by>;
  var_pop?: InputMaybe<till_var_pop_order_by>;
  var_samp?: InputMaybe<till_var_samp_order_by>;
  variance?: InputMaybe<till_variance_order_by>;
}

/** input type for inserting array relation for remote table "till" */
export interface till_arr_rel_insert_input {
  data: Array<till_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<till_on_conflict>;
}

/** order by avg() on columns of table "till" */
export interface till_avg_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "till". All fields are combined with a logical 'AND'. */
export interface till_bool_exp {
  _and?: InputMaybe<Array<till_bool_exp>>;
  _not?: InputMaybe<till_bool_exp>;
  _or?: InputMaybe<Array<till_bool_exp>>;
  account?: InputMaybe<accounts_bool_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  linked_account?: InputMaybe<Int_comparison_exp>;
  till?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "till" */
export enum till_constraint {
  /** unique or primary key constraint on columns "id" */
  till_pkey = "till_pkey",
  /** unique or primary key constraint on columns "till" */
  till_till_key = "till_till_key",
}

/** input type for incrementing numeric columns in table "till" */
export interface till_inc_input {
  linked_account?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "till" */
export interface till_insert_input {
  account?: InputMaybe<accounts_obj_rel_insert_input>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  till?: InputMaybe<Scalars["String"]>;
}

/** order by max() on columns of table "till" */
export interface till_max_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  till?: InputMaybe<order_by>;
}

/** order by min() on columns of table "till" */
export interface till_min_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  till?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "till" */
export interface till_on_conflict {
  constraint: till_constraint;
  update_columns?: Array<till_update_column>;
  where?: InputMaybe<till_bool_exp>;
}

/** Ordering options when selecting data from "till". */
export interface till_order_by {
  account?: InputMaybe<accounts_order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  till?: InputMaybe<order_by>;
}

/** primary key columns input for table: till */
export interface till_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "till" */
export enum till_select_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  linked_account = "linked_account",
  /** column name */
  till = "till",
}

/** input type for updating data in table "till" */
export interface till_set_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  till?: InputMaybe<Scalars["String"]>;
}

/** order by stddev() on columns of table "till" */
export interface till_stddev_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "till" */
export interface till_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "till" */
export interface till_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "till" */
export interface till_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: till_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface till_stream_cursor_value_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  till?: InputMaybe<Scalars["String"]>;
}

/** order by sum() on columns of table "till" */
export interface till_sum_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** update columns of table "till" */
export enum till_update_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  linked_account = "linked_account",
  /** column name */
  till = "till",
}

export interface till_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<till_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<till_set_input>;
  /** filter the rows which have to be updated */
  where: till_bool_exp;
}

/** order by var_pop() on columns of table "till" */
export interface till_var_pop_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "till" */
export interface till_var_samp_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "till" */
export interface till_variance_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export interface timestamp_comparison_exp {
  _eq?: InputMaybe<Scalars["timestamp"]>;
  _gt?: InputMaybe<Scalars["timestamp"]>;
  _gte?: InputMaybe<Scalars["timestamp"]>;
  _in?: InputMaybe<Array<Scalars["timestamp"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _lt?: InputMaybe<Scalars["timestamp"]>;
  _lte?: InputMaybe<Scalars["timestamp"]>;
  _neq?: InputMaybe<Scalars["timestamp"]>;
  _nin?: InputMaybe<Array<Scalars["timestamp"]>>;
}

export interface transactions_aggregate_bool_exp {
  bool_and?: InputMaybe<transactions_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<transactions_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<transactions_aggregate_bool_exp_count>;
}

export interface transactions_aggregate_bool_exp_bool_and {
  arguments: transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<transactions_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface transactions_aggregate_bool_exp_bool_or {
  arguments: transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<transactions_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface transactions_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<transactions_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<transactions_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "transactions" */
export interface transactions_aggregate_order_by {
  avg?: InputMaybe<transactions_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<transactions_max_order_by>;
  min?: InputMaybe<transactions_min_order_by>;
  stddev?: InputMaybe<transactions_stddev_order_by>;
  stddev_pop?: InputMaybe<transactions_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<transactions_stddev_samp_order_by>;
  sum?: InputMaybe<transactions_sum_order_by>;
  var_pop?: InputMaybe<transactions_var_pop_order_by>;
  var_samp?: InputMaybe<transactions_var_samp_order_by>;
  variance?: InputMaybe<transactions_variance_order_by>;
}

/** input type for inserting array relation for remote table "transactions" */
export interface transactions_arr_rel_insert_input {
  data: Array<transactions_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<transactions_on_conflict>;
}

/** order by avg() on columns of table "transactions" */
export interface transactions_avg_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
export interface transactions_bool_exp {
  _and?: InputMaybe<Array<transactions_bool_exp>>;
  _not?: InputMaybe<transactions_bool_exp>;
  _or?: InputMaybe<Array<transactions_bool_exp>>;
  block_number?: InputMaybe<Int_comparison_exp>;
  date_block?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  recipient_address?: InputMaybe<String_comparison_exp>;
  sender_address?: InputMaybe<String_comparison_exp>;
  success?: InputMaybe<Boolean_comparison_exp>;
  txTypeByTxType?: InputMaybe<tx_type_bool_exp>;
  tx_hash?: InputMaybe<String_comparison_exp>;
  tx_index?: InputMaybe<Int_comparison_exp>;
  tx_type?: InputMaybe<tx_type_enum_comparison_exp>;
  tx_value?: InputMaybe<bigint_comparison_exp>;
  voucher?: InputMaybe<vouchers_bool_exp>;
  voucher_address?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "transactions" */
export enum transactions_constraint {
  /** unique or primary key constraint on columns "id" */
  transactions_pkey = "transactions_pkey",
  /** unique or primary key constraint on columns "tx_hash" */
  transactions_tx_hash_key = "transactions_tx_hash_key",
}

/** input type for incrementing numeric columns in table "transactions" */
export interface transactions_inc_input {
  block_number?: InputMaybe<Scalars["Int"]>;
  tx_index?: InputMaybe<Scalars["Int"]>;
  tx_value?: InputMaybe<Scalars["bigint"]>;
}

/** input type for inserting data into table "transactions" */
export interface transactions_insert_input {
  block_number?: InputMaybe<Scalars["Int"]>;
  date_block?: InputMaybe<Scalars["timestamp"]>;
  recipient_address?: InputMaybe<Scalars["String"]>;
  sender_address?: InputMaybe<Scalars["String"]>;
  success?: InputMaybe<Scalars["Boolean"]>;
  txTypeByTxType?: InputMaybe<tx_type_obj_rel_insert_input>;
  tx_hash?: InputMaybe<Scalars["String"]>;
  tx_index?: InputMaybe<Scalars["Int"]>;
  tx_type?: InputMaybe<tx_type_enum>;
  tx_value?: InputMaybe<Scalars["bigint"]>;
  voucher?: InputMaybe<vouchers_obj_rel_insert_input>;
  voucher_address?: InputMaybe<Scalars["String"]>;
}

/** order by max() on columns of table "transactions" */
export interface transactions_max_order_by {
  block_number?: InputMaybe<order_by>;
  date_block?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  recipient_address?: InputMaybe<order_by>;
  sender_address?: InputMaybe<order_by>;
  tx_hash?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
  voucher_address?: InputMaybe<order_by>;
}

/** order by min() on columns of table "transactions" */
export interface transactions_min_order_by {
  block_number?: InputMaybe<order_by>;
  date_block?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  recipient_address?: InputMaybe<order_by>;
  sender_address?: InputMaybe<order_by>;
  tx_hash?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
  voucher_address?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "transactions" */
export interface transactions_on_conflict {
  constraint: transactions_constraint;
  update_columns?: Array<transactions_update_column>;
  where?: InputMaybe<transactions_bool_exp>;
}

/** Ordering options when selecting data from "transactions". */
export interface transactions_order_by {
  block_number?: InputMaybe<order_by>;
  date_block?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  recipient_address?: InputMaybe<order_by>;
  sender_address?: InputMaybe<order_by>;
  success?: InputMaybe<order_by>;
  txTypeByTxType?: InputMaybe<tx_type_order_by>;
  tx_hash?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_type?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
  voucher?: InputMaybe<vouchers_order_by>;
  voucher_address?: InputMaybe<order_by>;
}

/** primary key columns input for table: transactions */
export interface transactions_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "transactions" */
export enum transactions_select_column {
  /** column name */
  block_number = "block_number",
  /** column name */
  date_block = "date_block",
  /** column name */
  id = "id",
  /** column name */
  recipient_address = "recipient_address",
  /** column name */
  sender_address = "sender_address",
  /** column name */
  success = "success",
  /** column name */
  tx_hash = "tx_hash",
  /** column name */
  tx_index = "tx_index",
  /** column name */
  tx_type = "tx_type",
  /** column name */
  tx_value = "tx_value",
  /** column name */
  voucher_address = "voucher_address",
}

/** select "transactions_aggregate_bool_exp_bool_and_arguments_columns" columns of table "transactions" */
export enum transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  success = "success",
}

/** select "transactions_aggregate_bool_exp_bool_or_arguments_columns" columns of table "transactions" */
export enum transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  success = "success",
}

/** input type for updating data in table "transactions" */
export interface transactions_set_input {
  block_number?: InputMaybe<Scalars["Int"]>;
  date_block?: InputMaybe<Scalars["timestamp"]>;
  recipient_address?: InputMaybe<Scalars["String"]>;
  sender_address?: InputMaybe<Scalars["String"]>;
  success?: InputMaybe<Scalars["Boolean"]>;
  tx_hash?: InputMaybe<Scalars["String"]>;
  tx_index?: InputMaybe<Scalars["Int"]>;
  tx_type?: InputMaybe<tx_type_enum>;
  tx_value?: InputMaybe<Scalars["bigint"]>;
  voucher_address?: InputMaybe<Scalars["String"]>;
}

/** order by stddev() on columns of table "transactions" */
export interface transactions_stddev_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "transactions" */
export interface transactions_stddev_pop_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "transactions" */
export interface transactions_stddev_samp_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "transactions" */
export interface transactions_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: transactions_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface transactions_stream_cursor_value_input {
  block_number?: InputMaybe<Scalars["Int"]>;
  date_block?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  recipient_address?: InputMaybe<Scalars["String"]>;
  sender_address?: InputMaybe<Scalars["String"]>;
  success?: InputMaybe<Scalars["Boolean"]>;
  tx_hash?: InputMaybe<Scalars["String"]>;
  tx_index?: InputMaybe<Scalars["Int"]>;
  tx_type?: InputMaybe<tx_type_enum>;
  tx_value?: InputMaybe<Scalars["bigint"]>;
  voucher_address?: InputMaybe<Scalars["String"]>;
}

/** order by sum() on columns of table "transactions" */
export interface transactions_sum_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** update columns of table "transactions" */
export enum transactions_update_column {
  /** column name */
  block_number = "block_number",
  /** column name */
  date_block = "date_block",
  /** column name */
  recipient_address = "recipient_address",
  /** column name */
  sender_address = "sender_address",
  /** column name */
  success = "success",
  /** column name */
  tx_hash = "tx_hash",
  /** column name */
  tx_index = "tx_index",
  /** column name */
  tx_type = "tx_type",
  /** column name */
  tx_value = "tx_value",
  /** column name */
  voucher_address = "voucher_address",
}

export interface transactions_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<transactions_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<transactions_set_input>;
  /** filter the rows which have to be updated */
  where: transactions_bool_exp;
}

/** order by var_pop() on columns of table "transactions" */
export interface transactions_var_pop_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "transactions" */
export interface transactions_var_samp_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "transactions" */
export interface transactions_variance_order_by {
  block_number?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  tx_index?: InputMaybe<order_by>;
  tx_value?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "tx_type". All fields are combined with a logical 'AND'. */
export interface tx_type_bool_exp {
  _and?: InputMaybe<Array<tx_type_bool_exp>>;
  _not?: InputMaybe<tx_type_bool_exp>;
  _or?: InputMaybe<Array<tx_type_bool_exp>>;
  transactions?: InputMaybe<transactions_bool_exp>;
  transactions_aggregate?: InputMaybe<transactions_aggregate_bool_exp>;
  value?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "tx_type" */
export enum tx_type_constraint {
  /** unique or primary key constraint on columns "value" */
  tx_type_pkey = "tx_type_pkey",
}

export enum tx_type_enum {
  MINT_TO = "MINT_TO",
  TRANSFER = "TRANSFER",
  TRANSFER_FROM = "TRANSFER_FROM",
}

/** Boolean expression to compare columns of type "tx_type_enum". All fields are combined with logical 'AND'. */
export interface tx_type_enum_comparison_exp {
  _eq?: InputMaybe<tx_type_enum>;
  _in?: InputMaybe<Array<tx_type_enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]>;
  _neq?: InputMaybe<tx_type_enum>;
  _nin?: InputMaybe<Array<tx_type_enum>>;
}

/** input type for inserting data into table "tx_type" */
export interface tx_type_insert_input {
  transactions?: InputMaybe<transactions_arr_rel_insert_input>;
  value?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "tx_type" */
export interface tx_type_obj_rel_insert_input {
  data: tx_type_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<tx_type_on_conflict>;
}

/** on_conflict condition type for table "tx_type" */
export interface tx_type_on_conflict {
  constraint: tx_type_constraint;
  update_columns?: Array<tx_type_update_column>;
  where?: InputMaybe<tx_type_bool_exp>;
}

/** Ordering options when selecting data from "tx_type". */
export interface tx_type_order_by {
  transactions_aggregate?: InputMaybe<transactions_aggregate_order_by>;
  value?: InputMaybe<order_by>;
}

/** primary key columns input for table: tx_type */
export interface tx_type_pk_columns_input {
  value: Scalars["String"];
}

/** select columns of table "tx_type" */
export enum tx_type_select_column {
  /** column name */
  value = "value",
}

/** input type for updating data in table "tx_type" */
export interface tx_type_set_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "tx_type" */
export interface tx_type_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: tx_type_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface tx_type_stream_cursor_value_input {
  value?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "tx_type" */
export enum tx_type_update_column {
  /** column name */
  value = "value",
}

export interface tx_type_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<tx_type_set_input>;
  /** filter the rows which have to be updated */
  where: tx_type_bool_exp;
}

export interface users_aggregate_bool_exp {
  bool_and?: InputMaybe<users_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<users_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<users_aggregate_bool_exp_count>;
}

export interface users_aggregate_bool_exp_bool_and {
  arguments: users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface users_aggregate_bool_exp_bool_or {
  arguments: users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface users_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<users_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "users" */
export interface users_aggregate_order_by {
  avg?: InputMaybe<users_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<users_max_order_by>;
  min?: InputMaybe<users_min_order_by>;
  stddev?: InputMaybe<users_stddev_order_by>;
  stddev_pop?: InputMaybe<users_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<users_stddev_samp_order_by>;
  sum?: InputMaybe<users_sum_order_by>;
  var_pop?: InputMaybe<users_var_pop_order_by>;
  var_samp?: InputMaybe<users_var_samp_order_by>;
  variance?: InputMaybe<users_variance_order_by>;
}

/** input type for inserting array relation for remote table "users" */
export interface users_arr_rel_insert_input {
  data: Array<users_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<users_on_conflict>;
}

/** order by avg() on columns of table "users" */
export interface users_avg_order_by {
  id?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export interface users_bool_exp {
  _and?: InputMaybe<Array<users_bool_exp>>;
  _not?: InputMaybe<users_bool_exp>;
  _or?: InputMaybe<Array<users_bool_exp>>;
  accounts?: InputMaybe<accounts_bool_exp>;
  accounts_aggregate?: InputMaybe<accounts_aggregate_bool_exp>;
  activated?: InputMaybe<Boolean_comparison_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  interfaceTypeByInterfaceType?: InputMaybe<interface_type_bool_exp>;
  interface_identifier?: InputMaybe<String_comparison_exp>;
  interface_type?: InputMaybe<interface_type_enum_comparison_exp>;
  personal_information?: InputMaybe<personal_information_bool_exp>;
}

/** unique or primary key constraints on table "users" */
export enum users_constraint {
  /** unique or primary key constraint on columns "interface_identifier" */
  users_interface_identifier_key = "users_interface_identifier_key",
  /** unique or primary key constraint on columns "id" */
  users_pkey = "users_pkey",
}

/** input type for inserting data into table "users" */
export interface users_insert_input {
  accounts?: InputMaybe<accounts_arr_rel_insert_input>;
  activated?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  interfaceTypeByInterfaceType?: InputMaybe<interface_type_obj_rel_insert_input>;
  interface_identifier?: InputMaybe<Scalars["String"]>;
  interface_type?: InputMaybe<interface_type_enum>;
  personal_information?: InputMaybe<personal_information_obj_rel_insert_input>;
}

/** order by max() on columns of table "users" */
export interface users_max_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  interface_identifier?: InputMaybe<order_by>;
}

/** order by min() on columns of table "users" */
export interface users_min_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  interface_identifier?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "users" */
export interface users_obj_rel_insert_input {
  data: users_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<users_on_conflict>;
}

/** on_conflict condition type for table "users" */
export interface users_on_conflict {
  constraint: users_constraint;
  update_columns?: Array<users_update_column>;
  where?: InputMaybe<users_bool_exp>;
}

/** Ordering options when selecting data from "users". */
export interface users_order_by {
  accounts_aggregate?: InputMaybe<accounts_aggregate_order_by>;
  activated?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  interfaceTypeByInterfaceType?: InputMaybe<interface_type_order_by>;
  interface_identifier?: InputMaybe<order_by>;
  interface_type?: InputMaybe<order_by>;
  personal_information?: InputMaybe<personal_information_order_by>;
}

/** primary key columns input for table: users */
export interface users_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "users" */
export enum users_select_column {
  /** column name */
  activated = "activated",
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  interface_identifier = "interface_identifier",
  /** column name */
  interface_type = "interface_type",
}

/** select "users_aggregate_bool_exp_bool_and_arguments_columns" columns of table "users" */
export enum users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  activated = "activated",
}

/** select "users_aggregate_bool_exp_bool_or_arguments_columns" columns of table "users" */
export enum users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  activated = "activated",
}

/** input type for updating data in table "users" */
export interface users_set_input {
  activated?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  interface_identifier?: InputMaybe<Scalars["String"]>;
  interface_type?: InputMaybe<interface_type_enum>;
}

/** order by stddev() on columns of table "users" */
export interface users_stddev_order_by {
  id?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "users" */
export interface users_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "users" */
export interface users_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "users" */
export interface users_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: users_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface users_stream_cursor_value_input {
  activated?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  interface_identifier?: InputMaybe<Scalars["String"]>;
  interface_type?: InputMaybe<interface_type_enum>;
}

/** order by sum() on columns of table "users" */
export interface users_sum_order_by {
  id?: InputMaybe<order_by>;
}

/** update columns of table "users" */
export enum users_update_column {
  /** column name */
  activated = "activated",
  /** column name */
  created_at = "created_at",
  /** column name */
  interface_identifier = "interface_identifier",
  /** column name */
  interface_type = "interface_type",
}

export interface users_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<users_set_input>;
  /** filter the rows which have to be updated */
  where: users_bool_exp;
}

/** order by var_pop() on columns of table "users" */
export interface users_var_pop_order_by {
  id?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "users" */
export interface users_var_samp_order_by {
  id?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "users" */
export interface users_variance_order_by {
  id?: InputMaybe<order_by>;
}

export interface voucher_certifications_aggregate_bool_exp {
  count?: InputMaybe<voucher_certifications_aggregate_bool_exp_count>;
}

export interface voucher_certifications_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<voucher_certifications_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<voucher_certifications_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "voucher_certifications" */
export interface voucher_certifications_aggregate_order_by {
  avg?: InputMaybe<voucher_certifications_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<voucher_certifications_max_order_by>;
  min?: InputMaybe<voucher_certifications_min_order_by>;
  stddev?: InputMaybe<voucher_certifications_stddev_order_by>;
  stddev_pop?: InputMaybe<voucher_certifications_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<voucher_certifications_stddev_samp_order_by>;
  sum?: InputMaybe<voucher_certifications_sum_order_by>;
  var_pop?: InputMaybe<voucher_certifications_var_pop_order_by>;
  var_samp?: InputMaybe<voucher_certifications_var_samp_order_by>;
  variance?: InputMaybe<voucher_certifications_variance_order_by>;
}

/** input type for inserting array relation for remote table "voucher_certifications" */
export interface voucher_certifications_arr_rel_insert_input {
  data: Array<voucher_certifications_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<voucher_certifications_on_conflict>;
}

/** order by avg() on columns of table "voucher_certifications" */
export interface voucher_certifications_avg_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "voucher_certifications". All fields are combined with a logical 'AND'. */
export interface voucher_certifications_bool_exp {
  _and?: InputMaybe<Array<voucher_certifications_bool_exp>>;
  _not?: InputMaybe<voucher_certifications_bool_exp>;
  _or?: InputMaybe<Array<voucher_certifications_bool_exp>>;
  account?: InputMaybe<accounts_bool_exp>;
  certificate_url_pointer?: InputMaybe<String_comparison_exp>;
  certifier?: InputMaybe<Int_comparison_exp>;
  certifier_weight?: InputMaybe<numeric_comparison_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  voucher?: InputMaybe<Int_comparison_exp>;
  voucherByVoucher?: InputMaybe<vouchers_bool_exp>;
}

/** unique or primary key constraints on table "voucher_certifications" */
export enum voucher_certifications_constraint {
  /** unique or primary key constraint on columns "id" */
  voucher_certifications_pkey = "voucher_certifications_pkey",
}

/** input type for incrementing numeric columns in table "voucher_certifications" */
export interface voucher_certifications_inc_input {
  certifier?: InputMaybe<Scalars["Int"]>;
  certifier_weight?: InputMaybe<Scalars["numeric"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "voucher_certifications" */
export interface voucher_certifications_insert_input {
  account?: InputMaybe<accounts_obj_rel_insert_input>;
  certificate_url_pointer?: InputMaybe<Scalars["String"]>;
  certifier?: InputMaybe<Scalars["Int"]>;
  certifier_weight?: InputMaybe<Scalars["numeric"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
  voucherByVoucher?: InputMaybe<vouchers_obj_rel_insert_input>;
}

/** order by max() on columns of table "voucher_certifications" */
export interface voucher_certifications_max_order_by {
  certificate_url_pointer?: InputMaybe<order_by>;
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by min() on columns of table "voucher_certifications" */
export interface voucher_certifications_min_order_by {
  certificate_url_pointer?: InputMaybe<order_by>;
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "voucher_certifications" */
export interface voucher_certifications_on_conflict {
  constraint: voucher_certifications_constraint;
  update_columns?: Array<voucher_certifications_update_column>;
  where?: InputMaybe<voucher_certifications_bool_exp>;
}

/** Ordering options when selecting data from "voucher_certifications". */
export interface voucher_certifications_order_by {
  account?: InputMaybe<accounts_order_by>;
  certificate_url_pointer?: InputMaybe<order_by>;
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
  voucherByVoucher?: InputMaybe<vouchers_order_by>;
}

/** primary key columns input for table: voucher_certifications */
export interface voucher_certifications_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "voucher_certifications" */
export enum voucher_certifications_select_column {
  /** column name */
  certificate_url_pointer = "certificate_url_pointer",
  /** column name */
  certifier = "certifier",
  /** column name */
  certifier_weight = "certifier_weight",
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  voucher = "voucher",
}

/** input type for updating data in table "voucher_certifications" */
export interface voucher_certifications_set_input {
  certificate_url_pointer?: InputMaybe<Scalars["String"]>;
  certifier?: InputMaybe<Scalars["Int"]>;
  certifier_weight?: InputMaybe<Scalars["numeric"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "voucher_certifications" */
export interface voucher_certifications_stddev_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "voucher_certifications" */
export interface voucher_certifications_stddev_pop_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "voucher_certifications" */
export interface voucher_certifications_stddev_samp_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "voucher_certifications" */
export interface voucher_certifications_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: voucher_certifications_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface voucher_certifications_stream_cursor_value_input {
  certificate_url_pointer?: InputMaybe<Scalars["String"]>;
  certifier?: InputMaybe<Scalars["Int"]>;
  certifier_weight?: InputMaybe<Scalars["numeric"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "voucher_certifications" */
export interface voucher_certifications_sum_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** update columns of table "voucher_certifications" */
export enum voucher_certifications_update_column {
  /** column name */
  certificate_url_pointer = "certificate_url_pointer",
  /** column name */
  certifier = "certifier",
  /** column name */
  certifier_weight = "certifier_weight",
  /** column name */
  created_at = "created_at",
  /** column name */
  voucher = "voucher",
}

export interface voucher_certifications_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<voucher_certifications_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<voucher_certifications_set_input>;
  /** filter the rows which have to be updated */
  where: voucher_certifications_bool_exp;
}

/** order by var_pop() on columns of table "voucher_certifications" */
export interface voucher_certifications_var_pop_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "voucher_certifications" */
export interface voucher_certifications_var_samp_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "voucher_certifications" */
export interface voucher_certifications_variance_order_by {
  certifier?: InputMaybe<order_by>;
  certifier_weight?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

export interface voucher_issuers_aggregate_bool_exp {
  bool_and?: InputMaybe<voucher_issuers_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<voucher_issuers_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<voucher_issuers_aggregate_bool_exp_count>;
}

export interface voucher_issuers_aggregate_bool_exp_bool_and {
  arguments: voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<voucher_issuers_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface voucher_issuers_aggregate_bool_exp_bool_or {
  arguments: voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<voucher_issuers_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface voucher_issuers_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<voucher_issuers_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<voucher_issuers_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "voucher_issuers" */
export interface voucher_issuers_aggregate_order_by {
  avg?: InputMaybe<voucher_issuers_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<voucher_issuers_max_order_by>;
  min?: InputMaybe<voucher_issuers_min_order_by>;
  stddev?: InputMaybe<voucher_issuers_stddev_order_by>;
  stddev_pop?: InputMaybe<voucher_issuers_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<voucher_issuers_stddev_samp_order_by>;
  sum?: InputMaybe<voucher_issuers_sum_order_by>;
  var_pop?: InputMaybe<voucher_issuers_var_pop_order_by>;
  var_samp?: InputMaybe<voucher_issuers_var_samp_order_by>;
  variance?: InputMaybe<voucher_issuers_variance_order_by>;
}

/** input type for inserting array relation for remote table "voucher_issuers" */
export interface voucher_issuers_arr_rel_insert_input {
  data: Array<voucher_issuers_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<voucher_issuers_on_conflict>;
}

/** order by avg() on columns of table "voucher_issuers" */
export interface voucher_issuers_avg_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "voucher_issuers". All fields are combined with a logical 'AND'. */
export interface voucher_issuers_bool_exp {
  _and?: InputMaybe<Array<voucher_issuers_bool_exp>>;
  _not?: InputMaybe<voucher_issuers_bool_exp>;
  _or?: InputMaybe<Array<voucher_issuers_bool_exp>>;
  account?: InputMaybe<accounts_bool_exp>;
  active?: InputMaybe<Boolean_comparison_exp>;
  backer?: InputMaybe<Int_comparison_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  voucher?: InputMaybe<Int_comparison_exp>;
  voucherByVoucher?: InputMaybe<vouchers_bool_exp>;
}

/** unique or primary key constraints on table "voucher_issuers" */
export enum voucher_issuers_constraint {
  /** unique or primary key constraint on columns "id" */
  voucher_backers_pkey = "voucher_backers_pkey",
}

/** input type for incrementing numeric columns in table "voucher_issuers" */
export interface voucher_issuers_inc_input {
  backer?: InputMaybe<Scalars["Int"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "voucher_issuers" */
export interface voucher_issuers_insert_input {
  account?: InputMaybe<accounts_obj_rel_insert_input>;
  active?: InputMaybe<Scalars["Boolean"]>;
  backer?: InputMaybe<Scalars["Int"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
  voucherByVoucher?: InputMaybe<vouchers_obj_rel_insert_input>;
}

/** order by max() on columns of table "voucher_issuers" */
export interface voucher_issuers_max_order_by {
  backer?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by min() on columns of table "voucher_issuers" */
export interface voucher_issuers_min_order_by {
  backer?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "voucher_issuers" */
export interface voucher_issuers_on_conflict {
  constraint: voucher_issuers_constraint;
  update_columns?: Array<voucher_issuers_update_column>;
  where?: InputMaybe<voucher_issuers_bool_exp>;
}

/** Ordering options when selecting data from "voucher_issuers". */
export interface voucher_issuers_order_by {
  account?: InputMaybe<accounts_order_by>;
  active?: InputMaybe<order_by>;
  backer?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
  voucherByVoucher?: InputMaybe<vouchers_order_by>;
}

/** primary key columns input for table: voucher_issuers */
export interface voucher_issuers_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "voucher_issuers" */
export enum voucher_issuers_select_column {
  /** column name */
  active = "active",
  /** column name */
  backer = "backer",
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  voucher = "voucher",
}

/** select "voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns" columns of table "voucher_issuers" */
export enum voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  active = "active",
}

/** select "voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns" columns of table "voucher_issuers" */
export enum voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  active = "active",
}

/** input type for updating data in table "voucher_issuers" */
export interface voucher_issuers_set_input {
  active?: InputMaybe<Scalars["Boolean"]>;
  backer?: InputMaybe<Scalars["Int"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by stddev() on columns of table "voucher_issuers" */
export interface voucher_issuers_stddev_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "voucher_issuers" */
export interface voucher_issuers_stddev_pop_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "voucher_issuers" */
export interface voucher_issuers_stddev_samp_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "voucher_issuers" */
export interface voucher_issuers_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: voucher_issuers_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface voucher_issuers_stream_cursor_value_input {
  active?: InputMaybe<Scalars["Boolean"]>;
  backer?: InputMaybe<Scalars["Int"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  voucher?: InputMaybe<Scalars["Int"]>;
}

/** order by sum() on columns of table "voucher_issuers" */
export interface voucher_issuers_sum_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** update columns of table "voucher_issuers" */
export enum voucher_issuers_update_column {
  /** column name */
  active = "active",
  /** column name */
  backer = "backer",
  /** column name */
  created_at = "created_at",
  /** column name */
  voucher = "voucher",
}

export interface voucher_issuers_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<voucher_issuers_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<voucher_issuers_set_input>;
  /** filter the rows which have to be updated */
  where: voucher_issuers_bool_exp;
}

/** order by var_pop() on columns of table "voucher_issuers" */
export interface voucher_issuers_var_pop_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "voucher_issuers" */
export interface voucher_issuers_var_samp_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "voucher_issuers" */
export interface voucher_issuers_variance_order_by {
  backer?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  voucher?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "vouchers". All fields are combined with a logical 'AND'. */
export interface vouchers_bool_exp {
  _and?: InputMaybe<Array<vouchers_bool_exp>>;
  _not?: InputMaybe<vouchers_bool_exp>;
  _or?: InputMaybe<Array<vouchers_bool_exp>>;
  active?: InputMaybe<Boolean_comparison_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  demurrage_rate?: InputMaybe<numeric_comparison_exp>;
  geo?: InputMaybe<point_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  location_name?: InputMaybe<String_comparison_exp>;
  radius?: InputMaybe<Int_comparison_exp>;
  service_accepted_payments?: InputMaybe<service_accepted_payment_bool_exp>;
  service_accepted_payments_aggregate?: InputMaybe<service_accepted_payment_aggregate_bool_exp>;
  sink_address?: InputMaybe<String_comparison_exp>;
  supply?: InputMaybe<Int_comparison_exp>;
  symbol?: InputMaybe<String_comparison_exp>;
  transactions?: InputMaybe<transactions_bool_exp>;
  transactions_aggregate?: InputMaybe<transactions_aggregate_bool_exp>;
  voucher_address?: InputMaybe<String_comparison_exp>;
  voucher_backers?: InputMaybe<voucher_issuers_bool_exp>;
  voucher_backers_aggregate?: InputMaybe<voucher_issuers_aggregate_bool_exp>;
  voucher_certifications?: InputMaybe<voucher_certifications_bool_exp>;
  voucher_certifications_aggregate?: InputMaybe<voucher_certifications_aggregate_bool_exp>;
  voucher_description?: InputMaybe<String_comparison_exp>;
  voucher_name?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "vouchers" */
export enum vouchers_constraint {
  /** unique or primary key constraint on columns "id" */
  vouchers_pkey = "vouchers_pkey",
  /** unique or primary key constraint on columns "voucher_address" */
  vouchers_voucher_address_key = "vouchers_voucher_address_key",
}

/** input type for incrementing numeric columns in table "vouchers" */
export interface vouchers_inc_input {
  demurrage_rate?: InputMaybe<Scalars["numeric"]>;
  radius?: InputMaybe<Scalars["Int"]>;
  supply?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "vouchers" */
export interface vouchers_insert_input {
  active?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  demurrage_rate?: InputMaybe<Scalars["numeric"]>;
  geo?: InputMaybe<Scalars["point"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  radius?: InputMaybe<Scalars["Int"]>;
  service_accepted_payments?: InputMaybe<service_accepted_payment_arr_rel_insert_input>;
  sink_address?: InputMaybe<Scalars["String"]>;
  supply?: InputMaybe<Scalars["Int"]>;
  symbol?: InputMaybe<Scalars["String"]>;
  transactions?: InputMaybe<transactions_arr_rel_insert_input>;
  voucher_address?: InputMaybe<Scalars["String"]>;
  voucher_backers?: InputMaybe<voucher_issuers_arr_rel_insert_input>;
  voucher_certifications?: InputMaybe<voucher_certifications_arr_rel_insert_input>;
  voucher_description?: InputMaybe<Scalars["String"]>;
  voucher_name?: InputMaybe<Scalars["String"]>;
}

/** input type for inserting object relation for remote table "vouchers" */
export interface vouchers_obj_rel_insert_input {
  data: vouchers_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<vouchers_on_conflict>;
}

/** on_conflict condition type for table "vouchers" */
export interface vouchers_on_conflict {
  constraint: vouchers_constraint;
  update_columns?: Array<vouchers_update_column>;
  where?: InputMaybe<vouchers_bool_exp>;
}

/** Ordering options when selecting data from "vouchers". */
export interface vouchers_order_by {
  active?: InputMaybe<order_by>;
  created_at?: InputMaybe<order_by>;
  demurrage_rate?: InputMaybe<order_by>;
  geo?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  location_name?: InputMaybe<order_by>;
  radius?: InputMaybe<order_by>;
  service_accepted_payments_aggregate?: InputMaybe<service_accepted_payment_aggregate_order_by>;
  sink_address?: InputMaybe<order_by>;
  supply?: InputMaybe<order_by>;
  symbol?: InputMaybe<order_by>;
  transactions_aggregate?: InputMaybe<transactions_aggregate_order_by>;
  voucher_address?: InputMaybe<order_by>;
  voucher_backers_aggregate?: InputMaybe<voucher_issuers_aggregate_order_by>;
  voucher_certifications_aggregate?: InputMaybe<voucher_certifications_aggregate_order_by>;
  voucher_description?: InputMaybe<order_by>;
  voucher_name?: InputMaybe<order_by>;
}

/** primary key columns input for table: vouchers */
export interface vouchers_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "vouchers" */
export enum vouchers_select_column {
  /** column name */
  active = "active",
  /** column name */
  created_at = "created_at",
  /** column name */
  demurrage_rate = "demurrage_rate",
  /** column name */
  geo = "geo",
  /** column name */
  id = "id",
  /** column name */
  location_name = "location_name",
  /** column name */
  radius = "radius",
  /** column name */
  sink_address = "sink_address",
  /** column name */
  supply = "supply",
  /** column name */
  symbol = "symbol",
  /** column name */
  voucher_address = "voucher_address",
  /** column name */
  voucher_description = "voucher_description",
  /** column name */
  voucher_name = "voucher_name",
}

/** input type for updating data in table "vouchers" */
export interface vouchers_set_input {
  active?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  demurrage_rate?: InputMaybe<Scalars["numeric"]>;
  geo?: InputMaybe<Scalars["point"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  radius?: InputMaybe<Scalars["Int"]>;
  sink_address?: InputMaybe<Scalars["String"]>;
  supply?: InputMaybe<Scalars["Int"]>;
  symbol?: InputMaybe<Scalars["String"]>;
  voucher_address?: InputMaybe<Scalars["String"]>;
  voucher_description?: InputMaybe<Scalars["String"]>;
  voucher_name?: InputMaybe<Scalars["String"]>;
}

/** Streaming cursor of the table "vouchers" */
export interface vouchers_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: vouchers_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface vouchers_stream_cursor_value_input {
  active?: InputMaybe<Scalars["Boolean"]>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  demurrage_rate?: InputMaybe<Scalars["numeric"]>;
  geo?: InputMaybe<Scalars["point"]>;
  id?: InputMaybe<Scalars["Int"]>;
  location_name?: InputMaybe<Scalars["String"]>;
  radius?: InputMaybe<Scalars["Int"]>;
  sink_address?: InputMaybe<Scalars["String"]>;
  supply?: InputMaybe<Scalars["Int"]>;
  symbol?: InputMaybe<Scalars["String"]>;
  voucher_address?: InputMaybe<Scalars["String"]>;
  voucher_description?: InputMaybe<Scalars["String"]>;
  voucher_name?: InputMaybe<Scalars["String"]>;
}

/** update columns of table "vouchers" */
export enum vouchers_update_column {
  /** column name */
  active = "active",
  /** column name */
  created_at = "created_at",
  /** column name */
  demurrage_rate = "demurrage_rate",
  /** column name */
  geo = "geo",
  /** column name */
  location_name = "location_name",
  /** column name */
  radius = "radius",
  /** column name */
  sink_address = "sink_address",
  /** column name */
  supply = "supply",
  /** column name */
  symbol = "symbol",
  /** column name */
  voucher_address = "voucher_address",
  /** column name */
  voucher_description = "voucher_description",
  /** column name */
  voucher_name = "voucher_name",
}

export interface vouchers_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<vouchers_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<vouchers_set_input>;
  /** filter the rows which have to be updated */
  where: vouchers_bool_exp;
}

export interface vpa_aggregate_bool_exp {
  count?: InputMaybe<vpa_aggregate_bool_exp_count>;
}

export interface vpa_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<vpa_select_column>>;
  distinct?: InputMaybe<Scalars["Boolean"]>;
  filter?: InputMaybe<vpa_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "vpa" */
export interface vpa_aggregate_order_by {
  avg?: InputMaybe<vpa_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<vpa_max_order_by>;
  min?: InputMaybe<vpa_min_order_by>;
  stddev?: InputMaybe<vpa_stddev_order_by>;
  stddev_pop?: InputMaybe<vpa_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<vpa_stddev_samp_order_by>;
  sum?: InputMaybe<vpa_sum_order_by>;
  var_pop?: InputMaybe<vpa_var_pop_order_by>;
  var_samp?: InputMaybe<vpa_var_samp_order_by>;
  variance?: InputMaybe<vpa_variance_order_by>;
}

/** input type for inserting array relation for remote table "vpa" */
export interface vpa_arr_rel_insert_input {
  data: Array<vpa_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<vpa_on_conflict>;
}

/** order by avg() on columns of table "vpa" */
export interface vpa_avg_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "vpa". All fields are combined with a logical 'AND'. */
export interface vpa_bool_exp {
  _and?: InputMaybe<Array<vpa_bool_exp>>;
  _not?: InputMaybe<vpa_bool_exp>;
  _or?: InputMaybe<Array<vpa_bool_exp>>;
  account?: InputMaybe<accounts_bool_exp>;
  created_at?: InputMaybe<timestamp_comparison_exp>;
  id?: InputMaybe<Int_comparison_exp>;
  linked_account?: InputMaybe<Int_comparison_exp>;
  vpa?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "vpa" */
export enum vpa_constraint {
  /** unique or primary key constraint on columns "id" */
  vpa_pkey = "vpa_pkey",
  /** unique or primary key constraint on columns "vpa" */
  vpa_vpa_key = "vpa_vpa_key",
}

/** input type for incrementing numeric columns in table "vpa" */
export interface vpa_inc_input {
  linked_account?: InputMaybe<Scalars["Int"]>;
}

/** input type for inserting data into table "vpa" */
export interface vpa_insert_input {
  account?: InputMaybe<accounts_obj_rel_insert_input>;
  created_at?: InputMaybe<Scalars["timestamp"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  vpa?: InputMaybe<Scalars["String"]>;
}

/** order by max() on columns of table "vpa" */
export interface vpa_max_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  vpa?: InputMaybe<order_by>;
}

/** order by min() on columns of table "vpa" */
export interface vpa_min_order_by {
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  vpa?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "vpa" */
export interface vpa_on_conflict {
  constraint: vpa_constraint;
  update_columns?: Array<vpa_update_column>;
  where?: InputMaybe<vpa_bool_exp>;
}

/** Ordering options when selecting data from "vpa". */
export interface vpa_order_by {
  account?: InputMaybe<accounts_order_by>;
  created_at?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
  vpa?: InputMaybe<order_by>;
}

/** primary key columns input for table: vpa */
export interface vpa_pk_columns_input {
  id: Scalars["Int"];
}

/** select columns of table "vpa" */
export enum vpa_select_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  id = "id",
  /** column name */
  linked_account = "linked_account",
  /** column name */
  vpa = "vpa",
}

/** input type for updating data in table "vpa" */
export interface vpa_set_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  vpa?: InputMaybe<Scalars["String"]>;
}

/** order by stddev() on columns of table "vpa" */
export interface vpa_stddev_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "vpa" */
export interface vpa_stddev_pop_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "vpa" */
export interface vpa_stddev_samp_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "vpa" */
export interface vpa_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: vpa_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface vpa_stream_cursor_value_input {
  created_at?: InputMaybe<Scalars["timestamp"]>;
  id?: InputMaybe<Scalars["Int"]>;
  linked_account?: InputMaybe<Scalars["Int"]>;
  vpa?: InputMaybe<Scalars["String"]>;
}

/** order by sum() on columns of table "vpa" */
export interface vpa_sum_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** update columns of table "vpa" */
export enum vpa_update_column {
  /** column name */
  created_at = "created_at",
  /** column name */
  linked_account = "linked_account",
  /** column name */
  vpa = "vpa",
}

export interface vpa_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<vpa_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<vpa_set_input>;
  /** filter the rows which have to be updated */
  where: vpa_bool_exp;
}

/** order by var_pop() on columns of table "vpa" */
export interface vpa_var_pop_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "vpa" */
export interface vpa_var_samp_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "vpa" */
export interface vpa_variance_order_by {
  id?: InputMaybe<order_by>;
  linked_account?: InputMaybe<order_by>;
}

export const scalarsEnumsHash: import("gqty").ScalarsEnumsHash = {
  Boolean: true,
  Float: true,
  Int: true,
  String: true,
  account_type_constraint: true,
  account_type_enum: true,
  account_type_select_column: true,
  account_type_update_column: true,
  accounts_constraint: true,
  accounts_select_column: true,
  accounts_update_column: true,
  bigint: true,
  cursor_ordering: true,
  float8: true,
  gender_type_constraint: true,
  gender_type_enum: true,
  gender_type_select_column: true,
  gender_type_update_column: true,
  interface_type_constraint: true,
  interface_type_enum: true,
  interface_type_select_column: true,
  interface_type_update_column: true,
  marketplaces_constraint: true,
  marketplaces_select_column: true,
  marketplaces_update_column: true,
  numeric: true,
  order_by: true,
  personal_information_constraint: true,
  personal_information_select_column: true,
  personal_information_update_column: true,
  point: true,
  service_accepted_payment_constraint: true,
  service_accepted_payment_select_column: true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns:
    true,
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns:
    true,
  service_accepted_payment_update_column: true,
  service_type_constraint: true,
  service_type_enum: true,
  service_type_select_column: true,
  service_type_update_column: true,
  services_constraint: true,
  services_images_constraint: true,
  services_images_select_column: true,
  services_images_update_column: true,
  services_ratings_constraint: true,
  services_ratings_select_column: true,
  services_ratings_update_column: true,
  services_select_column: true,
  services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns:
    true,
  services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns:
    true,
  services_update_column: true,
  till_constraint: true,
  till_select_column: true,
  till_update_column: true,
  timestamp: true,
  transactions_constraint: true,
  transactions_select_column: true,
  transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns:
    true,
  transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns:
    true,
  transactions_update_column: true,
  tx_type_constraint: true,
  tx_type_enum: true,
  tx_type_select_column: true,
  tx_type_update_column: true,
  users_constraint: true,
  users_select_column: true,
  users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns: true,
  users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns: true,
  users_update_column: true,
  voucher_certifications_constraint: true,
  voucher_certifications_select_column: true,
  voucher_certifications_update_column: true,
  voucher_issuers_constraint: true,
  voucher_issuers_select_column: true,
  voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns:
    true,
  voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns:
    true,
  voucher_issuers_update_column: true,
  vouchers_constraint: true,
  vouchers_select_column: true,
  vouchers_update_column: true,
  vpa_constraint: true,
  vpa_select_column: true,
  vpa_update_column: true,
};
export const generatedSchema = {
  Boolean_comparison_exp: {
    _eq: { __type: "Boolean" },
    _gt: { __type: "Boolean" },
    _gte: { __type: "Boolean" },
    _in: { __type: "[Boolean!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "Boolean" },
    _lte: { __type: "Boolean" },
    _neq: { __type: "Boolean" },
    _nin: { __type: "[Boolean!]" },
  },
  Int_comparison_exp: {
    _eq: { __type: "Int" },
    _gt: { __type: "Int" },
    _gte: { __type: "Int" },
    _in: { __type: "[Int!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "Int" },
    _lte: { __type: "Int" },
    _neq: { __type: "Int" },
    _nin: { __type: "[Int!]" },
  },
  String_comparison_exp: {
    _eq: { __type: "String" },
    _gt: { __type: "String" },
    _gte: { __type: "String" },
    _ilike: { __type: "String" },
    _in: { __type: "[String!]" },
    _iregex: { __type: "String" },
    _is_null: { __type: "Boolean" },
    _like: { __type: "String" },
    _lt: { __type: "String" },
    _lte: { __type: "String" },
    _neq: { __type: "String" },
    _nilike: { __type: "String" },
    _nin: { __type: "[String!]" },
    _niregex: { __type: "String" },
    _nlike: { __type: "String" },
    _nregex: { __type: "String" },
    _nsimilar: { __type: "String" },
    _regex: { __type: "String" },
    _similar: { __type: "String" },
  },
  account_type: {
    __typename: { __type: "String!" },
    accounts: {
      __type: "[accounts!]!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_aggregate: {
      __type: "accounts_aggregate!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    value: { __type: "String!" },
  },
  account_type_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "account_type_aggregate_fields" },
    nodes: { __type: "[account_type!]!" },
  },
  account_type_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: { columns: "[account_type_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "account_type_max_fields" },
    min: { __type: "account_type_min_fields" },
  },
  account_type_bool_exp: {
    _and: { __type: "[account_type_bool_exp!]" },
    _not: { __type: "account_type_bool_exp" },
    _or: { __type: "[account_type_bool_exp!]" },
    accounts: { __type: "accounts_bool_exp" },
    accounts_aggregate: { __type: "accounts_aggregate_bool_exp" },
    value: { __type: "String_comparison_exp" },
  },
  account_type_enum_comparison_exp: {
    _eq: { __type: "account_type_enum" },
    _in: { __type: "[account_type_enum!]" },
    _is_null: { __type: "Boolean" },
    _neq: { __type: "account_type_enum" },
    _nin: { __type: "[account_type_enum!]" },
  },
  account_type_insert_input: {
    accounts: { __type: "accounts_arr_rel_insert_input" },
    value: { __type: "String" },
  },
  account_type_max_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  account_type_min_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  account_type_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[account_type!]!" },
  },
  account_type_obj_rel_insert_input: {
    data: { __type: "account_type_insert_input!" },
    on_conflict: { __type: "account_type_on_conflict" },
  },
  account_type_on_conflict: {
    constraint: { __type: "account_type_constraint!" },
    update_columns: { __type: "[account_type_update_column!]!" },
    where: { __type: "account_type_bool_exp" },
  },
  account_type_order_by: {
    accounts_aggregate: { __type: "accounts_aggregate_order_by" },
    value: { __type: "order_by" },
  },
  account_type_pk_columns_input: { value: { __type: "String!" } },
  account_type_set_input: { value: { __type: "String" } },
  account_type_stream_cursor_input: {
    initial_value: { __type: "account_type_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  account_type_stream_cursor_value_input: { value: { __type: "String" } },
  account_type_updates: {
    _set: { __type: "account_type_set_input" },
    where: { __type: "account_type_bool_exp!" },
  },
  accounts: {
    __typename: { __type: "String!" },
    accountTypeByAccountType: { __type: "account_type!" },
    account_type: { __type: "account_type_enum!" },
    blockchain_address: { __type: "String!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    marketplace: { __type: "marketplaces" },
    services_ratings: {
      __type: "[services_ratings!]!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    tills: {
      __type: "[till!]!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    tills_aggregate: {
      __type: "till_aggregate!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    user: { __type: "users!" },
    user_identifier: { __type: "Int!" },
    voucher_backers: {
      __type: "[voucher_issuers!]!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_backers_aggregate: {
      __type: "voucher_issuers_aggregate!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_certifications: {
      __type: "[voucher_certifications!]!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    vpas: {
      __type: "[vpa!]!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
    vpas_aggregate: {
      __type: "vpa_aggregate!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
  },
  accounts_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "accounts_aggregate_fields" },
    nodes: { __type: "[accounts!]!" },
  },
  accounts_aggregate_bool_exp: {
    count: { __type: "accounts_aggregate_bool_exp_count" },
  },
  accounts_aggregate_bool_exp_count: {
    arguments: { __type: "[accounts_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "accounts_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  accounts_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "accounts_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[accounts_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "accounts_max_fields" },
    min: { __type: "accounts_min_fields" },
    stddev: { __type: "accounts_stddev_fields" },
    stddev_pop: { __type: "accounts_stddev_pop_fields" },
    stddev_samp: { __type: "accounts_stddev_samp_fields" },
    sum: { __type: "accounts_sum_fields" },
    var_pop: { __type: "accounts_var_pop_fields" },
    var_samp: { __type: "accounts_var_samp_fields" },
    variance: { __type: "accounts_variance_fields" },
  },
  accounts_aggregate_order_by: {
    avg: { __type: "accounts_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "accounts_max_order_by" },
    min: { __type: "accounts_min_order_by" },
    stddev: { __type: "accounts_stddev_order_by" },
    stddev_pop: { __type: "accounts_stddev_pop_order_by" },
    stddev_samp: { __type: "accounts_stddev_samp_order_by" },
    sum: { __type: "accounts_sum_order_by" },
    var_pop: { __type: "accounts_var_pop_order_by" },
    var_samp: { __type: "accounts_var_samp_order_by" },
    variance: { __type: "accounts_variance_order_by" },
  },
  accounts_arr_rel_insert_input: {
    data: { __type: "[accounts_insert_input!]!" },
    on_conflict: { __type: "accounts_on_conflict" },
  },
  accounts_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_avg_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_bool_exp: {
    _and: { __type: "[accounts_bool_exp!]" },
    _not: { __type: "accounts_bool_exp" },
    _or: { __type: "[accounts_bool_exp!]" },
    accountTypeByAccountType: { __type: "account_type_bool_exp" },
    account_type: { __type: "account_type_enum_comparison_exp" },
    blockchain_address: { __type: "String_comparison_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    marketplace: { __type: "marketplaces_bool_exp" },
    services_ratings: { __type: "services_ratings_bool_exp" },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate_bool_exp",
    },
    tills: { __type: "till_bool_exp" },
    tills_aggregate: { __type: "till_aggregate_bool_exp" },
    user: { __type: "users_bool_exp" },
    user_identifier: { __type: "Int_comparison_exp" },
    voucher_backers: { __type: "voucher_issuers_bool_exp" },
    voucher_backers_aggregate: { __type: "voucher_issuers_aggregate_bool_exp" },
    voucher_certifications: { __type: "voucher_certifications_bool_exp" },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate_bool_exp",
    },
    vpas: { __type: "vpa_bool_exp" },
    vpas_aggregate: { __type: "vpa_aggregate_bool_exp" },
  },
  accounts_inc_input: { user_identifier: { __type: "Int" } },
  accounts_insert_input: {
    accountTypeByAccountType: { __type: "account_type_obj_rel_insert_input" },
    account_type: { __type: "account_type_enum" },
    blockchain_address: { __type: "String" },
    created_at: { __type: "timestamp" },
    marketplace: { __type: "marketplaces_obj_rel_insert_input" },
    services_ratings: { __type: "services_ratings_arr_rel_insert_input" },
    tills: { __type: "till_arr_rel_insert_input" },
    user: { __type: "users_obj_rel_insert_input" },
    user_identifier: { __type: "Int" },
    voucher_backers: { __type: "voucher_issuers_arr_rel_insert_input" },
    voucher_certifications: {
      __type: "voucher_certifications_arr_rel_insert_input",
    },
    vpas: { __type: "vpa_arr_rel_insert_input" },
  },
  accounts_max_fields: {
    __typename: { __type: "String!" },
    blockchain_address: { __type: "String" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    user_identifier: { __type: "Int" },
  },
  accounts_max_order_by: {
    blockchain_address: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_min_fields: {
    __typename: { __type: "String!" },
    blockchain_address: { __type: "String" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    user_identifier: { __type: "Int" },
  },
  accounts_min_order_by: {
    blockchain_address: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[accounts!]!" },
  },
  accounts_obj_rel_insert_input: {
    data: { __type: "accounts_insert_input!" },
    on_conflict: { __type: "accounts_on_conflict" },
  },
  accounts_on_conflict: {
    constraint: { __type: "accounts_constraint!" },
    update_columns: { __type: "[accounts_update_column!]!" },
    where: { __type: "accounts_bool_exp" },
  },
  accounts_order_by: {
    accountTypeByAccountType: { __type: "account_type_order_by" },
    account_type: { __type: "order_by" },
    blockchain_address: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    marketplace: { __type: "marketplaces_order_by" },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate_order_by",
    },
    tills_aggregate: { __type: "till_aggregate_order_by" },
    user: { __type: "users_order_by" },
    user_identifier: { __type: "order_by" },
    voucher_backers_aggregate: { __type: "voucher_issuers_aggregate_order_by" },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate_order_by",
    },
    vpas_aggregate: { __type: "vpa_aggregate_order_by" },
  },
  accounts_pk_columns_input: { id: { __type: "Int!" } },
  accounts_set_input: {
    account_type: { __type: "account_type_enum" },
    blockchain_address: { __type: "String" },
    created_at: { __type: "timestamp" },
    user_identifier: { __type: "Int" },
  },
  accounts_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_stddev_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_stddev_pop_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_stddev_samp_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_stream_cursor_input: {
    initial_value: { __type: "accounts_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  accounts_stream_cursor_value_input: {
    account_type: { __type: "account_type_enum" },
    blockchain_address: { __type: "String" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    user_identifier: { __type: "Int" },
  },
  accounts_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    user_identifier: { __type: "Int" },
  },
  accounts_sum_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_updates: {
    _inc: { __type: "accounts_inc_input" },
    _set: { __type: "accounts_set_input" },
    where: { __type: "accounts_bool_exp!" },
  },
  accounts_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_var_pop_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_var_samp_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  accounts_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    user_identifier: { __type: "Float" },
  },
  accounts_variance_order_by: {
    id: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
  },
  bigint_comparison_exp: {
    _eq: { __type: "bigint" },
    _gt: { __type: "bigint" },
    _gte: { __type: "bigint" },
    _in: { __type: "[bigint!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "bigint" },
    _lte: { __type: "bigint" },
    _neq: { __type: "bigint" },
    _nin: { __type: "[bigint!]" },
  },
  float8_comparison_exp: {
    _eq: { __type: "float8" },
    _gt: { __type: "float8" },
    _gte: { __type: "float8" },
    _in: { __type: "[float8!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "float8" },
    _lte: { __type: "float8" },
    _neq: { __type: "float8" },
    _nin: { __type: "[float8!]" },
  },
  gender_type: {
    __typename: { __type: "String!" },
    personal_informations: {
      __type: "[personal_information!]!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    personal_informations_aggregate: {
      __type: "personal_information_aggregate!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    value: { __type: "String!" },
  },
  gender_type_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "gender_type_aggregate_fields" },
    nodes: { __type: "[gender_type!]!" },
  },
  gender_type_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: { columns: "[gender_type_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "gender_type_max_fields" },
    min: { __type: "gender_type_min_fields" },
  },
  gender_type_bool_exp: {
    _and: { __type: "[gender_type_bool_exp!]" },
    _not: { __type: "gender_type_bool_exp" },
    _or: { __type: "[gender_type_bool_exp!]" },
    personal_informations: { __type: "personal_information_bool_exp" },
    personal_informations_aggregate: {
      __type: "personal_information_aggregate_bool_exp",
    },
    value: { __type: "String_comparison_exp" },
  },
  gender_type_enum_comparison_exp: {
    _eq: { __type: "gender_type_enum" },
    _in: { __type: "[gender_type_enum!]" },
    _is_null: { __type: "Boolean" },
    _neq: { __type: "gender_type_enum" },
    _nin: { __type: "[gender_type_enum!]" },
  },
  gender_type_insert_input: {
    personal_informations: {
      __type: "personal_information_arr_rel_insert_input",
    },
    value: { __type: "String" },
  },
  gender_type_max_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  gender_type_min_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  gender_type_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[gender_type!]!" },
  },
  gender_type_obj_rel_insert_input: {
    data: { __type: "gender_type_insert_input!" },
    on_conflict: { __type: "gender_type_on_conflict" },
  },
  gender_type_on_conflict: {
    constraint: { __type: "gender_type_constraint!" },
    update_columns: { __type: "[gender_type_update_column!]!" },
    where: { __type: "gender_type_bool_exp" },
  },
  gender_type_order_by: {
    personal_informations_aggregate: {
      __type: "personal_information_aggregate_order_by",
    },
    value: { __type: "order_by" },
  },
  gender_type_pk_columns_input: { value: { __type: "String!" } },
  gender_type_set_input: { value: { __type: "String" } },
  gender_type_stream_cursor_input: {
    initial_value: { __type: "gender_type_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  gender_type_stream_cursor_value_input: { value: { __type: "String" } },
  gender_type_updates: {
    _set: { __type: "gender_type_set_input" },
    where: { __type: "gender_type_bool_exp!" },
  },
  interface_type: {
    __typename: { __type: "String!" },
    users: {
      __type: "[users!]!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    users_aggregate: {
      __type: "users_aggregate!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    value: { __type: "String!" },
  },
  interface_type_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "interface_type_aggregate_fields" },
    nodes: { __type: "[interface_type!]!" },
  },
  interface_type_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[interface_type_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "interface_type_max_fields" },
    min: { __type: "interface_type_min_fields" },
  },
  interface_type_bool_exp: {
    _and: { __type: "[interface_type_bool_exp!]" },
    _not: { __type: "interface_type_bool_exp" },
    _or: { __type: "[interface_type_bool_exp!]" },
    users: { __type: "users_bool_exp" },
    users_aggregate: { __type: "users_aggregate_bool_exp" },
    value: { __type: "String_comparison_exp" },
  },
  interface_type_enum_comparison_exp: {
    _eq: { __type: "interface_type_enum" },
    _in: { __type: "[interface_type_enum!]" },
    _is_null: { __type: "Boolean" },
    _neq: { __type: "interface_type_enum" },
    _nin: { __type: "[interface_type_enum!]" },
  },
  interface_type_insert_input: {
    users: { __type: "users_arr_rel_insert_input" },
    value: { __type: "String" },
  },
  interface_type_max_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  interface_type_min_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  interface_type_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[interface_type!]!" },
  },
  interface_type_obj_rel_insert_input: {
    data: { __type: "interface_type_insert_input!" },
    on_conflict: { __type: "interface_type_on_conflict" },
  },
  interface_type_on_conflict: {
    constraint: { __type: "interface_type_constraint!" },
    update_columns: { __type: "[interface_type_update_column!]!" },
    where: { __type: "interface_type_bool_exp" },
  },
  interface_type_order_by: {
    users_aggregate: { __type: "users_aggregate_order_by" },
    value: { __type: "order_by" },
  },
  interface_type_pk_columns_input: { value: { __type: "String!" } },
  interface_type_set_input: { value: { __type: "String" } },
  interface_type_stream_cursor_input: {
    initial_value: { __type: "interface_type_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  interface_type_stream_cursor_value_input: { value: { __type: "String" } },
  interface_type_updates: {
    _set: { __type: "interface_type_set_input" },
    where: { __type: "interface_type_bool_exp!" },
  },
  marketplaces: {
    __typename: { __type: "String!" },
    account: { __type: "Int!" },
    accountByAccount: { __type: "accounts!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    marketplace_name: { __type: "String!" },
    services: {
      __type: "[services!]!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_aggregate: {
      __type: "services_aggregate!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
  },
  marketplaces_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "marketplaces_aggregate_fields" },
    nodes: { __type: "[marketplaces!]!" },
  },
  marketplaces_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "marketplaces_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[marketplaces_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "marketplaces_max_fields" },
    min: { __type: "marketplaces_min_fields" },
    stddev: { __type: "marketplaces_stddev_fields" },
    stddev_pop: { __type: "marketplaces_stddev_pop_fields" },
    stddev_samp: { __type: "marketplaces_stddev_samp_fields" },
    sum: { __type: "marketplaces_sum_fields" },
    var_pop: { __type: "marketplaces_var_pop_fields" },
    var_samp: { __type: "marketplaces_var_samp_fields" },
    variance: { __type: "marketplaces_variance_fields" },
  },
  marketplaces_avg_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_bool_exp: {
    _and: { __type: "[marketplaces_bool_exp!]" },
    _not: { __type: "marketplaces_bool_exp" },
    _or: { __type: "[marketplaces_bool_exp!]" },
    account: { __type: "Int_comparison_exp" },
    accountByAccount: { __type: "accounts_bool_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    marketplace_name: { __type: "String_comparison_exp" },
    services: { __type: "services_bool_exp" },
    services_aggregate: { __type: "services_aggregate_bool_exp" },
  },
  marketplaces_inc_input: { account: { __type: "Int" } },
  marketplaces_insert_input: {
    account: { __type: "Int" },
    accountByAccount: { __type: "accounts_obj_rel_insert_input" },
    created_at: { __type: "timestamp" },
    marketplace_name: { __type: "String" },
    services: { __type: "services_arr_rel_insert_input" },
  },
  marketplaces_max_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    marketplace_name: { __type: "String" },
  },
  marketplaces_min_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    marketplace_name: { __type: "String" },
  },
  marketplaces_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[marketplaces!]!" },
  },
  marketplaces_obj_rel_insert_input: {
    data: { __type: "marketplaces_insert_input!" },
    on_conflict: { __type: "marketplaces_on_conflict" },
  },
  marketplaces_on_conflict: {
    constraint: { __type: "marketplaces_constraint!" },
    update_columns: { __type: "[marketplaces_update_column!]!" },
    where: { __type: "marketplaces_bool_exp" },
  },
  marketplaces_order_by: {
    account: { __type: "order_by" },
    accountByAccount: { __type: "accounts_order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    marketplace_name: { __type: "order_by" },
    services_aggregate: { __type: "services_aggregate_order_by" },
  },
  marketplaces_pk_columns_input: { id: { __type: "Int!" } },
  marketplaces_set_input: {
    account: { __type: "Int" },
    created_at: { __type: "timestamp" },
    marketplace_name: { __type: "String" },
  },
  marketplaces_stddev_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_stddev_pop_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_stddev_samp_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_stream_cursor_input: {
    initial_value: { __type: "marketplaces_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  marketplaces_stream_cursor_value_input: {
    account: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    marketplace_name: { __type: "String" },
  },
  marketplaces_sum_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Int" },
    id: { __type: "Int" },
  },
  marketplaces_updates: {
    _inc: { __type: "marketplaces_inc_input" },
    _set: { __type: "marketplaces_set_input" },
    where: { __type: "marketplaces_bool_exp!" },
  },
  marketplaces_var_pop_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_var_samp_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  marketplaces_variance_fields: {
    __typename: { __type: "String!" },
    account: { __type: "Float" },
    id: { __type: "Float" },
  },
  mutation: {
    __typename: { __type: "String!" },
    delete_account_type: {
      __type: "account_type_mutation_response",
      __args: { where: "account_type_bool_exp!" },
    },
    delete_account_type_by_pk: {
      __type: "account_type",
      __args: { value: "String!" },
    },
    delete_accounts: {
      __type: "accounts_mutation_response",
      __args: { where: "accounts_bool_exp!" },
    },
    delete_accounts_by_pk: { __type: "accounts", __args: { id: "Int!" } },
    delete_gender_type: {
      __type: "gender_type_mutation_response",
      __args: { where: "gender_type_bool_exp!" },
    },
    delete_gender_type_by_pk: {
      __type: "gender_type",
      __args: { value: "String!" },
    },
    delete_interface_type: {
      __type: "interface_type_mutation_response",
      __args: { where: "interface_type_bool_exp!" },
    },
    delete_interface_type_by_pk: {
      __type: "interface_type",
      __args: { value: "String!" },
    },
    delete_marketplaces: {
      __type: "marketplaces_mutation_response",
      __args: { where: "marketplaces_bool_exp!" },
    },
    delete_marketplaces_by_pk: {
      __type: "marketplaces",
      __args: { id: "Int!" },
    },
    delete_personal_information: {
      __type: "personal_information_mutation_response",
      __args: { where: "personal_information_bool_exp!" },
    },
    delete_service_accepted_payment: {
      __type: "service_accepted_payment_mutation_response",
      __args: { where: "service_accepted_payment_bool_exp!" },
    },
    delete_service_accepted_payment_by_pk: {
      __type: "service_accepted_payment",
      __args: { id: "Int!" },
    },
    delete_service_type: {
      __type: "service_type_mutation_response",
      __args: { where: "service_type_bool_exp!" },
    },
    delete_service_type_by_pk: {
      __type: "service_type",
      __args: { value: "String!" },
    },
    delete_services: {
      __type: "services_mutation_response",
      __args: { where: "services_bool_exp!" },
    },
    delete_services_by_pk: { __type: "services", __args: { id: "Int!" } },
    delete_services_images: {
      __type: "services_images_mutation_response",
      __args: { where: "services_images_bool_exp!" },
    },
    delete_services_images_by_pk: {
      __type: "services_images",
      __args: { id: "Int!" },
    },
    delete_services_ratings: {
      __type: "services_ratings_mutation_response",
      __args: { where: "services_ratings_bool_exp!" },
    },
    delete_services_ratings_by_pk: {
      __type: "services_ratings",
      __args: { id: "Int!" },
    },
    delete_till: {
      __type: "till_mutation_response",
      __args: { where: "till_bool_exp!" },
    },
    delete_till_by_pk: { __type: "till", __args: { id: "Int!" } },
    delete_transactions: {
      __type: "transactions_mutation_response",
      __args: { where: "transactions_bool_exp!" },
    },
    delete_transactions_by_pk: {
      __type: "transactions",
      __args: { id: "Int!" },
    },
    delete_tx_type: {
      __type: "tx_type_mutation_response",
      __args: { where: "tx_type_bool_exp!" },
    },
    delete_tx_type_by_pk: { __type: "tx_type", __args: { value: "String!" } },
    delete_users: {
      __type: "users_mutation_response",
      __args: { where: "users_bool_exp!" },
    },
    delete_users_by_pk: { __type: "users", __args: { id: "Int!" } },
    delete_voucher_certifications: {
      __type: "voucher_certifications_mutation_response",
      __args: { where: "voucher_certifications_bool_exp!" },
    },
    delete_voucher_certifications_by_pk: {
      __type: "voucher_certifications",
      __args: { id: "Int!" },
    },
    delete_voucher_issuers: {
      __type: "voucher_issuers_mutation_response",
      __args: { where: "voucher_issuers_bool_exp!" },
    },
    delete_voucher_issuers_by_pk: {
      __type: "voucher_issuers",
      __args: { id: "Int!" },
    },
    delete_vouchers: {
      __type: "vouchers_mutation_response",
      __args: { where: "vouchers_bool_exp!" },
    },
    delete_vouchers_by_pk: { __type: "vouchers", __args: { id: "Int!" } },
    delete_vpa: {
      __type: "vpa_mutation_response",
      __args: { where: "vpa_bool_exp!" },
    },
    delete_vpa_by_pk: { __type: "vpa", __args: { id: "Int!" } },
    insert_account_type: {
      __type: "account_type_mutation_response",
      __args: {
        objects: "[account_type_insert_input!]!",
        on_conflict: "account_type_on_conflict",
      },
    },
    insert_account_type_one: {
      __type: "account_type",
      __args: {
        object: "account_type_insert_input!",
        on_conflict: "account_type_on_conflict",
      },
    },
    insert_accounts: {
      __type: "accounts_mutation_response",
      __args: {
        objects: "[accounts_insert_input!]!",
        on_conflict: "accounts_on_conflict",
      },
    },
    insert_accounts_one: {
      __type: "accounts",
      __args: {
        object: "accounts_insert_input!",
        on_conflict: "accounts_on_conflict",
      },
    },
    insert_gender_type: {
      __type: "gender_type_mutation_response",
      __args: {
        objects: "[gender_type_insert_input!]!",
        on_conflict: "gender_type_on_conflict",
      },
    },
    insert_gender_type_one: {
      __type: "gender_type",
      __args: {
        object: "gender_type_insert_input!",
        on_conflict: "gender_type_on_conflict",
      },
    },
    insert_interface_type: {
      __type: "interface_type_mutation_response",
      __args: {
        objects: "[interface_type_insert_input!]!",
        on_conflict: "interface_type_on_conflict",
      },
    },
    insert_interface_type_one: {
      __type: "interface_type",
      __args: {
        object: "interface_type_insert_input!",
        on_conflict: "interface_type_on_conflict",
      },
    },
    insert_marketplaces: {
      __type: "marketplaces_mutation_response",
      __args: {
        objects: "[marketplaces_insert_input!]!",
        on_conflict: "marketplaces_on_conflict",
      },
    },
    insert_marketplaces_one: {
      __type: "marketplaces",
      __args: {
        object: "marketplaces_insert_input!",
        on_conflict: "marketplaces_on_conflict",
      },
    },
    insert_personal_information: {
      __type: "personal_information_mutation_response",
      __args: {
        objects: "[personal_information_insert_input!]!",
        on_conflict: "personal_information_on_conflict",
      },
    },
    insert_personal_information_one: {
      __type: "personal_information",
      __args: {
        object: "personal_information_insert_input!",
        on_conflict: "personal_information_on_conflict",
      },
    },
    insert_service_accepted_payment: {
      __type: "service_accepted_payment_mutation_response",
      __args: {
        objects: "[service_accepted_payment_insert_input!]!",
        on_conflict: "service_accepted_payment_on_conflict",
      },
    },
    insert_service_accepted_payment_one: {
      __type: "service_accepted_payment",
      __args: {
        object: "service_accepted_payment_insert_input!",
        on_conflict: "service_accepted_payment_on_conflict",
      },
    },
    insert_service_type: {
      __type: "service_type_mutation_response",
      __args: {
        objects: "[service_type_insert_input!]!",
        on_conflict: "service_type_on_conflict",
      },
    },
    insert_service_type_one: {
      __type: "service_type",
      __args: {
        object: "service_type_insert_input!",
        on_conflict: "service_type_on_conflict",
      },
    },
    insert_services: {
      __type: "services_mutation_response",
      __args: {
        objects: "[services_insert_input!]!",
        on_conflict: "services_on_conflict",
      },
    },
    insert_services_images: {
      __type: "services_images_mutation_response",
      __args: {
        objects: "[services_images_insert_input!]!",
        on_conflict: "services_images_on_conflict",
      },
    },
    insert_services_images_one: {
      __type: "services_images",
      __args: {
        object: "services_images_insert_input!",
        on_conflict: "services_images_on_conflict",
      },
    },
    insert_services_one: {
      __type: "services",
      __args: {
        object: "services_insert_input!",
        on_conflict: "services_on_conflict",
      },
    },
    insert_services_ratings: {
      __type: "services_ratings_mutation_response",
      __args: {
        objects: "[services_ratings_insert_input!]!",
        on_conflict: "services_ratings_on_conflict",
      },
    },
    insert_services_ratings_one: {
      __type: "services_ratings",
      __args: {
        object: "services_ratings_insert_input!",
        on_conflict: "services_ratings_on_conflict",
      },
    },
    insert_till: {
      __type: "till_mutation_response",
      __args: {
        objects: "[till_insert_input!]!",
        on_conflict: "till_on_conflict",
      },
    },
    insert_till_one: {
      __type: "till",
      __args: { object: "till_insert_input!", on_conflict: "till_on_conflict" },
    },
    insert_transactions: {
      __type: "transactions_mutation_response",
      __args: {
        objects: "[transactions_insert_input!]!",
        on_conflict: "transactions_on_conflict",
      },
    },
    insert_transactions_one: {
      __type: "transactions",
      __args: {
        object: "transactions_insert_input!",
        on_conflict: "transactions_on_conflict",
      },
    },
    insert_tx_type: {
      __type: "tx_type_mutation_response",
      __args: {
        objects: "[tx_type_insert_input!]!",
        on_conflict: "tx_type_on_conflict",
      },
    },
    insert_tx_type_one: {
      __type: "tx_type",
      __args: {
        object: "tx_type_insert_input!",
        on_conflict: "tx_type_on_conflict",
      },
    },
    insert_users: {
      __type: "users_mutation_response",
      __args: {
        objects: "[users_insert_input!]!",
        on_conflict: "users_on_conflict",
      },
    },
    insert_users_one: {
      __type: "users",
      __args: {
        object: "users_insert_input!",
        on_conflict: "users_on_conflict",
      },
    },
    insert_voucher_certifications: {
      __type: "voucher_certifications_mutation_response",
      __args: {
        objects: "[voucher_certifications_insert_input!]!",
        on_conflict: "voucher_certifications_on_conflict",
      },
    },
    insert_voucher_certifications_one: {
      __type: "voucher_certifications",
      __args: {
        object: "voucher_certifications_insert_input!",
        on_conflict: "voucher_certifications_on_conflict",
      },
    },
    insert_voucher_issuers: {
      __type: "voucher_issuers_mutation_response",
      __args: {
        objects: "[voucher_issuers_insert_input!]!",
        on_conflict: "voucher_issuers_on_conflict",
      },
    },
    insert_voucher_issuers_one: {
      __type: "voucher_issuers",
      __args: {
        object: "voucher_issuers_insert_input!",
        on_conflict: "voucher_issuers_on_conflict",
      },
    },
    insert_vouchers: {
      __type: "vouchers_mutation_response",
      __args: {
        objects: "[vouchers_insert_input!]!",
        on_conflict: "vouchers_on_conflict",
      },
    },
    insert_vouchers_one: {
      __type: "vouchers",
      __args: {
        object: "vouchers_insert_input!",
        on_conflict: "vouchers_on_conflict",
      },
    },
    insert_vpa: {
      __type: "vpa_mutation_response",
      __args: {
        objects: "[vpa_insert_input!]!",
        on_conflict: "vpa_on_conflict",
      },
    },
    insert_vpa_one: {
      __type: "vpa",
      __args: { object: "vpa_insert_input!", on_conflict: "vpa_on_conflict" },
    },
    update_account_type: {
      __type: "account_type_mutation_response",
      __args: {
        _set: "account_type_set_input",
        where: "account_type_bool_exp!",
      },
    },
    update_account_type_by_pk: {
      __type: "account_type",
      __args: {
        _set: "account_type_set_input",
        pk_columns: "account_type_pk_columns_input!",
      },
    },
    update_account_type_many: {
      __type: "[account_type_mutation_response]",
      __args: { updates: "[account_type_updates!]!" },
    },
    update_accounts: {
      __type: "accounts_mutation_response",
      __args: {
        _inc: "accounts_inc_input",
        _set: "accounts_set_input",
        where: "accounts_bool_exp!",
      },
    },
    update_accounts_by_pk: {
      __type: "accounts",
      __args: {
        _inc: "accounts_inc_input",
        _set: "accounts_set_input",
        pk_columns: "accounts_pk_columns_input!",
      },
    },
    update_accounts_many: {
      __type: "[accounts_mutation_response]",
      __args: { updates: "[accounts_updates!]!" },
    },
    update_gender_type: {
      __type: "gender_type_mutation_response",
      __args: { _set: "gender_type_set_input", where: "gender_type_bool_exp!" },
    },
    update_gender_type_by_pk: {
      __type: "gender_type",
      __args: {
        _set: "gender_type_set_input",
        pk_columns: "gender_type_pk_columns_input!",
      },
    },
    update_gender_type_many: {
      __type: "[gender_type_mutation_response]",
      __args: { updates: "[gender_type_updates!]!" },
    },
    update_interface_type: {
      __type: "interface_type_mutation_response",
      __args: {
        _set: "interface_type_set_input",
        where: "interface_type_bool_exp!",
      },
    },
    update_interface_type_by_pk: {
      __type: "interface_type",
      __args: {
        _set: "interface_type_set_input",
        pk_columns: "interface_type_pk_columns_input!",
      },
    },
    update_interface_type_many: {
      __type: "[interface_type_mutation_response]",
      __args: { updates: "[interface_type_updates!]!" },
    },
    update_marketplaces: {
      __type: "marketplaces_mutation_response",
      __args: {
        _inc: "marketplaces_inc_input",
        _set: "marketplaces_set_input",
        where: "marketplaces_bool_exp!",
      },
    },
    update_marketplaces_by_pk: {
      __type: "marketplaces",
      __args: {
        _inc: "marketplaces_inc_input",
        _set: "marketplaces_set_input",
        pk_columns: "marketplaces_pk_columns_input!",
      },
    },
    update_marketplaces_many: {
      __type: "[marketplaces_mutation_response]",
      __args: { updates: "[marketplaces_updates!]!" },
    },
    update_personal_information: {
      __type: "personal_information_mutation_response",
      __args: {
        _inc: "personal_information_inc_input",
        _set: "personal_information_set_input",
        where: "personal_information_bool_exp!",
      },
    },
    update_personal_information_many: {
      __type: "[personal_information_mutation_response]",
      __args: { updates: "[personal_information_updates!]!" },
    },
    update_service_accepted_payment: {
      __type: "service_accepted_payment_mutation_response",
      __args: {
        _inc: "service_accepted_payment_inc_input",
        _set: "service_accepted_payment_set_input",
        where: "service_accepted_payment_bool_exp!",
      },
    },
    update_service_accepted_payment_by_pk: {
      __type: "service_accepted_payment",
      __args: {
        _inc: "service_accepted_payment_inc_input",
        _set: "service_accepted_payment_set_input",
        pk_columns: "service_accepted_payment_pk_columns_input!",
      },
    },
    update_service_accepted_payment_many: {
      __type: "[service_accepted_payment_mutation_response]",
      __args: { updates: "[service_accepted_payment_updates!]!" },
    },
    update_service_type: {
      __type: "service_type_mutation_response",
      __args: {
        _set: "service_type_set_input",
        where: "service_type_bool_exp!",
      },
    },
    update_service_type_by_pk: {
      __type: "service_type",
      __args: {
        _set: "service_type_set_input",
        pk_columns: "service_type_pk_columns_input!",
      },
    },
    update_service_type_many: {
      __type: "[service_type_mutation_response]",
      __args: { updates: "[service_type_updates!]!" },
    },
    update_services: {
      __type: "services_mutation_response",
      __args: {
        _inc: "services_inc_input",
        _set: "services_set_input",
        where: "services_bool_exp!",
      },
    },
    update_services_by_pk: {
      __type: "services",
      __args: {
        _inc: "services_inc_input",
        _set: "services_set_input",
        pk_columns: "services_pk_columns_input!",
      },
    },
    update_services_images: {
      __type: "services_images_mutation_response",
      __args: {
        _inc: "services_images_inc_input",
        _set: "services_images_set_input",
        where: "services_images_bool_exp!",
      },
    },
    update_services_images_by_pk: {
      __type: "services_images",
      __args: {
        _inc: "services_images_inc_input",
        _set: "services_images_set_input",
        pk_columns: "services_images_pk_columns_input!",
      },
    },
    update_services_images_many: {
      __type: "[services_images_mutation_response]",
      __args: { updates: "[services_images_updates!]!" },
    },
    update_services_many: {
      __type: "[services_mutation_response]",
      __args: { updates: "[services_updates!]!" },
    },
    update_services_ratings: {
      __type: "services_ratings_mutation_response",
      __args: {
        _inc: "services_ratings_inc_input",
        _set: "services_ratings_set_input",
        where: "services_ratings_bool_exp!",
      },
    },
    update_services_ratings_by_pk: {
      __type: "services_ratings",
      __args: {
        _inc: "services_ratings_inc_input",
        _set: "services_ratings_set_input",
        pk_columns: "services_ratings_pk_columns_input!",
      },
    },
    update_services_ratings_many: {
      __type: "[services_ratings_mutation_response]",
      __args: { updates: "[services_ratings_updates!]!" },
    },
    update_till: {
      __type: "till_mutation_response",
      __args: {
        _inc: "till_inc_input",
        _set: "till_set_input",
        where: "till_bool_exp!",
      },
    },
    update_till_by_pk: {
      __type: "till",
      __args: {
        _inc: "till_inc_input",
        _set: "till_set_input",
        pk_columns: "till_pk_columns_input!",
      },
    },
    update_till_many: {
      __type: "[till_mutation_response]",
      __args: { updates: "[till_updates!]!" },
    },
    update_transactions: {
      __type: "transactions_mutation_response",
      __args: {
        _inc: "transactions_inc_input",
        _set: "transactions_set_input",
        where: "transactions_bool_exp!",
      },
    },
    update_transactions_by_pk: {
      __type: "transactions",
      __args: {
        _inc: "transactions_inc_input",
        _set: "transactions_set_input",
        pk_columns: "transactions_pk_columns_input!",
      },
    },
    update_transactions_many: {
      __type: "[transactions_mutation_response]",
      __args: { updates: "[transactions_updates!]!" },
    },
    update_tx_type: {
      __type: "tx_type_mutation_response",
      __args: { _set: "tx_type_set_input", where: "tx_type_bool_exp!" },
    },
    update_tx_type_by_pk: {
      __type: "tx_type",
      __args: {
        _set: "tx_type_set_input",
        pk_columns: "tx_type_pk_columns_input!",
      },
    },
    update_tx_type_many: {
      __type: "[tx_type_mutation_response]",
      __args: { updates: "[tx_type_updates!]!" },
    },
    update_users: {
      __type: "users_mutation_response",
      __args: { _set: "users_set_input", where: "users_bool_exp!" },
    },
    update_users_by_pk: {
      __type: "users",
      __args: {
        _set: "users_set_input",
        pk_columns: "users_pk_columns_input!",
      },
    },
    update_users_many: {
      __type: "[users_mutation_response]",
      __args: { updates: "[users_updates!]!" },
    },
    update_voucher_certifications: {
      __type: "voucher_certifications_mutation_response",
      __args: {
        _inc: "voucher_certifications_inc_input",
        _set: "voucher_certifications_set_input",
        where: "voucher_certifications_bool_exp!",
      },
    },
    update_voucher_certifications_by_pk: {
      __type: "voucher_certifications",
      __args: {
        _inc: "voucher_certifications_inc_input",
        _set: "voucher_certifications_set_input",
        pk_columns: "voucher_certifications_pk_columns_input!",
      },
    },
    update_voucher_certifications_many: {
      __type: "[voucher_certifications_mutation_response]",
      __args: { updates: "[voucher_certifications_updates!]!" },
    },
    update_voucher_issuers: {
      __type: "voucher_issuers_mutation_response",
      __args: {
        _inc: "voucher_issuers_inc_input",
        _set: "voucher_issuers_set_input",
        where: "voucher_issuers_bool_exp!",
      },
    },
    update_voucher_issuers_by_pk: {
      __type: "voucher_issuers",
      __args: {
        _inc: "voucher_issuers_inc_input",
        _set: "voucher_issuers_set_input",
        pk_columns: "voucher_issuers_pk_columns_input!",
      },
    },
    update_voucher_issuers_many: {
      __type: "[voucher_issuers_mutation_response]",
      __args: { updates: "[voucher_issuers_updates!]!" },
    },
    update_vouchers: {
      __type: "vouchers_mutation_response",
      __args: {
        _inc: "vouchers_inc_input",
        _set: "vouchers_set_input",
        where: "vouchers_bool_exp!",
      },
    },
    update_vouchers_by_pk: {
      __type: "vouchers",
      __args: {
        _inc: "vouchers_inc_input",
        _set: "vouchers_set_input",
        pk_columns: "vouchers_pk_columns_input!",
      },
    },
    update_vouchers_many: {
      __type: "[vouchers_mutation_response]",
      __args: { updates: "[vouchers_updates!]!" },
    },
    update_vpa: {
      __type: "vpa_mutation_response",
      __args: {
        _inc: "vpa_inc_input",
        _set: "vpa_set_input",
        where: "vpa_bool_exp!",
      },
    },
    update_vpa_by_pk: {
      __type: "vpa",
      __args: {
        _inc: "vpa_inc_input",
        _set: "vpa_set_input",
        pk_columns: "vpa_pk_columns_input!",
      },
    },
    update_vpa_many: {
      __type: "[vpa_mutation_response]",
      __args: { updates: "[vpa_updates!]!" },
    },
  },
  numeric_comparison_exp: {
    _eq: { __type: "numeric" },
    _gt: { __type: "numeric" },
    _gte: { __type: "numeric" },
    _in: { __type: "[numeric!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "numeric" },
    _lte: { __type: "numeric" },
    _neq: { __type: "numeric" },
    _nin: { __type: "[numeric!]" },
  },
  personal_information: {
    __typename: { __type: "String!" },
    family_name: { __type: "String" },
    gender: { __type: "gender_type_enum" },
    gender_type: { __type: "gender_type" },
    geo: { __type: "point" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user: { __type: "users!" },
    user_identifier: { __type: "Int!" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "personal_information_aggregate_fields" },
    nodes: { __type: "[personal_information!]!" },
  },
  personal_information_aggregate_bool_exp: {
    count: { __type: "personal_information_aggregate_bool_exp_count" },
  },
  personal_information_aggregate_bool_exp_count: {
    arguments: { __type: "[personal_information_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "personal_information_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  personal_information_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "personal_information_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[personal_information_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "personal_information_max_fields" },
    min: { __type: "personal_information_min_fields" },
    stddev: { __type: "personal_information_stddev_fields" },
    stddev_pop: { __type: "personal_information_stddev_pop_fields" },
    stddev_samp: { __type: "personal_information_stddev_samp_fields" },
    sum: { __type: "personal_information_sum_fields" },
    var_pop: { __type: "personal_information_var_pop_fields" },
    var_samp: { __type: "personal_information_var_samp_fields" },
    variance: { __type: "personal_information_variance_fields" },
  },
  personal_information_aggregate_order_by: {
    avg: { __type: "personal_information_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "personal_information_max_order_by" },
    min: { __type: "personal_information_min_order_by" },
    stddev: { __type: "personal_information_stddev_order_by" },
    stddev_pop: { __type: "personal_information_stddev_pop_order_by" },
    stddev_samp: { __type: "personal_information_stddev_samp_order_by" },
    sum: { __type: "personal_information_sum_order_by" },
    var_pop: { __type: "personal_information_var_pop_order_by" },
    var_samp: { __type: "personal_information_var_samp_order_by" },
    variance: { __type: "personal_information_variance_order_by" },
  },
  personal_information_arr_rel_insert_input: {
    data: { __type: "[personal_information_insert_input!]!" },
    on_conflict: { __type: "personal_information_on_conflict" },
  },
  personal_information_avg_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_avg_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_bool_exp: {
    _and: { __type: "[personal_information_bool_exp!]" },
    _not: { __type: "personal_information_bool_exp" },
    _or: { __type: "[personal_information_bool_exp!]" },
    family_name: { __type: "String_comparison_exp" },
    gender: { __type: "gender_type_enum_comparison_exp" },
    gender_type: { __type: "gender_type_bool_exp" },
    geo: { __type: "point_comparison_exp" },
    given_names: { __type: "String_comparison_exp" },
    language_code: { __type: "String_comparison_exp" },
    location_name: { __type: "String_comparison_exp" },
    user: { __type: "users_bool_exp" },
    user_identifier: { __type: "Int_comparison_exp" },
    year_of_birth: { __type: "Int_comparison_exp" },
  },
  personal_information_inc_input: {
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_insert_input: {
    family_name: { __type: "String" },
    gender: { __type: "gender_type_enum" },
    gender_type: { __type: "gender_type_obj_rel_insert_input" },
    geo: { __type: "point" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user: { __type: "users_obj_rel_insert_input" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_max_fields: {
    __typename: { __type: "String!" },
    family_name: { __type: "String" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_max_order_by: {
    family_name: { __type: "order_by" },
    given_names: { __type: "order_by" },
    language_code: { __type: "order_by" },
    location_name: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_min_fields: {
    __typename: { __type: "String!" },
    family_name: { __type: "String" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_min_order_by: {
    family_name: { __type: "order_by" },
    given_names: { __type: "order_by" },
    language_code: { __type: "order_by" },
    location_name: { __type: "order_by" },
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[personal_information!]!" },
  },
  personal_information_obj_rel_insert_input: {
    data: { __type: "personal_information_insert_input!" },
    on_conflict: { __type: "personal_information_on_conflict" },
  },
  personal_information_on_conflict: {
    constraint: { __type: "personal_information_constraint!" },
    update_columns: { __type: "[personal_information_update_column!]!" },
    where: { __type: "personal_information_bool_exp" },
  },
  personal_information_order_by: {
    family_name: { __type: "order_by" },
    gender: { __type: "order_by" },
    gender_type: { __type: "gender_type_order_by" },
    geo: { __type: "order_by" },
    given_names: { __type: "order_by" },
    language_code: { __type: "order_by" },
    location_name: { __type: "order_by" },
    user: { __type: "users_order_by" },
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_set_input: {
    family_name: { __type: "String" },
    gender: { __type: "gender_type_enum" },
    geo: { __type: "point" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_stddev_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_stddev_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_stddev_pop_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_stddev_pop_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_stddev_samp_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_stddev_samp_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_stream_cursor_input: {
    initial_value: {
      __type: "personal_information_stream_cursor_value_input!",
    },
    ordering: { __type: "cursor_ordering" },
  },
  personal_information_stream_cursor_value_input: {
    family_name: { __type: "String" },
    gender: { __type: "gender_type_enum" },
    geo: { __type: "point" },
    given_names: { __type: "String" },
    language_code: { __type: "String" },
    location_name: { __type: "String" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_sum_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Int" },
    year_of_birth: { __type: "Int" },
  },
  personal_information_sum_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_updates: {
    _inc: { __type: "personal_information_inc_input" },
    _set: { __type: "personal_information_set_input" },
    where: { __type: "personal_information_bool_exp!" },
  },
  personal_information_var_pop_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_var_pop_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_var_samp_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_var_samp_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  personal_information_variance_fields: {
    __typename: { __type: "String!" },
    user_identifier: { __type: "Float" },
    year_of_birth: { __type: "Float" },
  },
  personal_information_variance_order_by: {
    user_identifier: { __type: "order_by" },
    year_of_birth: { __type: "order_by" },
  },
  point_comparison_exp: {
    _eq: { __type: "point" },
    _gt: { __type: "point" },
    _gte: { __type: "point" },
    _in: { __type: "[point!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "point" },
    _lte: { __type: "point" },
    _neq: { __type: "point" },
    _nin: { __type: "[point!]" },
  },
  query: {
    __typename: { __type: "String!" },
    account_type: {
      __type: "[account_type!]!",
      __args: {
        distinct_on: "[account_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[account_type_order_by!]",
        where: "account_type_bool_exp",
      },
    },
    account_type_aggregate: {
      __type: "account_type_aggregate!",
      __args: {
        distinct_on: "[account_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[account_type_order_by!]",
        where: "account_type_bool_exp",
      },
    },
    account_type_by_pk: {
      __type: "account_type",
      __args: { value: "String!" },
    },
    accounts: {
      __type: "[accounts!]!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_aggregate: {
      __type: "accounts_aggregate!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_by_pk: { __type: "accounts", __args: { id: "Int!" } },
    gender_type: {
      __type: "[gender_type!]!",
      __args: {
        distinct_on: "[gender_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[gender_type_order_by!]",
        where: "gender_type_bool_exp",
      },
    },
    gender_type_aggregate: {
      __type: "gender_type_aggregate!",
      __args: {
        distinct_on: "[gender_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[gender_type_order_by!]",
        where: "gender_type_bool_exp",
      },
    },
    gender_type_by_pk: { __type: "gender_type", __args: { value: "String!" } },
    interface_type: {
      __type: "[interface_type!]!",
      __args: {
        distinct_on: "[interface_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[interface_type_order_by!]",
        where: "interface_type_bool_exp",
      },
    },
    interface_type_aggregate: {
      __type: "interface_type_aggregate!",
      __args: {
        distinct_on: "[interface_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[interface_type_order_by!]",
        where: "interface_type_bool_exp",
      },
    },
    interface_type_by_pk: {
      __type: "interface_type",
      __args: { value: "String!" },
    },
    marketplaces: {
      __type: "[marketplaces!]!",
      __args: {
        distinct_on: "[marketplaces_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[marketplaces_order_by!]",
        where: "marketplaces_bool_exp",
      },
    },
    marketplaces_aggregate: {
      __type: "marketplaces_aggregate!",
      __args: {
        distinct_on: "[marketplaces_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[marketplaces_order_by!]",
        where: "marketplaces_bool_exp",
      },
    },
    marketplaces_by_pk: { __type: "marketplaces", __args: { id: "Int!" } },
    personal_information: {
      __type: "[personal_information!]!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    personal_information_aggregate: {
      __type: "personal_information_aggregate!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    service_accepted_payment: {
      __type: "[service_accepted_payment!]!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_accepted_payment_aggregate: {
      __type: "service_accepted_payment_aggregate!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_accepted_payment_by_pk: {
      __type: "service_accepted_payment",
      __args: { id: "Int!" },
    },
    service_type: {
      __type: "[service_type!]!",
      __args: {
        distinct_on: "[service_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_type_order_by!]",
        where: "service_type_bool_exp",
      },
    },
    service_type_aggregate: {
      __type: "service_type_aggregate!",
      __args: {
        distinct_on: "[service_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_type_order_by!]",
        where: "service_type_bool_exp",
      },
    },
    service_type_by_pk: {
      __type: "service_type",
      __args: { value: "String!" },
    },
    services: {
      __type: "[services!]!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_aggregate: {
      __type: "services_aggregate!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_by_pk: { __type: "services", __args: { id: "Int!" } },
    services_images: {
      __type: "[services_images!]!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_images_aggregate: {
      __type: "services_images_aggregate!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_images_by_pk: {
      __type: "services_images",
      __args: { id: "Int!" },
    },
    services_ratings: {
      __type: "[services_ratings!]!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_by_pk: {
      __type: "services_ratings",
      __args: { id: "Int!" },
    },
    till: {
      __type: "[till!]!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    till_aggregate: {
      __type: "till_aggregate!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    till_by_pk: { __type: "till", __args: { id: "Int!" } },
    transactions: {
      __type: "[transactions!]!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_aggregate: {
      __type: "transactions_aggregate!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_by_pk: { __type: "transactions", __args: { id: "Int!" } },
    tx_type: {
      __type: "[tx_type!]!",
      __args: {
        distinct_on: "[tx_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[tx_type_order_by!]",
        where: "tx_type_bool_exp",
      },
    },
    tx_type_aggregate: {
      __type: "tx_type_aggregate!",
      __args: {
        distinct_on: "[tx_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[tx_type_order_by!]",
        where: "tx_type_bool_exp",
      },
    },
    tx_type_by_pk: { __type: "tx_type", __args: { value: "String!" } },
    users: {
      __type: "[users!]!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    users_aggregate: {
      __type: "users_aggregate!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    users_by_pk: { __type: "users", __args: { id: "Int!" } },
    voucher_certifications: {
      __type: "[voucher_certifications!]!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_by_pk: {
      __type: "voucher_certifications",
      __args: { id: "Int!" },
    },
    voucher_issuers: {
      __type: "[voucher_issuers!]!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_issuers_aggregate: {
      __type: "voucher_issuers_aggregate!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_issuers_by_pk: {
      __type: "voucher_issuers",
      __args: { id: "Int!" },
    },
    vouchers: {
      __type: "[vouchers!]!",
      __args: {
        distinct_on: "[vouchers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vouchers_order_by!]",
        where: "vouchers_bool_exp",
      },
    },
    vouchers_aggregate: {
      __type: "vouchers_aggregate!",
      __args: {
        distinct_on: "[vouchers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vouchers_order_by!]",
        where: "vouchers_bool_exp",
      },
    },
    vouchers_by_pk: { __type: "vouchers", __args: { id: "Int!" } },
    vpa: {
      __type: "[vpa!]!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
    vpa_aggregate: {
      __type: "vpa_aggregate!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
    vpa_by_pk: { __type: "vpa", __args: { id: "Int!" } },
  },
  service_accepted_payment: {
    __typename: { __type: "String!" },
    id: { __type: "Int!" },
    price: { __type: "float8!" },
    services: {
      __type: "[services!]!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_aggregate: {
      __type: "services_aggregate!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    voucher: { __type: "Int!" },
    voucherByVoucher: { __type: "vouchers!" },
  },
  service_accepted_payment_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "service_accepted_payment_aggregate_fields" },
    nodes: { __type: "[service_accepted_payment!]!" },
  },
  service_accepted_payment_aggregate_bool_exp: {
    avg: { __type: "service_accepted_payment_aggregate_bool_exp_avg" },
    corr: { __type: "service_accepted_payment_aggregate_bool_exp_corr" },
    count: { __type: "service_accepted_payment_aggregate_bool_exp_count" },
    covar_samp: {
      __type: "service_accepted_payment_aggregate_bool_exp_covar_samp",
    },
    max: { __type: "service_accepted_payment_aggregate_bool_exp_max" },
    min: { __type: "service_accepted_payment_aggregate_bool_exp_min" },
    stddev_samp: {
      __type: "service_accepted_payment_aggregate_bool_exp_stddev_samp",
    },
    sum: { __type: "service_accepted_payment_aggregate_bool_exp_sum" },
    var_samp: {
      __type: "service_accepted_payment_aggregate_bool_exp_var_samp",
    },
  },
  service_accepted_payment_aggregate_bool_exp_avg: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_corr: {
    arguments: {
      __type: "service_accepted_payment_aggregate_bool_exp_corr_arguments!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_corr_arguments: {
    X: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns!",
    },
    Y: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns!",
    },
  },
  service_accepted_payment_aggregate_bool_exp_count: {
    arguments: { __type: "[service_accepted_payment_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_covar_samp: {
    arguments: {
      __type:
        "service_accepted_payment_aggregate_bool_exp_covar_samp_arguments!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_covar_samp_arguments: {
    X: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns!",
    },
    Y: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns!",
    },
  },
  service_accepted_payment_aggregate_bool_exp_max: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_min: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_stddev_samp: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_sum: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_bool_exp_var_samp: {
    arguments: {
      __type:
        "service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "service_accepted_payment_bool_exp" },
    predicate: { __type: "float8_comparison_exp!" },
  },
  service_accepted_payment_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "service_accepted_payment_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[service_accepted_payment_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "service_accepted_payment_max_fields" },
    min: { __type: "service_accepted_payment_min_fields" },
    stddev: { __type: "service_accepted_payment_stddev_fields" },
    stddev_pop: { __type: "service_accepted_payment_stddev_pop_fields" },
    stddev_samp: { __type: "service_accepted_payment_stddev_samp_fields" },
    sum: { __type: "service_accepted_payment_sum_fields" },
    var_pop: { __type: "service_accepted_payment_var_pop_fields" },
    var_samp: { __type: "service_accepted_payment_var_samp_fields" },
    variance: { __type: "service_accepted_payment_variance_fields" },
  },
  service_accepted_payment_aggregate_order_by: {
    avg: { __type: "service_accepted_payment_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "service_accepted_payment_max_order_by" },
    min: { __type: "service_accepted_payment_min_order_by" },
    stddev: { __type: "service_accepted_payment_stddev_order_by" },
    stddev_pop: { __type: "service_accepted_payment_stddev_pop_order_by" },
    stddev_samp: { __type: "service_accepted_payment_stddev_samp_order_by" },
    sum: { __type: "service_accepted_payment_sum_order_by" },
    var_pop: { __type: "service_accepted_payment_var_pop_order_by" },
    var_samp: { __type: "service_accepted_payment_var_samp_order_by" },
    variance: { __type: "service_accepted_payment_variance_order_by" },
  },
  service_accepted_payment_arr_rel_insert_input: {
    data: { __type: "[service_accepted_payment_insert_input!]!" },
    on_conflict: { __type: "service_accepted_payment_on_conflict" },
  },
  service_accepted_payment_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_avg_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_bool_exp: {
    _and: { __type: "[service_accepted_payment_bool_exp!]" },
    _not: { __type: "service_accepted_payment_bool_exp" },
    _or: { __type: "[service_accepted_payment_bool_exp!]" },
    id: { __type: "Int_comparison_exp" },
    price: { __type: "float8_comparison_exp" },
    services: { __type: "services_bool_exp" },
    services_aggregate: { __type: "services_aggregate_bool_exp" },
    voucher: { __type: "Int_comparison_exp" },
    voucherByVoucher: { __type: "vouchers_bool_exp" },
  },
  service_accepted_payment_inc_input: {
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_insert_input: {
    price: { __type: "float8" },
    services: { __type: "services_arr_rel_insert_input" },
    voucher: { __type: "Int" },
    voucherByVoucher: { __type: "vouchers_obj_rel_insert_input" },
  },
  service_accepted_payment_max_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_max_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_min_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_min_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[service_accepted_payment!]!" },
  },
  service_accepted_payment_obj_rel_insert_input: {
    data: { __type: "service_accepted_payment_insert_input!" },
    on_conflict: { __type: "service_accepted_payment_on_conflict" },
  },
  service_accepted_payment_on_conflict: {
    constraint: { __type: "service_accepted_payment_constraint!" },
    update_columns: { __type: "[service_accepted_payment_update_column!]!" },
    where: { __type: "service_accepted_payment_bool_exp" },
  },
  service_accepted_payment_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    services_aggregate: { __type: "services_aggregate_order_by" },
    voucher: { __type: "order_by" },
    voucherByVoucher: { __type: "vouchers_order_by" },
  },
  service_accepted_payment_pk_columns_input: { id: { __type: "Int!" } },
  service_accepted_payment_set_input: {
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_stddev_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_stddev_pop_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_stddev_samp_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_stream_cursor_input: {
    initial_value: {
      __type: "service_accepted_payment_stream_cursor_value_input!",
    },
    ordering: { __type: "cursor_ordering" },
  },
  service_accepted_payment_stream_cursor_value_input: {
    id: { __type: "Int" },
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    price: { __type: "float8" },
    voucher: { __type: "Int" },
  },
  service_accepted_payment_sum_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_updates: {
    _inc: { __type: "service_accepted_payment_inc_input" },
    _set: { __type: "service_accepted_payment_set_input" },
    where: { __type: "service_accepted_payment_bool_exp!" },
  },
  service_accepted_payment_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_var_pop_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_var_samp_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_accepted_payment_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    price: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  service_accepted_payment_variance_order_by: {
    id: { __type: "order_by" },
    price: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  service_type: {
    __typename: { __type: "String!" },
    services: {
      __type: "[services!]!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_aggregate: {
      __type: "services_aggregate!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    value: { __type: "String!" },
  },
  service_type_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "service_type_aggregate_fields" },
    nodes: { __type: "[service_type!]!" },
  },
  service_type_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: { columns: "[service_type_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "service_type_max_fields" },
    min: { __type: "service_type_min_fields" },
  },
  service_type_bool_exp: {
    _and: { __type: "[service_type_bool_exp!]" },
    _not: { __type: "service_type_bool_exp" },
    _or: { __type: "[service_type_bool_exp!]" },
    services: { __type: "services_bool_exp" },
    services_aggregate: { __type: "services_aggregate_bool_exp" },
    value: { __type: "String_comparison_exp" },
  },
  service_type_enum_comparison_exp: {
    _eq: { __type: "service_type_enum" },
    _in: { __type: "[service_type_enum!]" },
    _is_null: { __type: "Boolean" },
    _neq: { __type: "service_type_enum" },
    _nin: { __type: "[service_type_enum!]" },
  },
  service_type_insert_input: {
    services: { __type: "services_arr_rel_insert_input" },
    value: { __type: "String" },
  },
  service_type_max_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  service_type_min_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  service_type_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[service_type!]!" },
  },
  service_type_obj_rel_insert_input: {
    data: { __type: "service_type_insert_input!" },
    on_conflict: { __type: "service_type_on_conflict" },
  },
  service_type_on_conflict: {
    constraint: { __type: "service_type_constraint!" },
    update_columns: { __type: "[service_type_update_column!]!" },
    where: { __type: "service_type_bool_exp" },
  },
  service_type_order_by: {
    services_aggregate: { __type: "services_aggregate_order_by" },
    value: { __type: "order_by" },
  },
  service_type_pk_columns_input: { value: { __type: "String!" } },
  service_type_set_input: { value: { __type: "String" } },
  service_type_stream_cursor_input: {
    initial_value: { __type: "service_type_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  service_type_stream_cursor_value_input: { value: { __type: "String" } },
  service_type_updates: {
    _set: { __type: "service_type_set_input" },
    where: { __type: "service_type_bool_exp!" },
  },
  services: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp!" },
    geo: { __type: "point" },
    id: { __type: "Int!" },
    location_name: { __type: "String!" },
    marketplace: { __type: "Int!" },
    marketplaceByMarketplace: { __type: "marketplaces!" },
    serviceAcceptedPaymentByServiceAcceptedPayment: {
      __type: "service_accepted_payment!",
    },
    serviceTypeByServiceType: { __type: "service_type!" },
    service_accepted_payment: { __type: "Int!" },
    service_available: { __type: "Boolean" },
    service_description: { __type: "String!" },
    service_type: { __type: "service_type_enum!" },
    services_images: {
      __type: "[services_images!]!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_images_aggregate: {
      __type: "services_images_aggregate!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_ratings: {
      __type: "[services_ratings!]!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
  },
  services_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "services_aggregate_fields" },
    nodes: { __type: "[services!]!" },
  },
  services_aggregate_bool_exp: {
    bool_and: { __type: "services_aggregate_bool_exp_bool_and" },
    bool_or: { __type: "services_aggregate_bool_exp_bool_or" },
    count: { __type: "services_aggregate_bool_exp_count" },
  },
  services_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        "services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "services_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  services_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        "services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "services_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  services_aggregate_bool_exp_count: {
    arguments: { __type: "[services_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "services_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  services_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "services_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[services_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "services_max_fields" },
    min: { __type: "services_min_fields" },
    stddev: { __type: "services_stddev_fields" },
    stddev_pop: { __type: "services_stddev_pop_fields" },
    stddev_samp: { __type: "services_stddev_samp_fields" },
    sum: { __type: "services_sum_fields" },
    var_pop: { __type: "services_var_pop_fields" },
    var_samp: { __type: "services_var_samp_fields" },
    variance: { __type: "services_variance_fields" },
  },
  services_aggregate_order_by: {
    avg: { __type: "services_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "services_max_order_by" },
    min: { __type: "services_min_order_by" },
    stddev: { __type: "services_stddev_order_by" },
    stddev_pop: { __type: "services_stddev_pop_order_by" },
    stddev_samp: { __type: "services_stddev_samp_order_by" },
    sum: { __type: "services_sum_order_by" },
    var_pop: { __type: "services_var_pop_order_by" },
    var_samp: { __type: "services_var_samp_order_by" },
    variance: { __type: "services_variance_order_by" },
  },
  services_arr_rel_insert_input: {
    data: { __type: "[services_insert_input!]!" },
    on_conflict: { __type: "services_on_conflict" },
  },
  services_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_avg_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_bool_exp: {
    _and: { __type: "[services_bool_exp!]" },
    _not: { __type: "services_bool_exp" },
    _or: { __type: "[services_bool_exp!]" },
    created_at: { __type: "timestamp_comparison_exp" },
    geo: { __type: "point_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    location_name: { __type: "String_comparison_exp" },
    marketplace: { __type: "Int_comparison_exp" },
    marketplaceByMarketplace: { __type: "marketplaces_bool_exp" },
    serviceAcceptedPaymentByServiceAcceptedPayment: {
      __type: "service_accepted_payment_bool_exp",
    },
    serviceTypeByServiceType: { __type: "service_type_bool_exp" },
    service_accepted_payment: { __type: "Int_comparison_exp" },
    service_available: { __type: "Boolean_comparison_exp" },
    service_description: { __type: "String_comparison_exp" },
    service_type: { __type: "service_type_enum_comparison_exp" },
    services_images: { __type: "services_images_bool_exp" },
    services_images_aggregate: { __type: "services_images_aggregate_bool_exp" },
    services_ratings: { __type: "services_ratings_bool_exp" },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate_bool_exp",
    },
  },
  services_images: {
    __typename: { __type: "String!" },
    id: { __type: "Int!" },
    service: { __type: "services" },
    service_id: { __type: "Int" },
    url_pointer: { __type: "String!" },
  },
  services_images_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "services_images_aggregate_fields" },
    nodes: { __type: "[services_images!]!" },
  },
  services_images_aggregate_bool_exp: {
    count: { __type: "services_images_aggregate_bool_exp_count" },
  },
  services_images_aggregate_bool_exp_count: {
    arguments: { __type: "[services_images_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "services_images_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  services_images_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "services_images_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[services_images_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "services_images_max_fields" },
    min: { __type: "services_images_min_fields" },
    stddev: { __type: "services_images_stddev_fields" },
    stddev_pop: { __type: "services_images_stddev_pop_fields" },
    stddev_samp: { __type: "services_images_stddev_samp_fields" },
    sum: { __type: "services_images_sum_fields" },
    var_pop: { __type: "services_images_var_pop_fields" },
    var_samp: { __type: "services_images_var_samp_fields" },
    variance: { __type: "services_images_variance_fields" },
  },
  services_images_aggregate_order_by: {
    avg: { __type: "services_images_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "services_images_max_order_by" },
    min: { __type: "services_images_min_order_by" },
    stddev: { __type: "services_images_stddev_order_by" },
    stddev_pop: { __type: "services_images_stddev_pop_order_by" },
    stddev_samp: { __type: "services_images_stddev_samp_order_by" },
    sum: { __type: "services_images_sum_order_by" },
    var_pop: { __type: "services_images_var_pop_order_by" },
    var_samp: { __type: "services_images_var_samp_order_by" },
    variance: { __type: "services_images_variance_order_by" },
  },
  services_images_arr_rel_insert_input: {
    data: { __type: "[services_images_insert_input!]!" },
    on_conflict: { __type: "services_images_on_conflict" },
  },
  services_images_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_avg_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_bool_exp: {
    _and: { __type: "[services_images_bool_exp!]" },
    _not: { __type: "services_images_bool_exp" },
    _or: { __type: "[services_images_bool_exp!]" },
    id: { __type: "Int_comparison_exp" },
    service: { __type: "services_bool_exp" },
    service_id: { __type: "Int_comparison_exp" },
    url_pointer: { __type: "String_comparison_exp" },
  },
  services_images_inc_input: { service_id: { __type: "Int" } },
  services_images_insert_input: {
    service: { __type: "services_obj_rel_insert_input" },
    service_id: { __type: "Int" },
    url_pointer: { __type: "String" },
  },
  services_images_max_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    service_id: { __type: "Int" },
    url_pointer: { __type: "String" },
  },
  services_images_max_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
    url_pointer: { __type: "order_by" },
  },
  services_images_min_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    service_id: { __type: "Int" },
    url_pointer: { __type: "String" },
  },
  services_images_min_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
    url_pointer: { __type: "order_by" },
  },
  services_images_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[services_images!]!" },
  },
  services_images_on_conflict: {
    constraint: { __type: "services_images_constraint!" },
    update_columns: { __type: "[services_images_update_column!]!" },
    where: { __type: "services_images_bool_exp" },
  },
  services_images_order_by: {
    id: { __type: "order_by" },
    service: { __type: "services_order_by" },
    service_id: { __type: "order_by" },
    url_pointer: { __type: "order_by" },
  },
  services_images_pk_columns_input: { id: { __type: "Int!" } },
  services_images_set_input: {
    service_id: { __type: "Int" },
    url_pointer: { __type: "String" },
  },
  services_images_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_stddev_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_stddev_pop_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_stddev_samp_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_stream_cursor_input: {
    initial_value: { __type: "services_images_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  services_images_stream_cursor_value_input: {
    id: { __type: "Int" },
    service_id: { __type: "Int" },
    url_pointer: { __type: "String" },
  },
  services_images_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_images_sum_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_updates: {
    _inc: { __type: "services_images_inc_input" },
    _set: { __type: "services_images_set_input" },
    where: { __type: "services_images_bool_exp!" },
  },
  services_images_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_var_pop_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_var_samp_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_images_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_images_variance_order_by: {
    id: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_inc_input: {
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
  },
  services_insert_input: {
    created_at: { __type: "timestamp" },
    geo: { __type: "point" },
    location_name: { __type: "String" },
    marketplace: { __type: "Int" },
    marketplaceByMarketplace: { __type: "marketplaces_obj_rel_insert_input" },
    serviceAcceptedPaymentByServiceAcceptedPayment: {
      __type: "service_accepted_payment_obj_rel_insert_input",
    },
    serviceTypeByServiceType: { __type: "service_type_obj_rel_insert_input" },
    service_accepted_payment: { __type: "Int" },
    service_available: { __type: "Boolean" },
    service_description: { __type: "String" },
    service_type: { __type: "service_type_enum" },
    services_images: { __type: "services_images_arr_rel_insert_input" },
    services_ratings: { __type: "services_ratings_arr_rel_insert_input" },
  },
  services_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
    service_description: { __type: "String" },
  },
  services_max_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    location_name: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
    service_description: { __type: "order_by" },
  },
  services_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
    service_description: { __type: "String" },
  },
  services_min_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    location_name: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
    service_description: { __type: "order_by" },
  },
  services_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[services!]!" },
  },
  services_obj_rel_insert_input: {
    data: { __type: "services_insert_input!" },
    on_conflict: { __type: "services_on_conflict" },
  },
  services_on_conflict: {
    constraint: { __type: "services_constraint!" },
    update_columns: { __type: "[services_update_column!]!" },
    where: { __type: "services_bool_exp" },
  },
  services_order_by: {
    created_at: { __type: "order_by" },
    geo: { __type: "order_by" },
    id: { __type: "order_by" },
    location_name: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    marketplaceByMarketplace: { __type: "marketplaces_order_by" },
    serviceAcceptedPaymentByServiceAcceptedPayment: {
      __type: "service_accepted_payment_order_by",
    },
    serviceTypeByServiceType: { __type: "service_type_order_by" },
    service_accepted_payment: { __type: "order_by" },
    service_available: { __type: "order_by" },
    service_description: { __type: "order_by" },
    service_type: { __type: "order_by" },
    services_images_aggregate: { __type: "services_images_aggregate_order_by" },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate_order_by",
    },
  },
  services_pk_columns_input: { id: { __type: "Int!" } },
  services_ratings: {
    __typename: { __type: "String!" },
    account: { __type: "accounts!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    rating_by: { __type: "Int!" },
    score: { __type: "Int!" },
    service: { __type: "services!" },
    service_id: { __type: "Int!" },
  },
  services_ratings_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "services_ratings_aggregate_fields" },
    nodes: { __type: "[services_ratings!]!" },
  },
  services_ratings_aggregate_bool_exp: {
    count: { __type: "services_ratings_aggregate_bool_exp_count" },
  },
  services_ratings_aggregate_bool_exp_count: {
    arguments: { __type: "[services_ratings_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "services_ratings_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  services_ratings_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "services_ratings_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[services_ratings_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "services_ratings_max_fields" },
    min: { __type: "services_ratings_min_fields" },
    stddev: { __type: "services_ratings_stddev_fields" },
    stddev_pop: { __type: "services_ratings_stddev_pop_fields" },
    stddev_samp: { __type: "services_ratings_stddev_samp_fields" },
    sum: { __type: "services_ratings_sum_fields" },
    var_pop: { __type: "services_ratings_var_pop_fields" },
    var_samp: { __type: "services_ratings_var_samp_fields" },
    variance: { __type: "services_ratings_variance_fields" },
  },
  services_ratings_aggregate_order_by: {
    avg: { __type: "services_ratings_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "services_ratings_max_order_by" },
    min: { __type: "services_ratings_min_order_by" },
    stddev: { __type: "services_ratings_stddev_order_by" },
    stddev_pop: { __type: "services_ratings_stddev_pop_order_by" },
    stddev_samp: { __type: "services_ratings_stddev_samp_order_by" },
    sum: { __type: "services_ratings_sum_order_by" },
    var_pop: { __type: "services_ratings_var_pop_order_by" },
    var_samp: { __type: "services_ratings_var_samp_order_by" },
    variance: { __type: "services_ratings_variance_order_by" },
  },
  services_ratings_arr_rel_insert_input: {
    data: { __type: "[services_ratings_insert_input!]!" },
    on_conflict: { __type: "services_ratings_on_conflict" },
  },
  services_ratings_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_avg_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_bool_exp: {
    _and: { __type: "[services_ratings_bool_exp!]" },
    _not: { __type: "services_ratings_bool_exp" },
    _or: { __type: "[services_ratings_bool_exp!]" },
    account: { __type: "accounts_bool_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    rating_by: { __type: "Int_comparison_exp" },
    score: { __type: "Int_comparison_exp" },
    service: { __type: "services_bool_exp" },
    service_id: { __type: "Int_comparison_exp" },
  },
  services_ratings_inc_input: {
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_insert_input: {
    account: { __type: "accounts_obj_rel_insert_input" },
    created_at: { __type: "timestamp" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service: { __type: "services_obj_rel_insert_input" },
    service_id: { __type: "Int" },
  },
  services_ratings_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_max_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_min_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[services_ratings!]!" },
  },
  services_ratings_on_conflict: {
    constraint: { __type: "services_ratings_constraint!" },
    update_columns: { __type: "[services_ratings_update_column!]!" },
    where: { __type: "services_ratings_bool_exp" },
  },
  services_ratings_order_by: {
    account: { __type: "accounts_order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service: { __type: "services_order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_pk_columns_input: { id: { __type: "Int!" } },
  services_ratings_set_input: {
    created_at: { __type: "timestamp" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_stddev_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_stddev_pop_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_stddev_samp_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_stream_cursor_input: {
    initial_value: { __type: "services_ratings_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  services_ratings_stream_cursor_value_input: {
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    rating_by: { __type: "Int" },
    score: { __type: "Int" },
    service_id: { __type: "Int" },
  },
  services_ratings_sum_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_updates: {
    _inc: { __type: "services_ratings_inc_input" },
    _set: { __type: "services_ratings_set_input" },
    where: { __type: "services_ratings_bool_exp!" },
  },
  services_ratings_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_var_pop_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_var_samp_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_ratings_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    rating_by: { __type: "Float" },
    score: { __type: "Float" },
    service_id: { __type: "Float" },
  },
  services_ratings_variance_order_by: {
    id: { __type: "order_by" },
    rating_by: { __type: "order_by" },
    score: { __type: "order_by" },
    service_id: { __type: "order_by" },
  },
  services_set_input: {
    created_at: { __type: "timestamp" },
    geo: { __type: "point" },
    location_name: { __type: "String" },
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
    service_available: { __type: "Boolean" },
    service_description: { __type: "String" },
    service_type: { __type: "service_type_enum" },
  },
  services_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_stddev_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_stddev_pop_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_stddev_samp_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_stream_cursor_input: {
    initial_value: { __type: "services_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  services_stream_cursor_value_input: {
    created_at: { __type: "timestamp" },
    geo: { __type: "point" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
    service_available: { __type: "Boolean" },
    service_description: { __type: "String" },
    service_type: { __type: "service_type_enum" },
  },
  services_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    marketplace: { __type: "Int" },
    service_accepted_payment: { __type: "Int" },
  },
  services_sum_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_updates: {
    _inc: { __type: "services_inc_input" },
    _set: { __type: "services_set_input" },
    where: { __type: "services_bool_exp!" },
  },
  services_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_var_pop_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_var_samp_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  services_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    marketplace: { __type: "Float" },
    service_accepted_payment: { __type: "Float" },
  },
  services_variance_order_by: {
    id: { __type: "order_by" },
    marketplace: { __type: "order_by" },
    service_accepted_payment: { __type: "order_by" },
  },
  subscription: {
    __typename: { __type: "String!" },
    account_type: {
      __type: "[account_type!]!",
      __args: {
        distinct_on: "[account_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[account_type_order_by!]",
        where: "account_type_bool_exp",
      },
    },
    account_type_aggregate: {
      __type: "account_type_aggregate!",
      __args: {
        distinct_on: "[account_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[account_type_order_by!]",
        where: "account_type_bool_exp",
      },
    },
    account_type_by_pk: {
      __type: "account_type",
      __args: { value: "String!" },
    },
    account_type_stream: {
      __type: "[account_type!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[account_type_stream_cursor_input]!",
        where: "account_type_bool_exp",
      },
    },
    accounts: {
      __type: "[accounts!]!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_aggregate: {
      __type: "accounts_aggregate!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_by_pk: { __type: "accounts", __args: { id: "Int!" } },
    accounts_stream: {
      __type: "[accounts!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[accounts_stream_cursor_input]!",
        where: "accounts_bool_exp",
      },
    },
    gender_type: {
      __type: "[gender_type!]!",
      __args: {
        distinct_on: "[gender_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[gender_type_order_by!]",
        where: "gender_type_bool_exp",
      },
    },
    gender_type_aggregate: {
      __type: "gender_type_aggregate!",
      __args: {
        distinct_on: "[gender_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[gender_type_order_by!]",
        where: "gender_type_bool_exp",
      },
    },
    gender_type_by_pk: { __type: "gender_type", __args: { value: "String!" } },
    gender_type_stream: {
      __type: "[gender_type!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[gender_type_stream_cursor_input]!",
        where: "gender_type_bool_exp",
      },
    },
    interface_type: {
      __type: "[interface_type!]!",
      __args: {
        distinct_on: "[interface_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[interface_type_order_by!]",
        where: "interface_type_bool_exp",
      },
    },
    interface_type_aggregate: {
      __type: "interface_type_aggregate!",
      __args: {
        distinct_on: "[interface_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[interface_type_order_by!]",
        where: "interface_type_bool_exp",
      },
    },
    interface_type_by_pk: {
      __type: "interface_type",
      __args: { value: "String!" },
    },
    interface_type_stream: {
      __type: "[interface_type!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[interface_type_stream_cursor_input]!",
        where: "interface_type_bool_exp",
      },
    },
    marketplaces: {
      __type: "[marketplaces!]!",
      __args: {
        distinct_on: "[marketplaces_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[marketplaces_order_by!]",
        where: "marketplaces_bool_exp",
      },
    },
    marketplaces_aggregate: {
      __type: "marketplaces_aggregate!",
      __args: {
        distinct_on: "[marketplaces_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[marketplaces_order_by!]",
        where: "marketplaces_bool_exp",
      },
    },
    marketplaces_by_pk: { __type: "marketplaces", __args: { id: "Int!" } },
    marketplaces_stream: {
      __type: "[marketplaces!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[marketplaces_stream_cursor_input]!",
        where: "marketplaces_bool_exp",
      },
    },
    personal_information: {
      __type: "[personal_information!]!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    personal_information_aggregate: {
      __type: "personal_information_aggregate!",
      __args: {
        distinct_on: "[personal_information_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[personal_information_order_by!]",
        where: "personal_information_bool_exp",
      },
    },
    personal_information_stream: {
      __type: "[personal_information!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[personal_information_stream_cursor_input]!",
        where: "personal_information_bool_exp",
      },
    },
    service_accepted_payment: {
      __type: "[service_accepted_payment!]!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_accepted_payment_aggregate: {
      __type: "service_accepted_payment_aggregate!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_accepted_payment_by_pk: {
      __type: "service_accepted_payment",
      __args: { id: "Int!" },
    },
    service_accepted_payment_stream: {
      __type: "[service_accepted_payment!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[service_accepted_payment_stream_cursor_input]!",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_type: {
      __type: "[service_type!]!",
      __args: {
        distinct_on: "[service_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_type_order_by!]",
        where: "service_type_bool_exp",
      },
    },
    service_type_aggregate: {
      __type: "service_type_aggregate!",
      __args: {
        distinct_on: "[service_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_type_order_by!]",
        where: "service_type_bool_exp",
      },
    },
    service_type_by_pk: {
      __type: "service_type",
      __args: { value: "String!" },
    },
    service_type_stream: {
      __type: "[service_type!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[service_type_stream_cursor_input]!",
        where: "service_type_bool_exp",
      },
    },
    services: {
      __type: "[services!]!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_aggregate: {
      __type: "services_aggregate!",
      __args: {
        distinct_on: "[services_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_order_by!]",
        where: "services_bool_exp",
      },
    },
    services_by_pk: { __type: "services", __args: { id: "Int!" } },
    services_images: {
      __type: "[services_images!]!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_images_aggregate: {
      __type: "services_images_aggregate!",
      __args: {
        distinct_on: "[services_images_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_images_order_by!]",
        where: "services_images_bool_exp",
      },
    },
    services_images_by_pk: {
      __type: "services_images",
      __args: { id: "Int!" },
    },
    services_images_stream: {
      __type: "[services_images!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[services_images_stream_cursor_input]!",
        where: "services_images_bool_exp",
      },
    },
    services_ratings: {
      __type: "[services_ratings!]!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_aggregate: {
      __type: "services_ratings_aggregate!",
      __args: {
        distinct_on: "[services_ratings_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[services_ratings_order_by!]",
        where: "services_ratings_bool_exp",
      },
    },
    services_ratings_by_pk: {
      __type: "services_ratings",
      __args: { id: "Int!" },
    },
    services_ratings_stream: {
      __type: "[services_ratings!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[services_ratings_stream_cursor_input]!",
        where: "services_ratings_bool_exp",
      },
    },
    services_stream: {
      __type: "[services!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[services_stream_cursor_input]!",
        where: "services_bool_exp",
      },
    },
    till: {
      __type: "[till!]!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    till_aggregate: {
      __type: "till_aggregate!",
      __args: {
        distinct_on: "[till_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[till_order_by!]",
        where: "till_bool_exp",
      },
    },
    till_by_pk: { __type: "till", __args: { id: "Int!" } },
    till_stream: {
      __type: "[till!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[till_stream_cursor_input]!",
        where: "till_bool_exp",
      },
    },
    transactions: {
      __type: "[transactions!]!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_aggregate: {
      __type: "transactions_aggregate!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_by_pk: { __type: "transactions", __args: { id: "Int!" } },
    transactions_stream: {
      __type: "[transactions!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[transactions_stream_cursor_input]!",
        where: "transactions_bool_exp",
      },
    },
    tx_type: {
      __type: "[tx_type!]!",
      __args: {
        distinct_on: "[tx_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[tx_type_order_by!]",
        where: "tx_type_bool_exp",
      },
    },
    tx_type_aggregate: {
      __type: "tx_type_aggregate!",
      __args: {
        distinct_on: "[tx_type_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[tx_type_order_by!]",
        where: "tx_type_bool_exp",
      },
    },
    tx_type_by_pk: { __type: "tx_type", __args: { value: "String!" } },
    tx_type_stream: {
      __type: "[tx_type!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[tx_type_stream_cursor_input]!",
        where: "tx_type_bool_exp",
      },
    },
    users: {
      __type: "[users!]!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    users_aggregate: {
      __type: "users_aggregate!",
      __args: {
        distinct_on: "[users_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[users_order_by!]",
        where: "users_bool_exp",
      },
    },
    users_by_pk: { __type: "users", __args: { id: "Int!" } },
    users_stream: {
      __type: "[users!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[users_stream_cursor_input]!",
        where: "users_bool_exp",
      },
    },
    voucher_certifications: {
      __type: "[voucher_certifications!]!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_by_pk: {
      __type: "voucher_certifications",
      __args: { id: "Int!" },
    },
    voucher_certifications_stream: {
      __type: "[voucher_certifications!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[voucher_certifications_stream_cursor_input]!",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_issuers: {
      __type: "[voucher_issuers!]!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_issuers_aggregate: {
      __type: "voucher_issuers_aggregate!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_issuers_by_pk: {
      __type: "voucher_issuers",
      __args: { id: "Int!" },
    },
    voucher_issuers_stream: {
      __type: "[voucher_issuers!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[voucher_issuers_stream_cursor_input]!",
        where: "voucher_issuers_bool_exp",
      },
    },
    vouchers: {
      __type: "[vouchers!]!",
      __args: {
        distinct_on: "[vouchers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vouchers_order_by!]",
        where: "vouchers_bool_exp",
      },
    },
    vouchers_aggregate: {
      __type: "vouchers_aggregate!",
      __args: {
        distinct_on: "[vouchers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vouchers_order_by!]",
        where: "vouchers_bool_exp",
      },
    },
    vouchers_by_pk: { __type: "vouchers", __args: { id: "Int!" } },
    vouchers_stream: {
      __type: "[vouchers!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[vouchers_stream_cursor_input]!",
        where: "vouchers_bool_exp",
      },
    },
    vpa: {
      __type: "[vpa!]!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
    vpa_aggregate: {
      __type: "vpa_aggregate!",
      __args: {
        distinct_on: "[vpa_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[vpa_order_by!]",
        where: "vpa_bool_exp",
      },
    },
    vpa_by_pk: { __type: "vpa", __args: { id: "Int!" } },
    vpa_stream: {
      __type: "[vpa!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[vpa_stream_cursor_input]!",
        where: "vpa_bool_exp",
      },
    },
  },
  till: {
    __typename: { __type: "String!" },
    account: { __type: "accounts!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    linked_account: { __type: "Int!" },
    till: { __type: "String!" },
  },
  till_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "till_aggregate_fields" },
    nodes: { __type: "[till!]!" },
  },
  till_aggregate_bool_exp: {
    count: { __type: "till_aggregate_bool_exp_count" },
  },
  till_aggregate_bool_exp_count: {
    arguments: { __type: "[till_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "till_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  till_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "till_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[till_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "till_max_fields" },
    min: { __type: "till_min_fields" },
    stddev: { __type: "till_stddev_fields" },
    stddev_pop: { __type: "till_stddev_pop_fields" },
    stddev_samp: { __type: "till_stddev_samp_fields" },
    sum: { __type: "till_sum_fields" },
    var_pop: { __type: "till_var_pop_fields" },
    var_samp: { __type: "till_var_samp_fields" },
    variance: { __type: "till_variance_fields" },
  },
  till_aggregate_order_by: {
    avg: { __type: "till_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "till_max_order_by" },
    min: { __type: "till_min_order_by" },
    stddev: { __type: "till_stddev_order_by" },
    stddev_pop: { __type: "till_stddev_pop_order_by" },
    stddev_samp: { __type: "till_stddev_samp_order_by" },
    sum: { __type: "till_sum_order_by" },
    var_pop: { __type: "till_var_pop_order_by" },
    var_samp: { __type: "till_var_samp_order_by" },
    variance: { __type: "till_variance_order_by" },
  },
  till_arr_rel_insert_input: {
    data: { __type: "[till_insert_input!]!" },
    on_conflict: { __type: "till_on_conflict" },
  },
  till_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_avg_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_bool_exp: {
    _and: { __type: "[till_bool_exp!]" },
    _not: { __type: "till_bool_exp" },
    _or: { __type: "[till_bool_exp!]" },
    account: { __type: "accounts_bool_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    linked_account: { __type: "Int_comparison_exp" },
    till: { __type: "String_comparison_exp" },
  },
  till_inc_input: { linked_account: { __type: "Int" } },
  till_insert_input: {
    account: { __type: "accounts_obj_rel_insert_input" },
    created_at: { __type: "timestamp" },
    linked_account: { __type: "Int" },
    till: { __type: "String" },
  },
  till_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    till: { __type: "String" },
  },
  till_max_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    till: { __type: "order_by" },
  },
  till_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    till: { __type: "String" },
  },
  till_min_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    till: { __type: "order_by" },
  },
  till_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[till!]!" },
  },
  till_on_conflict: {
    constraint: { __type: "till_constraint!" },
    update_columns: { __type: "[till_update_column!]!" },
    where: { __type: "till_bool_exp" },
  },
  till_order_by: {
    account: { __type: "accounts_order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    till: { __type: "order_by" },
  },
  till_pk_columns_input: { id: { __type: "Int!" } },
  till_set_input: {
    created_at: { __type: "timestamp" },
    linked_account: { __type: "Int" },
    till: { __type: "String" },
  },
  till_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_stddev_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_stddev_pop_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_stddev_samp_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_stream_cursor_input: {
    initial_value: { __type: "till_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  till_stream_cursor_value_input: {
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    till: { __type: "String" },
  },
  till_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
  },
  till_sum_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_updates: {
    _inc: { __type: "till_inc_input" },
    _set: { __type: "till_set_input" },
    where: { __type: "till_bool_exp!" },
  },
  till_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_var_pop_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_var_samp_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  till_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  till_variance_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  timestamp_comparison_exp: {
    _eq: { __type: "timestamp" },
    _gt: { __type: "timestamp" },
    _gte: { __type: "timestamp" },
    _in: { __type: "[timestamp!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "timestamp" },
    _lte: { __type: "timestamp" },
    _neq: { __type: "timestamp" },
    _nin: { __type: "[timestamp!]" },
  },
  transactions: {
    __typename: { __type: "String!" },
    block_number: { __type: "Int!" },
    date_block: { __type: "timestamp!" },
    id: { __type: "Int!" },
    recipient_address: { __type: "String!" },
    sender_address: { __type: "String!" },
    success: { __type: "Boolean!" },
    txTypeByTxType: { __type: "tx_type" },
    tx_hash: { __type: "String!" },
    tx_index: { __type: "Int!" },
    tx_type: { __type: "tx_type_enum" },
    tx_value: { __type: "bigint!" },
    voucher: { __type: "vouchers!" },
    voucher_address: { __type: "String!" },
  },
  transactions_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "transactions_aggregate_fields" },
    nodes: { __type: "[transactions!]!" },
  },
  transactions_aggregate_bool_exp: {
    bool_and: { __type: "transactions_aggregate_bool_exp_bool_and" },
    bool_or: { __type: "transactions_aggregate_bool_exp_bool_or" },
    count: { __type: "transactions_aggregate_bool_exp_count" },
  },
  transactions_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        "transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "transactions_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  transactions_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        "transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "transactions_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  transactions_aggregate_bool_exp_count: {
    arguments: { __type: "[transactions_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "transactions_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  transactions_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "transactions_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[transactions_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "transactions_max_fields" },
    min: { __type: "transactions_min_fields" },
    stddev: { __type: "transactions_stddev_fields" },
    stddev_pop: { __type: "transactions_stddev_pop_fields" },
    stddev_samp: { __type: "transactions_stddev_samp_fields" },
    sum: { __type: "transactions_sum_fields" },
    var_pop: { __type: "transactions_var_pop_fields" },
    var_samp: { __type: "transactions_var_samp_fields" },
    variance: { __type: "transactions_variance_fields" },
  },
  transactions_aggregate_order_by: {
    avg: { __type: "transactions_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "transactions_max_order_by" },
    min: { __type: "transactions_min_order_by" },
    stddev: { __type: "transactions_stddev_order_by" },
    stddev_pop: { __type: "transactions_stddev_pop_order_by" },
    stddev_samp: { __type: "transactions_stddev_samp_order_by" },
    sum: { __type: "transactions_sum_order_by" },
    var_pop: { __type: "transactions_var_pop_order_by" },
    var_samp: { __type: "transactions_var_samp_order_by" },
    variance: { __type: "transactions_variance_order_by" },
  },
  transactions_arr_rel_insert_input: {
    data: { __type: "[transactions_insert_input!]!" },
    on_conflict: { __type: "transactions_on_conflict" },
  },
  transactions_avg_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_avg_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_bool_exp: {
    _and: { __type: "[transactions_bool_exp!]" },
    _not: { __type: "transactions_bool_exp" },
    _or: { __type: "[transactions_bool_exp!]" },
    block_number: { __type: "Int_comparison_exp" },
    date_block: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    recipient_address: { __type: "String_comparison_exp" },
    sender_address: { __type: "String_comparison_exp" },
    success: { __type: "Boolean_comparison_exp" },
    txTypeByTxType: { __type: "tx_type_bool_exp" },
    tx_hash: { __type: "String_comparison_exp" },
    tx_index: { __type: "Int_comparison_exp" },
    tx_type: { __type: "tx_type_enum_comparison_exp" },
    tx_value: { __type: "bigint_comparison_exp" },
    voucher: { __type: "vouchers_bool_exp" },
    voucher_address: { __type: "String_comparison_exp" },
  },
  transactions_inc_input: {
    block_number: { __type: "Int" },
    tx_index: { __type: "Int" },
    tx_value: { __type: "bigint" },
  },
  transactions_insert_input: {
    block_number: { __type: "Int" },
    date_block: { __type: "timestamp" },
    recipient_address: { __type: "String" },
    sender_address: { __type: "String" },
    success: { __type: "Boolean" },
    txTypeByTxType: { __type: "tx_type_obj_rel_insert_input" },
    tx_hash: { __type: "String" },
    tx_index: { __type: "Int" },
    tx_type: { __type: "tx_type_enum" },
    tx_value: { __type: "bigint" },
    voucher: { __type: "vouchers_obj_rel_insert_input" },
    voucher_address: { __type: "String" },
  },
  transactions_max_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Int" },
    date_block: { __type: "timestamp" },
    id: { __type: "Int" },
    recipient_address: { __type: "String" },
    sender_address: { __type: "String" },
    tx_hash: { __type: "String" },
    tx_index: { __type: "Int" },
    tx_value: { __type: "bigint" },
    voucher_address: { __type: "String" },
  },
  transactions_max_order_by: {
    block_number: { __type: "order_by" },
    date_block: { __type: "order_by" },
    id: { __type: "order_by" },
    recipient_address: { __type: "order_by" },
    sender_address: { __type: "order_by" },
    tx_hash: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
    voucher_address: { __type: "order_by" },
  },
  transactions_min_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Int" },
    date_block: { __type: "timestamp" },
    id: { __type: "Int" },
    recipient_address: { __type: "String" },
    sender_address: { __type: "String" },
    tx_hash: { __type: "String" },
    tx_index: { __type: "Int" },
    tx_value: { __type: "bigint" },
    voucher_address: { __type: "String" },
  },
  transactions_min_order_by: {
    block_number: { __type: "order_by" },
    date_block: { __type: "order_by" },
    id: { __type: "order_by" },
    recipient_address: { __type: "order_by" },
    sender_address: { __type: "order_by" },
    tx_hash: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
    voucher_address: { __type: "order_by" },
  },
  transactions_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[transactions!]!" },
  },
  transactions_on_conflict: {
    constraint: { __type: "transactions_constraint!" },
    update_columns: { __type: "[transactions_update_column!]!" },
    where: { __type: "transactions_bool_exp" },
  },
  transactions_order_by: {
    block_number: { __type: "order_by" },
    date_block: { __type: "order_by" },
    id: { __type: "order_by" },
    recipient_address: { __type: "order_by" },
    sender_address: { __type: "order_by" },
    success: { __type: "order_by" },
    txTypeByTxType: { __type: "tx_type_order_by" },
    tx_hash: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_type: { __type: "order_by" },
    tx_value: { __type: "order_by" },
    voucher: { __type: "vouchers_order_by" },
    voucher_address: { __type: "order_by" },
  },
  transactions_pk_columns_input: { id: { __type: "Int!" } },
  transactions_set_input: {
    block_number: { __type: "Int" },
    date_block: { __type: "timestamp" },
    recipient_address: { __type: "String" },
    sender_address: { __type: "String" },
    success: { __type: "Boolean" },
    tx_hash: { __type: "String" },
    tx_index: { __type: "Int" },
    tx_type: { __type: "tx_type_enum" },
    tx_value: { __type: "bigint" },
    voucher_address: { __type: "String" },
  },
  transactions_stddev_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_stddev_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_stddev_pop_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_stddev_pop_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_stddev_samp_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_stddev_samp_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_stream_cursor_input: {
    initial_value: { __type: "transactions_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  transactions_stream_cursor_value_input: {
    block_number: { __type: "Int" },
    date_block: { __type: "timestamp" },
    id: { __type: "Int" },
    recipient_address: { __type: "String" },
    sender_address: { __type: "String" },
    success: { __type: "Boolean" },
    tx_hash: { __type: "String" },
    tx_index: { __type: "Int" },
    tx_type: { __type: "tx_type_enum" },
    tx_value: { __type: "bigint" },
    voucher_address: { __type: "String" },
  },
  transactions_sum_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Int" },
    id: { __type: "Int" },
    tx_index: { __type: "Int" },
    tx_value: { __type: "bigint" },
  },
  transactions_sum_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_updates: {
    _inc: { __type: "transactions_inc_input" },
    _set: { __type: "transactions_set_input" },
    where: { __type: "transactions_bool_exp!" },
  },
  transactions_var_pop_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_var_pop_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_var_samp_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_var_samp_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  transactions_variance_fields: {
    __typename: { __type: "String!" },
    block_number: { __type: "Float" },
    id: { __type: "Float" },
    tx_index: { __type: "Float" },
    tx_value: { __type: "Float" },
  },
  transactions_variance_order_by: {
    block_number: { __type: "order_by" },
    id: { __type: "order_by" },
    tx_index: { __type: "order_by" },
    tx_value: { __type: "order_by" },
  },
  tx_type: {
    __typename: { __type: "String!" },
    transactions: {
      __type: "[transactions!]!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_aggregate: {
      __type: "transactions_aggregate!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    value: { __type: "String!" },
  },
  tx_type_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "tx_type_aggregate_fields" },
    nodes: { __type: "[tx_type!]!" },
  },
  tx_type_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: { columns: "[tx_type_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "tx_type_max_fields" },
    min: { __type: "tx_type_min_fields" },
  },
  tx_type_bool_exp: {
    _and: { __type: "[tx_type_bool_exp!]" },
    _not: { __type: "tx_type_bool_exp" },
    _or: { __type: "[tx_type_bool_exp!]" },
    transactions: { __type: "transactions_bool_exp" },
    transactions_aggregate: { __type: "transactions_aggregate_bool_exp" },
    value: { __type: "String_comparison_exp" },
  },
  tx_type_enum_comparison_exp: {
    _eq: { __type: "tx_type_enum" },
    _in: { __type: "[tx_type_enum!]" },
    _is_null: { __type: "Boolean" },
    _neq: { __type: "tx_type_enum" },
    _nin: { __type: "[tx_type_enum!]" },
  },
  tx_type_insert_input: {
    transactions: { __type: "transactions_arr_rel_insert_input" },
    value: { __type: "String" },
  },
  tx_type_max_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  tx_type_min_fields: {
    __typename: { __type: "String!" },
    value: { __type: "String" },
  },
  tx_type_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[tx_type!]!" },
  },
  tx_type_obj_rel_insert_input: {
    data: { __type: "tx_type_insert_input!" },
    on_conflict: { __type: "tx_type_on_conflict" },
  },
  tx_type_on_conflict: {
    constraint: { __type: "tx_type_constraint!" },
    update_columns: { __type: "[tx_type_update_column!]!" },
    where: { __type: "tx_type_bool_exp" },
  },
  tx_type_order_by: {
    transactions_aggregate: { __type: "transactions_aggregate_order_by" },
    value: { __type: "order_by" },
  },
  tx_type_pk_columns_input: { value: { __type: "String!" } },
  tx_type_set_input: { value: { __type: "String" } },
  tx_type_stream_cursor_input: {
    initial_value: { __type: "tx_type_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  tx_type_stream_cursor_value_input: { value: { __type: "String" } },
  tx_type_updates: {
    _set: { __type: "tx_type_set_input" },
    where: { __type: "tx_type_bool_exp!" },
  },
  users: {
    __typename: { __type: "String!" },
    accounts: {
      __type: "[accounts!]!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    accounts_aggregate: {
      __type: "accounts_aggregate!",
      __args: {
        distinct_on: "[accounts_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[accounts_order_by!]",
        where: "accounts_bool_exp",
      },
    },
    activated: { __type: "Boolean" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    interfaceTypeByInterfaceType: { __type: "interface_type!" },
    interface_identifier: { __type: "String!" },
    interface_type: { __type: "interface_type_enum!" },
    personal_information: { __type: "personal_information" },
  },
  users_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "users_aggregate_fields" },
    nodes: { __type: "[users!]!" },
  },
  users_aggregate_bool_exp: {
    bool_and: { __type: "users_aggregate_bool_exp_bool_and" },
    bool_or: { __type: "users_aggregate_bool_exp_bool_or" },
    count: { __type: "users_aggregate_bool_exp_count" },
  },
  users_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        "users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "users_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  users_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        "users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "users_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  users_aggregate_bool_exp_count: {
    arguments: { __type: "[users_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "users_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  users_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "users_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[users_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "users_max_fields" },
    min: { __type: "users_min_fields" },
    stddev: { __type: "users_stddev_fields" },
    stddev_pop: { __type: "users_stddev_pop_fields" },
    stddev_samp: { __type: "users_stddev_samp_fields" },
    sum: { __type: "users_sum_fields" },
    var_pop: { __type: "users_var_pop_fields" },
    var_samp: { __type: "users_var_samp_fields" },
    variance: { __type: "users_variance_fields" },
  },
  users_aggregate_order_by: {
    avg: { __type: "users_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "users_max_order_by" },
    min: { __type: "users_min_order_by" },
    stddev: { __type: "users_stddev_order_by" },
    stddev_pop: { __type: "users_stddev_pop_order_by" },
    stddev_samp: { __type: "users_stddev_samp_order_by" },
    sum: { __type: "users_sum_order_by" },
    var_pop: { __type: "users_var_pop_order_by" },
    var_samp: { __type: "users_var_samp_order_by" },
    variance: { __type: "users_variance_order_by" },
  },
  users_arr_rel_insert_input: {
    data: { __type: "[users_insert_input!]!" },
    on_conflict: { __type: "users_on_conflict" },
  },
  users_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_avg_order_by: { id: { __type: "order_by" } },
  users_bool_exp: {
    _and: { __type: "[users_bool_exp!]" },
    _not: { __type: "users_bool_exp" },
    _or: { __type: "[users_bool_exp!]" },
    accounts: { __type: "accounts_bool_exp" },
    accounts_aggregate: { __type: "accounts_aggregate_bool_exp" },
    activated: { __type: "Boolean_comparison_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    interfaceTypeByInterfaceType: { __type: "interface_type_bool_exp" },
    interface_identifier: { __type: "String_comparison_exp" },
    interface_type: { __type: "interface_type_enum_comparison_exp" },
    personal_information: { __type: "personal_information_bool_exp" },
  },
  users_insert_input: {
    accounts: { __type: "accounts_arr_rel_insert_input" },
    activated: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    interfaceTypeByInterfaceType: {
      __type: "interface_type_obj_rel_insert_input",
    },
    interface_identifier: { __type: "String" },
    interface_type: { __type: "interface_type_enum" },
    personal_information: {
      __type: "personal_information_obj_rel_insert_input",
    },
  },
  users_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    interface_identifier: { __type: "String" },
  },
  users_max_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    interface_identifier: { __type: "order_by" },
  },
  users_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    interface_identifier: { __type: "String" },
  },
  users_min_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    interface_identifier: { __type: "order_by" },
  },
  users_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[users!]!" },
  },
  users_obj_rel_insert_input: {
    data: { __type: "users_insert_input!" },
    on_conflict: { __type: "users_on_conflict" },
  },
  users_on_conflict: {
    constraint: { __type: "users_constraint!" },
    update_columns: { __type: "[users_update_column!]!" },
    where: { __type: "users_bool_exp" },
  },
  users_order_by: {
    accounts_aggregate: { __type: "accounts_aggregate_order_by" },
    activated: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    interfaceTypeByInterfaceType: { __type: "interface_type_order_by" },
    interface_identifier: { __type: "order_by" },
    interface_type: { __type: "order_by" },
    personal_information: { __type: "personal_information_order_by" },
  },
  users_pk_columns_input: { id: { __type: "Int!" } },
  users_set_input: {
    activated: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    interface_identifier: { __type: "String" },
    interface_type: { __type: "interface_type_enum" },
  },
  users_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_stddev_order_by: { id: { __type: "order_by" } },
  users_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_stddev_pop_order_by: { id: { __type: "order_by" } },
  users_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_stddev_samp_order_by: { id: { __type: "order_by" } },
  users_stream_cursor_input: {
    initial_value: { __type: "users_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  users_stream_cursor_value_input: {
    activated: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    interface_identifier: { __type: "String" },
    interface_type: { __type: "interface_type_enum" },
  },
  users_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
  },
  users_sum_order_by: { id: { __type: "order_by" } },
  users_updates: {
    _set: { __type: "users_set_input" },
    where: { __type: "users_bool_exp!" },
  },
  users_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_var_pop_order_by: { id: { __type: "order_by" } },
  users_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_var_samp_order_by: { id: { __type: "order_by" } },
  users_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
  },
  users_variance_order_by: { id: { __type: "order_by" } },
  voucher_certifications: {
    __typename: { __type: "String!" },
    account: { __type: "accounts!" },
    certificate_url_pointer: { __type: "String!" },
    certifier: { __type: "Int!" },
    certifier_weight: { __type: "numeric!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    voucher: { __type: "Int!" },
    voucherByVoucher: { __type: "vouchers!" },
  },
  voucher_certifications_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "voucher_certifications_aggregate_fields" },
    nodes: { __type: "[voucher_certifications!]!" },
  },
  voucher_certifications_aggregate_bool_exp: {
    count: { __type: "voucher_certifications_aggregate_bool_exp_count" },
  },
  voucher_certifications_aggregate_bool_exp_count: {
    arguments: { __type: "[voucher_certifications_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "voucher_certifications_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  voucher_certifications_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "voucher_certifications_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[voucher_certifications_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "voucher_certifications_max_fields" },
    min: { __type: "voucher_certifications_min_fields" },
    stddev: { __type: "voucher_certifications_stddev_fields" },
    stddev_pop: { __type: "voucher_certifications_stddev_pop_fields" },
    stddev_samp: { __type: "voucher_certifications_stddev_samp_fields" },
    sum: { __type: "voucher_certifications_sum_fields" },
    var_pop: { __type: "voucher_certifications_var_pop_fields" },
    var_samp: { __type: "voucher_certifications_var_samp_fields" },
    variance: { __type: "voucher_certifications_variance_fields" },
  },
  voucher_certifications_aggregate_order_by: {
    avg: { __type: "voucher_certifications_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "voucher_certifications_max_order_by" },
    min: { __type: "voucher_certifications_min_order_by" },
    stddev: { __type: "voucher_certifications_stddev_order_by" },
    stddev_pop: { __type: "voucher_certifications_stddev_pop_order_by" },
    stddev_samp: { __type: "voucher_certifications_stddev_samp_order_by" },
    sum: { __type: "voucher_certifications_sum_order_by" },
    var_pop: { __type: "voucher_certifications_var_pop_order_by" },
    var_samp: { __type: "voucher_certifications_var_samp_order_by" },
    variance: { __type: "voucher_certifications_variance_order_by" },
  },
  voucher_certifications_arr_rel_insert_input: {
    data: { __type: "[voucher_certifications_insert_input!]!" },
    on_conflict: { __type: "voucher_certifications_on_conflict" },
  },
  voucher_certifications_avg_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_avg_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_bool_exp: {
    _and: { __type: "[voucher_certifications_bool_exp!]" },
    _not: { __type: "voucher_certifications_bool_exp" },
    _or: { __type: "[voucher_certifications_bool_exp!]" },
    account: { __type: "accounts_bool_exp" },
    certificate_url_pointer: { __type: "String_comparison_exp" },
    certifier: { __type: "Int_comparison_exp" },
    certifier_weight: { __type: "numeric_comparison_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    voucher: { __type: "Int_comparison_exp" },
    voucherByVoucher: { __type: "vouchers_bool_exp" },
  },
  voucher_certifications_inc_input: {
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_insert_input: {
    account: { __type: "accounts_obj_rel_insert_input" },
    certificate_url_pointer: { __type: "String" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    created_at: { __type: "timestamp" },
    voucher: { __type: "Int" },
    voucherByVoucher: { __type: "vouchers_obj_rel_insert_input" },
  },
  voucher_certifications_max_fields: {
    __typename: { __type: "String!" },
    certificate_url_pointer: { __type: "String" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_max_order_by: {
    certificate_url_pointer: { __type: "order_by" },
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_min_fields: {
    __typename: { __type: "String!" },
    certificate_url_pointer: { __type: "String" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_min_order_by: {
    certificate_url_pointer: { __type: "order_by" },
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[voucher_certifications!]!" },
  },
  voucher_certifications_on_conflict: {
    constraint: { __type: "voucher_certifications_constraint!" },
    update_columns: { __type: "[voucher_certifications_update_column!]!" },
    where: { __type: "voucher_certifications_bool_exp" },
  },
  voucher_certifications_order_by: {
    account: { __type: "accounts_order_by" },
    certificate_url_pointer: { __type: "order_by" },
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
    voucherByVoucher: { __type: "vouchers_order_by" },
  },
  voucher_certifications_pk_columns_input: { id: { __type: "Int!" } },
  voucher_certifications_set_input: {
    certificate_url_pointer: { __type: "String" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    created_at: { __type: "timestamp" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_stddev_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_stddev_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_stddev_pop_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_stddev_pop_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_stddev_samp_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_stddev_samp_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_stream_cursor_input: {
    initial_value: {
      __type: "voucher_certifications_stream_cursor_value_input!",
    },
    ordering: { __type: "cursor_ordering" },
  },
  voucher_certifications_stream_cursor_value_input: {
    certificate_url_pointer: { __type: "String" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_sum_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Int" },
    certifier_weight: { __type: "numeric" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_certifications_sum_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_updates: {
    _inc: { __type: "voucher_certifications_inc_input" },
    _set: { __type: "voucher_certifications_set_input" },
    where: { __type: "voucher_certifications_bool_exp!" },
  },
  voucher_certifications_var_pop_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_var_pop_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_var_samp_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_var_samp_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_certifications_variance_fields: {
    __typename: { __type: "String!" },
    certifier: { __type: "Float" },
    certifier_weight: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_certifications_variance_order_by: {
    certifier: { __type: "order_by" },
    certifier_weight: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers: {
    __typename: { __type: "String!" },
    account: { __type: "accounts!" },
    active: { __type: "Boolean" },
    backer: { __type: "Int!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    voucher: { __type: "Int!" },
    voucherByVoucher: { __type: "vouchers!" },
  },
  voucher_issuers_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "voucher_issuers_aggregate_fields" },
    nodes: { __type: "[voucher_issuers!]!" },
  },
  voucher_issuers_aggregate_bool_exp: {
    bool_and: { __type: "voucher_issuers_aggregate_bool_exp_bool_and" },
    bool_or: { __type: "voucher_issuers_aggregate_bool_exp_bool_or" },
    count: { __type: "voucher_issuers_aggregate_bool_exp_count" },
  },
  voucher_issuers_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        "voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "voucher_issuers_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  voucher_issuers_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        "voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns!",
    },
    distinct: { __type: "Boolean" },
    filter: { __type: "voucher_issuers_bool_exp" },
    predicate: { __type: "Boolean_comparison_exp!" },
  },
  voucher_issuers_aggregate_bool_exp_count: {
    arguments: { __type: "[voucher_issuers_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "voucher_issuers_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  voucher_issuers_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "voucher_issuers_avg_fields" },
    count: {
      __type: "Int!",
      __args: {
        columns: "[voucher_issuers_select_column!]",
        distinct: "Boolean",
      },
    },
    max: { __type: "voucher_issuers_max_fields" },
    min: { __type: "voucher_issuers_min_fields" },
    stddev: { __type: "voucher_issuers_stddev_fields" },
    stddev_pop: { __type: "voucher_issuers_stddev_pop_fields" },
    stddev_samp: { __type: "voucher_issuers_stddev_samp_fields" },
    sum: { __type: "voucher_issuers_sum_fields" },
    var_pop: { __type: "voucher_issuers_var_pop_fields" },
    var_samp: { __type: "voucher_issuers_var_samp_fields" },
    variance: { __type: "voucher_issuers_variance_fields" },
  },
  voucher_issuers_aggregate_order_by: {
    avg: { __type: "voucher_issuers_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "voucher_issuers_max_order_by" },
    min: { __type: "voucher_issuers_min_order_by" },
    stddev: { __type: "voucher_issuers_stddev_order_by" },
    stddev_pop: { __type: "voucher_issuers_stddev_pop_order_by" },
    stddev_samp: { __type: "voucher_issuers_stddev_samp_order_by" },
    sum: { __type: "voucher_issuers_sum_order_by" },
    var_pop: { __type: "voucher_issuers_var_pop_order_by" },
    var_samp: { __type: "voucher_issuers_var_samp_order_by" },
    variance: { __type: "voucher_issuers_variance_order_by" },
  },
  voucher_issuers_arr_rel_insert_input: {
    data: { __type: "[voucher_issuers_insert_input!]!" },
    on_conflict: { __type: "voucher_issuers_on_conflict" },
  },
  voucher_issuers_avg_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_avg_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_bool_exp: {
    _and: { __type: "[voucher_issuers_bool_exp!]" },
    _not: { __type: "voucher_issuers_bool_exp" },
    _or: { __type: "[voucher_issuers_bool_exp!]" },
    account: { __type: "accounts_bool_exp" },
    active: { __type: "Boolean_comparison_exp" },
    backer: { __type: "Int_comparison_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    voucher: { __type: "Int_comparison_exp" },
    voucherByVoucher: { __type: "vouchers_bool_exp" },
  },
  voucher_issuers_inc_input: {
    backer: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_insert_input: {
    account: { __type: "accounts_obj_rel_insert_input" },
    active: { __type: "Boolean" },
    backer: { __type: "Int" },
    created_at: { __type: "timestamp" },
    voucher: { __type: "Int" },
    voucherByVoucher: { __type: "vouchers_obj_rel_insert_input" },
  },
  voucher_issuers_max_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_max_order_by: {
    backer: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_min_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_min_order_by: {
    backer: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[voucher_issuers!]!" },
  },
  voucher_issuers_on_conflict: {
    constraint: { __type: "voucher_issuers_constraint!" },
    update_columns: { __type: "[voucher_issuers_update_column!]!" },
    where: { __type: "voucher_issuers_bool_exp" },
  },
  voucher_issuers_order_by: {
    account: { __type: "accounts_order_by" },
    active: { __type: "order_by" },
    backer: { __type: "order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
    voucherByVoucher: { __type: "vouchers_order_by" },
  },
  voucher_issuers_pk_columns_input: { id: { __type: "Int!" } },
  voucher_issuers_set_input: {
    active: { __type: "Boolean" },
    backer: { __type: "Int" },
    created_at: { __type: "timestamp" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_stddev_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_stddev_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_stddev_pop_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_stddev_pop_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_stddev_samp_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_stddev_samp_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_stream_cursor_input: {
    initial_value: { __type: "voucher_issuers_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  voucher_issuers_stream_cursor_value_input: {
    active: { __type: "Boolean" },
    backer: { __type: "Int" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_sum_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Int" },
    id: { __type: "Int" },
    voucher: { __type: "Int" },
  },
  voucher_issuers_sum_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_updates: {
    _inc: { __type: "voucher_issuers_inc_input" },
    _set: { __type: "voucher_issuers_set_input" },
    where: { __type: "voucher_issuers_bool_exp!" },
  },
  voucher_issuers_var_pop_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_var_pop_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_var_samp_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_var_samp_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  voucher_issuers_variance_fields: {
    __typename: { __type: "String!" },
    backer: { __type: "Float" },
    id: { __type: "Float" },
    voucher: { __type: "Float" },
  },
  voucher_issuers_variance_order_by: {
    backer: { __type: "order_by" },
    id: { __type: "order_by" },
    voucher: { __type: "order_by" },
  },
  vouchers: {
    __typename: { __type: "String!" },
    active: { __type: "Boolean" },
    created_at: { __type: "timestamp!" },
    demurrage_rate: { __type: "numeric!" },
    geo: { __type: "point" },
    id: { __type: "Int!" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    service_accepted_payments: {
      __type: "[service_accepted_payment!]!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    service_accepted_payments_aggregate: {
      __type: "service_accepted_payment_aggregate!",
      __args: {
        distinct_on: "[service_accepted_payment_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[service_accepted_payment_order_by!]",
        where: "service_accepted_payment_bool_exp",
      },
    },
    sink_address: { __type: "String!" },
    supply: { __type: "Int!" },
    symbol: { __type: "String!" },
    transactions: {
      __type: "[transactions!]!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    transactions_aggregate: {
      __type: "transactions_aggregate!",
      __args: {
        distinct_on: "[transactions_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[transactions_order_by!]",
        where: "transactions_bool_exp",
      },
    },
    voucher_address: { __type: "String!" },
    voucher_backers: {
      __type: "[voucher_issuers!]!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_backers_aggregate: {
      __type: "voucher_issuers_aggregate!",
      __args: {
        distinct_on: "[voucher_issuers_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_issuers_order_by!]",
        where: "voucher_issuers_bool_exp",
      },
    },
    voucher_certifications: {
      __type: "[voucher_certifications!]!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate!",
      __args: {
        distinct_on: "[voucher_certifications_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[voucher_certifications_order_by!]",
        where: "voucher_certifications_bool_exp",
      },
    },
    voucher_description: { __type: "String!" },
    voucher_name: { __type: "String!" },
  },
  vouchers_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "vouchers_aggregate_fields" },
    nodes: { __type: "[vouchers!]!" },
  },
  vouchers_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "vouchers_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[vouchers_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "vouchers_max_fields" },
    min: { __type: "vouchers_min_fields" },
    stddev: { __type: "vouchers_stddev_fields" },
    stddev_pop: { __type: "vouchers_stddev_pop_fields" },
    stddev_samp: { __type: "vouchers_stddev_samp_fields" },
    sum: { __type: "vouchers_sum_fields" },
    var_pop: { __type: "vouchers_var_pop_fields" },
    var_samp: { __type: "vouchers_var_samp_fields" },
    variance: { __type: "vouchers_variance_fields" },
  },
  vouchers_avg_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_bool_exp: {
    _and: { __type: "[vouchers_bool_exp!]" },
    _not: { __type: "vouchers_bool_exp" },
    _or: { __type: "[vouchers_bool_exp!]" },
    active: { __type: "Boolean_comparison_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    demurrage_rate: { __type: "numeric_comparison_exp" },
    geo: { __type: "point_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    location_name: { __type: "String_comparison_exp" },
    radius: { __type: "Int_comparison_exp" },
    service_accepted_payments: { __type: "service_accepted_payment_bool_exp" },
    service_accepted_payments_aggregate: {
      __type: "service_accepted_payment_aggregate_bool_exp",
    },
    sink_address: { __type: "String_comparison_exp" },
    supply: { __type: "Int_comparison_exp" },
    symbol: { __type: "String_comparison_exp" },
    transactions: { __type: "transactions_bool_exp" },
    transactions_aggregate: { __type: "transactions_aggregate_bool_exp" },
    voucher_address: { __type: "String_comparison_exp" },
    voucher_backers: { __type: "voucher_issuers_bool_exp" },
    voucher_backers_aggregate: { __type: "voucher_issuers_aggregate_bool_exp" },
    voucher_certifications: { __type: "voucher_certifications_bool_exp" },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate_bool_exp",
    },
    voucher_description: { __type: "String_comparison_exp" },
    voucher_name: { __type: "String_comparison_exp" },
  },
  vouchers_inc_input: {
    demurrage_rate: { __type: "numeric" },
    radius: { __type: "Int" },
    supply: { __type: "Int" },
  },
  vouchers_insert_input: {
    active: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    demurrage_rate: { __type: "numeric" },
    geo: { __type: "point" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    service_accepted_payments: {
      __type: "service_accepted_payment_arr_rel_insert_input",
    },
    sink_address: { __type: "String" },
    supply: { __type: "Int" },
    symbol: { __type: "String" },
    transactions: { __type: "transactions_arr_rel_insert_input" },
    voucher_address: { __type: "String" },
    voucher_backers: { __type: "voucher_issuers_arr_rel_insert_input" },
    voucher_certifications: {
      __type: "voucher_certifications_arr_rel_insert_input",
    },
    voucher_description: { __type: "String" },
    voucher_name: { __type: "String" },
  },
  vouchers_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    demurrage_rate: { __type: "numeric" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    sink_address: { __type: "String" },
    supply: { __type: "Int" },
    symbol: { __type: "String" },
    voucher_address: { __type: "String" },
    voucher_description: { __type: "String" },
    voucher_name: { __type: "String" },
  },
  vouchers_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    demurrage_rate: { __type: "numeric" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    sink_address: { __type: "String" },
    supply: { __type: "Int" },
    symbol: { __type: "String" },
    voucher_address: { __type: "String" },
    voucher_description: { __type: "String" },
    voucher_name: { __type: "String" },
  },
  vouchers_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[vouchers!]!" },
  },
  vouchers_obj_rel_insert_input: {
    data: { __type: "vouchers_insert_input!" },
    on_conflict: { __type: "vouchers_on_conflict" },
  },
  vouchers_on_conflict: {
    constraint: { __type: "vouchers_constraint!" },
    update_columns: { __type: "[vouchers_update_column!]!" },
    where: { __type: "vouchers_bool_exp" },
  },
  vouchers_order_by: {
    active: { __type: "order_by" },
    created_at: { __type: "order_by" },
    demurrage_rate: { __type: "order_by" },
    geo: { __type: "order_by" },
    id: { __type: "order_by" },
    location_name: { __type: "order_by" },
    radius: { __type: "order_by" },
    service_accepted_payments_aggregate: {
      __type: "service_accepted_payment_aggregate_order_by",
    },
    sink_address: { __type: "order_by" },
    supply: { __type: "order_by" },
    symbol: { __type: "order_by" },
    transactions_aggregate: { __type: "transactions_aggregate_order_by" },
    voucher_address: { __type: "order_by" },
    voucher_backers_aggregate: { __type: "voucher_issuers_aggregate_order_by" },
    voucher_certifications_aggregate: {
      __type: "voucher_certifications_aggregate_order_by",
    },
    voucher_description: { __type: "order_by" },
    voucher_name: { __type: "order_by" },
  },
  vouchers_pk_columns_input: { id: { __type: "Int!" } },
  vouchers_set_input: {
    active: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    demurrage_rate: { __type: "numeric" },
    geo: { __type: "point" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    sink_address: { __type: "String" },
    supply: { __type: "Int" },
    symbol: { __type: "String" },
    voucher_address: { __type: "String" },
    voucher_description: { __type: "String" },
    voucher_name: { __type: "String" },
  },
  vouchers_stddev_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_stddev_pop_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_stddev_samp_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_stream_cursor_input: {
    initial_value: { __type: "vouchers_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  vouchers_stream_cursor_value_input: {
    active: { __type: "Boolean" },
    created_at: { __type: "timestamp" },
    demurrage_rate: { __type: "numeric" },
    geo: { __type: "point" },
    id: { __type: "Int" },
    location_name: { __type: "String" },
    radius: { __type: "Int" },
    sink_address: { __type: "String" },
    supply: { __type: "Int" },
    symbol: { __type: "String" },
    voucher_address: { __type: "String" },
    voucher_description: { __type: "String" },
    voucher_name: { __type: "String" },
  },
  vouchers_sum_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "numeric" },
    id: { __type: "Int" },
    radius: { __type: "Int" },
    supply: { __type: "Int" },
  },
  vouchers_updates: {
    _inc: { __type: "vouchers_inc_input" },
    _set: { __type: "vouchers_set_input" },
    where: { __type: "vouchers_bool_exp!" },
  },
  vouchers_var_pop_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_var_samp_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vouchers_variance_fields: {
    __typename: { __type: "String!" },
    demurrage_rate: { __type: "Float" },
    id: { __type: "Float" },
    radius: { __type: "Float" },
    supply: { __type: "Float" },
  },
  vpa: {
    __typename: { __type: "String!" },
    account: { __type: "accounts!" },
    created_at: { __type: "timestamp!" },
    id: { __type: "Int!" },
    linked_account: { __type: "Int!" },
    vpa: { __type: "String!" },
  },
  vpa_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "vpa_aggregate_fields" },
    nodes: { __type: "[vpa!]!" },
  },
  vpa_aggregate_bool_exp: { count: { __type: "vpa_aggregate_bool_exp_count" } },
  vpa_aggregate_bool_exp_count: {
    arguments: { __type: "[vpa_select_column!]" },
    distinct: { __type: "Boolean" },
    filter: { __type: "vpa_bool_exp" },
    predicate: { __type: "Int_comparison_exp!" },
  },
  vpa_aggregate_fields: {
    __typename: { __type: "String!" },
    avg: { __type: "vpa_avg_fields" },
    count: {
      __type: "Int!",
      __args: { columns: "[vpa_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "vpa_max_fields" },
    min: { __type: "vpa_min_fields" },
    stddev: { __type: "vpa_stddev_fields" },
    stddev_pop: { __type: "vpa_stddev_pop_fields" },
    stddev_samp: { __type: "vpa_stddev_samp_fields" },
    sum: { __type: "vpa_sum_fields" },
    var_pop: { __type: "vpa_var_pop_fields" },
    var_samp: { __type: "vpa_var_samp_fields" },
    variance: { __type: "vpa_variance_fields" },
  },
  vpa_aggregate_order_by: {
    avg: { __type: "vpa_avg_order_by" },
    count: { __type: "order_by" },
    max: { __type: "vpa_max_order_by" },
    min: { __type: "vpa_min_order_by" },
    stddev: { __type: "vpa_stddev_order_by" },
    stddev_pop: { __type: "vpa_stddev_pop_order_by" },
    stddev_samp: { __type: "vpa_stddev_samp_order_by" },
    sum: { __type: "vpa_sum_order_by" },
    var_pop: { __type: "vpa_var_pop_order_by" },
    var_samp: { __type: "vpa_var_samp_order_by" },
    variance: { __type: "vpa_variance_order_by" },
  },
  vpa_arr_rel_insert_input: {
    data: { __type: "[vpa_insert_input!]!" },
    on_conflict: { __type: "vpa_on_conflict" },
  },
  vpa_avg_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_avg_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_bool_exp: {
    _and: { __type: "[vpa_bool_exp!]" },
    _not: { __type: "vpa_bool_exp" },
    _or: { __type: "[vpa_bool_exp!]" },
    account: { __type: "accounts_bool_exp" },
    created_at: { __type: "timestamp_comparison_exp" },
    id: { __type: "Int_comparison_exp" },
    linked_account: { __type: "Int_comparison_exp" },
    vpa: { __type: "String_comparison_exp" },
  },
  vpa_inc_input: { linked_account: { __type: "Int" } },
  vpa_insert_input: {
    account: { __type: "accounts_obj_rel_insert_input" },
    created_at: { __type: "timestamp" },
    linked_account: { __type: "Int" },
    vpa: { __type: "String" },
  },
  vpa_max_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    vpa: { __type: "String" },
  },
  vpa_max_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    vpa: { __type: "order_by" },
  },
  vpa_min_fields: {
    __typename: { __type: "String!" },
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    vpa: { __type: "String" },
  },
  vpa_min_order_by: {
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    vpa: { __type: "order_by" },
  },
  vpa_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[vpa!]!" },
  },
  vpa_on_conflict: {
    constraint: { __type: "vpa_constraint!" },
    update_columns: { __type: "[vpa_update_column!]!" },
    where: { __type: "vpa_bool_exp" },
  },
  vpa_order_by: {
    account: { __type: "accounts_order_by" },
    created_at: { __type: "order_by" },
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
    vpa: { __type: "order_by" },
  },
  vpa_pk_columns_input: { id: { __type: "Int!" } },
  vpa_set_input: {
    created_at: { __type: "timestamp" },
    linked_account: { __type: "Int" },
    vpa: { __type: "String" },
  },
  vpa_stddev_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_stddev_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_stddev_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_stddev_pop_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_stddev_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_stddev_samp_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_stream_cursor_input: {
    initial_value: { __type: "vpa_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  vpa_stream_cursor_value_input: {
    created_at: { __type: "timestamp" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
    vpa: { __type: "String" },
  },
  vpa_sum_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Int" },
    linked_account: { __type: "Int" },
  },
  vpa_sum_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_updates: {
    _inc: { __type: "vpa_inc_input" },
    _set: { __type: "vpa_set_input" },
    where: { __type: "vpa_bool_exp!" },
  },
  vpa_var_pop_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_var_pop_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_var_samp_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_var_samp_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
  vpa_variance_fields: {
    __typename: { __type: "String!" },
    id: { __type: "Float" },
    linked_account: { __type: "Float" },
  },
  vpa_variance_order_by: {
    id: { __type: "order_by" },
    linked_account: { __type: "order_by" },
  },
} as const;

/**
 * columns and relationships of "account_type"
 */
export interface account_type {
  __typename?: "account_type";
  /**
   * An array relationship
   */
  accounts: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<accounts_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<accounts_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<accounts_bool_exp>;
  }) => Array<accounts>;
  /**
   * An aggregate relationship
   */
  accounts_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<accounts_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<accounts_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<accounts_bool_exp>;
  }) => accounts_aggregate;
  value: ScalarsEnums["String"];
}

/**
 * aggregated selection of "account_type"
 */
export interface account_type_aggregate {
  __typename?: "account_type_aggregate";
  aggregate?: Maybe<account_type_aggregate_fields>;
  nodes: Array<account_type>;
}

/**
 * aggregate fields of "account_type"
 */
export interface account_type_aggregate_fields {
  __typename?: "account_type_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<account_type_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<account_type_max_fields>;
  min?: Maybe<account_type_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface account_type_max_fields {
  __typename?: "account_type_max_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface account_type_min_fields {
  __typename?: "account_type_min_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "account_type"
 */
export interface account_type_mutation_response {
  __typename?: "account_type_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<account_type>;
}

/**
 * columns and relationships of "accounts"
 */
export interface accounts {
  __typename?: "accounts";
  /**
   * An object relationship
   */
  accountTypeByAccountType: account_type;
  account_type: ScalarsEnums["account_type_enum"];
  blockchain_address: ScalarsEnums["String"];
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  marketplace?: Maybe<marketplaces>;
  /**
   * An array relationship
   */
  services_ratings: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_ratings_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_ratings_bool_exp>;
  }) => Array<services_ratings>;
  /**
   * An aggregate relationship
   */
  services_ratings_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_ratings_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_ratings_bool_exp>;
  }) => services_ratings_aggregate;
  /**
   * An array relationship
   */
  tills: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<till_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<till_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<till_bool_exp>;
  }) => Array<till>;
  /**
   * An aggregate relationship
   */
  tills_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<till_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<till_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<till_bool_exp>;
  }) => till_aggregate;
  /**
   * An object relationship
   */
  user: users;
  user_identifier: ScalarsEnums["Int"];
  /**
   * An array relationship
   */
  voucher_backers: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => Array<voucher_issuers>;
  /**
   * An aggregate relationship
   */
  voucher_backers_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => voucher_issuers_aggregate;
  /**
   * An array relationship
   */
  voucher_certifications: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => Array<voucher_certifications>;
  /**
   * An aggregate relationship
   */
  voucher_certifications_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => voucher_certifications_aggregate;
  /**
   * An array relationship
   */
  vpas: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<vpa_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<vpa_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<vpa_bool_exp>;
  }) => Array<vpa>;
  /**
   * An aggregate relationship
   */
  vpas_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<vpa_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<vpa_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<vpa_bool_exp>;
  }) => vpa_aggregate;
}

/**
 * aggregated selection of "accounts"
 */
export interface accounts_aggregate {
  __typename?: "accounts_aggregate";
  aggregate?: Maybe<accounts_aggregate_fields>;
  nodes: Array<accounts>;
}

/**
 * aggregate fields of "accounts"
 */
export interface accounts_aggregate_fields {
  __typename?: "accounts_aggregate_fields";
  avg?: Maybe<accounts_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<accounts_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<accounts_max_fields>;
  min?: Maybe<accounts_min_fields>;
  stddev?: Maybe<accounts_stddev_fields>;
  stddev_pop?: Maybe<accounts_stddev_pop_fields>;
  stddev_samp?: Maybe<accounts_stddev_samp_fields>;
  sum?: Maybe<accounts_sum_fields>;
  var_pop?: Maybe<accounts_var_pop_fields>;
  var_samp?: Maybe<accounts_var_samp_fields>;
  variance?: Maybe<accounts_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface accounts_avg_fields {
  __typename?: "accounts_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface accounts_max_fields {
  __typename?: "accounts_max_fields";
  blockchain_address?: Maybe<ScalarsEnums["String"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface accounts_min_fields {
  __typename?: "accounts_min_fields";
  blockchain_address?: Maybe<ScalarsEnums["String"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "accounts"
 */
export interface accounts_mutation_response {
  __typename?: "accounts_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<accounts>;
}

/**
 * aggregate stddev on columns
 */
export interface accounts_stddev_fields {
  __typename?: "accounts_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface accounts_stddev_pop_fields {
  __typename?: "accounts_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface accounts_stddev_samp_fields {
  __typename?: "accounts_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface accounts_sum_fields {
  __typename?: "accounts_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface accounts_var_pop_fields {
  __typename?: "accounts_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface accounts_var_samp_fields {
  __typename?: "accounts_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface accounts_variance_fields {
  __typename?: "accounts_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "gender_type"
 */
export interface gender_type {
  __typename?: "gender_type";
  /**
   * An array relationship
   */
  personal_informations: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<personal_information_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<personal_information_bool_exp>;
  }) => Array<personal_information>;
  /**
   * An aggregate relationship
   */
  personal_informations_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<personal_information_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<personal_information_bool_exp>;
  }) => personal_information_aggregate;
  value: ScalarsEnums["String"];
}

/**
 * aggregated selection of "gender_type"
 */
export interface gender_type_aggregate {
  __typename?: "gender_type_aggregate";
  aggregate?: Maybe<gender_type_aggregate_fields>;
  nodes: Array<gender_type>;
}

/**
 * aggregate fields of "gender_type"
 */
export interface gender_type_aggregate_fields {
  __typename?: "gender_type_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<gender_type_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<gender_type_max_fields>;
  min?: Maybe<gender_type_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface gender_type_max_fields {
  __typename?: "gender_type_max_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface gender_type_min_fields {
  __typename?: "gender_type_min_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "gender_type"
 */
export interface gender_type_mutation_response {
  __typename?: "gender_type_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<gender_type>;
}

/**
 * columns and relationships of "interface_type"
 */
export interface interface_type {
  __typename?: "interface_type";
  /**
   * An array relationship
   */
  users: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  /**
   * An aggregate relationship
   */
  users_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
  value: ScalarsEnums["String"];
}

/**
 * aggregated selection of "interface_type"
 */
export interface interface_type_aggregate {
  __typename?: "interface_type_aggregate";
  aggregate?: Maybe<interface_type_aggregate_fields>;
  nodes: Array<interface_type>;
}

/**
 * aggregate fields of "interface_type"
 */
export interface interface_type_aggregate_fields {
  __typename?: "interface_type_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<interface_type_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<interface_type_max_fields>;
  min?: Maybe<interface_type_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface interface_type_max_fields {
  __typename?: "interface_type_max_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface interface_type_min_fields {
  __typename?: "interface_type_min_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "interface_type"
 */
export interface interface_type_mutation_response {
  __typename?: "interface_type_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<interface_type>;
}

/**
 * columns and relationships of "marketplaces"
 */
export interface marketplaces {
  __typename?: "marketplaces";
  account: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  accountByAccount: accounts;
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  marketplace_name: ScalarsEnums["String"];
  /**
   * An array relationship
   */
  services: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  /**
   * An aggregate relationship
   */
  services_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => services_aggregate;
}

/**
 * aggregated selection of "marketplaces"
 */
export interface marketplaces_aggregate {
  __typename?: "marketplaces_aggregate";
  aggregate?: Maybe<marketplaces_aggregate_fields>;
  nodes: Array<marketplaces>;
}

/**
 * aggregate fields of "marketplaces"
 */
export interface marketplaces_aggregate_fields {
  __typename?: "marketplaces_aggregate_fields";
  avg?: Maybe<marketplaces_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<marketplaces_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<marketplaces_max_fields>;
  min?: Maybe<marketplaces_min_fields>;
  stddev?: Maybe<marketplaces_stddev_fields>;
  stddev_pop?: Maybe<marketplaces_stddev_pop_fields>;
  stddev_samp?: Maybe<marketplaces_stddev_samp_fields>;
  sum?: Maybe<marketplaces_sum_fields>;
  var_pop?: Maybe<marketplaces_var_pop_fields>;
  var_samp?: Maybe<marketplaces_var_samp_fields>;
  variance?: Maybe<marketplaces_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface marketplaces_avg_fields {
  __typename?: "marketplaces_avg_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface marketplaces_max_fields {
  __typename?: "marketplaces_max_fields";
  account?: Maybe<ScalarsEnums["Int"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  marketplace_name?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface marketplaces_min_fields {
  __typename?: "marketplaces_min_fields";
  account?: Maybe<ScalarsEnums["Int"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  marketplace_name?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "marketplaces"
 */
export interface marketplaces_mutation_response {
  __typename?: "marketplaces_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<marketplaces>;
}

/**
 * aggregate stddev on columns
 */
export interface marketplaces_stddev_fields {
  __typename?: "marketplaces_stddev_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface marketplaces_stddev_pop_fields {
  __typename?: "marketplaces_stddev_pop_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface marketplaces_stddev_samp_fields {
  __typename?: "marketplaces_stddev_samp_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface marketplaces_sum_fields {
  __typename?: "marketplaces_sum_fields";
  account?: Maybe<ScalarsEnums["Int"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface marketplaces_var_pop_fields {
  __typename?: "marketplaces_var_pop_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface marketplaces_var_samp_fields {
  __typename?: "marketplaces_var_samp_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface marketplaces_variance_fields {
  __typename?: "marketplaces_variance_fields";
  account?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
}

export interface Mutation {
  __typename?: "Mutation";
  delete_account_type: (args: {
    where: account_type_bool_exp;
  }) => Maybe<account_type_mutation_response>;
  delete_account_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<account_type>;
  delete_accounts: (args: {
    where: accounts_bool_exp;
  }) => Maybe<accounts_mutation_response>;
  delete_accounts_by_pk: (args: { id: Scalars["Int"] }) => Maybe<accounts>;
  delete_gender_type: (args: {
    where: gender_type_bool_exp;
  }) => Maybe<gender_type_mutation_response>;
  delete_gender_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<gender_type>;
  delete_interface_type: (args: {
    where: interface_type_bool_exp;
  }) => Maybe<interface_type_mutation_response>;
  delete_interface_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<interface_type>;
  delete_marketplaces: (args: {
    where: marketplaces_bool_exp;
  }) => Maybe<marketplaces_mutation_response>;
  delete_marketplaces_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<marketplaces>;
  delete_personal_information: (args: {
    where: personal_information_bool_exp;
  }) => Maybe<personal_information_mutation_response>;
  delete_service_accepted_payment: (args: {
    where: service_accepted_payment_bool_exp;
  }) => Maybe<service_accepted_payment_mutation_response>;
  delete_service_accepted_payment_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<service_accepted_payment>;
  delete_service_type: (args: {
    where: service_type_bool_exp;
  }) => Maybe<service_type_mutation_response>;
  delete_service_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<service_type>;
  delete_services: (args: {
    where: services_bool_exp;
  }) => Maybe<services_mutation_response>;
  delete_services_by_pk: (args: { id: Scalars["Int"] }) => Maybe<services>;
  delete_services_images: (args: {
    where: services_images_bool_exp;
  }) => Maybe<services_images_mutation_response>;
  delete_services_images_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_images>;
  delete_services_ratings: (args: {
    where: services_ratings_bool_exp;
  }) => Maybe<services_ratings_mutation_response>;
  delete_services_ratings_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_ratings>;
  delete_till: (args: {
    where: till_bool_exp;
  }) => Maybe<till_mutation_response>;
  delete_till_by_pk: (args: { id: Scalars["Int"] }) => Maybe<till>;
  delete_transactions: (args: {
    where: transactions_bool_exp;
  }) => Maybe<transactions_mutation_response>;
  delete_transactions_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<transactions>;
  delete_tx_type: (args: {
    where: tx_type_bool_exp;
  }) => Maybe<tx_type_mutation_response>;
  delete_tx_type_by_pk: (args: { value: Scalars["String"] }) => Maybe<tx_type>;
  delete_users: (args: {
    where: users_bool_exp;
  }) => Maybe<users_mutation_response>;
  delete_users_by_pk: (args: { id: Scalars["Int"] }) => Maybe<users>;
  delete_voucher_certifications: (args: {
    where: voucher_certifications_bool_exp;
  }) => Maybe<voucher_certifications_mutation_response>;
  delete_voucher_certifications_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_certifications>;
  delete_voucher_issuers: (args: {
    where: voucher_issuers_bool_exp;
  }) => Maybe<voucher_issuers_mutation_response>;
  delete_voucher_issuers_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_issuers>;
  delete_vouchers: (args: {
    where: vouchers_bool_exp;
  }) => Maybe<vouchers_mutation_response>;
  delete_vouchers_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vouchers>;
  delete_vpa: (args: { where: vpa_bool_exp }) => Maybe<vpa_mutation_response>;
  delete_vpa_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vpa>;
  insert_account_type: (args: {
    objects: Array<account_type_insert_input>;
    on_conflict?: Maybe<account_type_on_conflict>;
  }) => Maybe<account_type_mutation_response>;
  insert_account_type_one: (args: {
    object: account_type_insert_input;
    on_conflict?: Maybe<account_type_on_conflict>;
  }) => Maybe<account_type>;
  insert_accounts: (args: {
    objects: Array<accounts_insert_input>;
    on_conflict?: Maybe<accounts_on_conflict>;
  }) => Maybe<accounts_mutation_response>;
  insert_accounts_one: (args: {
    object: accounts_insert_input;
    on_conflict?: Maybe<accounts_on_conflict>;
  }) => Maybe<accounts>;
  insert_gender_type: (args: {
    objects: Array<gender_type_insert_input>;
    on_conflict?: Maybe<gender_type_on_conflict>;
  }) => Maybe<gender_type_mutation_response>;
  insert_gender_type_one: (args: {
    object: gender_type_insert_input;
    on_conflict?: Maybe<gender_type_on_conflict>;
  }) => Maybe<gender_type>;
  insert_interface_type: (args: {
    objects: Array<interface_type_insert_input>;
    on_conflict?: Maybe<interface_type_on_conflict>;
  }) => Maybe<interface_type_mutation_response>;
  insert_interface_type_one: (args: {
    object: interface_type_insert_input;
    on_conflict?: Maybe<interface_type_on_conflict>;
  }) => Maybe<interface_type>;
  insert_marketplaces: (args: {
    objects: Array<marketplaces_insert_input>;
    on_conflict?: Maybe<marketplaces_on_conflict>;
  }) => Maybe<marketplaces_mutation_response>;
  insert_marketplaces_one: (args: {
    object: marketplaces_insert_input;
    on_conflict?: Maybe<marketplaces_on_conflict>;
  }) => Maybe<marketplaces>;
  insert_personal_information: (args: {
    objects: Array<personal_information_insert_input>;
    on_conflict?: Maybe<personal_information_on_conflict>;
  }) => Maybe<personal_information_mutation_response>;
  insert_personal_information_one: (args: {
    object: personal_information_insert_input;
    on_conflict?: Maybe<personal_information_on_conflict>;
  }) => Maybe<personal_information>;
  insert_service_accepted_payment: (args: {
    objects: Array<service_accepted_payment_insert_input>;
    on_conflict?: Maybe<service_accepted_payment_on_conflict>;
  }) => Maybe<service_accepted_payment_mutation_response>;
  insert_service_accepted_payment_one: (args: {
    object: service_accepted_payment_insert_input;
    on_conflict?: Maybe<service_accepted_payment_on_conflict>;
  }) => Maybe<service_accepted_payment>;
  insert_service_type: (args: {
    objects: Array<service_type_insert_input>;
    on_conflict?: Maybe<service_type_on_conflict>;
  }) => Maybe<service_type_mutation_response>;
  insert_service_type_one: (args: {
    object: service_type_insert_input;
    on_conflict?: Maybe<service_type_on_conflict>;
  }) => Maybe<service_type>;
  insert_services: (args: {
    objects: Array<services_insert_input>;
    on_conflict?: Maybe<services_on_conflict>;
  }) => Maybe<services_mutation_response>;
  insert_services_images: (args: {
    objects: Array<services_images_insert_input>;
    on_conflict?: Maybe<services_images_on_conflict>;
  }) => Maybe<services_images_mutation_response>;
  insert_services_images_one: (args: {
    object: services_images_insert_input;
    on_conflict?: Maybe<services_images_on_conflict>;
  }) => Maybe<services_images>;
  insert_services_one: (args: {
    object: services_insert_input;
    on_conflict?: Maybe<services_on_conflict>;
  }) => Maybe<services>;
  insert_services_ratings: (args: {
    objects: Array<services_ratings_insert_input>;
    on_conflict?: Maybe<services_ratings_on_conflict>;
  }) => Maybe<services_ratings_mutation_response>;
  insert_services_ratings_one: (args: {
    object: services_ratings_insert_input;
    on_conflict?: Maybe<services_ratings_on_conflict>;
  }) => Maybe<services_ratings>;
  insert_till: (args: {
    objects: Array<till_insert_input>;
    on_conflict?: Maybe<till_on_conflict>;
  }) => Maybe<till_mutation_response>;
  insert_till_one: (args: {
    object: till_insert_input;
    on_conflict?: Maybe<till_on_conflict>;
  }) => Maybe<till>;
  insert_transactions: (args: {
    objects: Array<transactions_insert_input>;
    on_conflict?: Maybe<transactions_on_conflict>;
  }) => Maybe<transactions_mutation_response>;
  insert_transactions_one: (args: {
    object: transactions_insert_input;
    on_conflict?: Maybe<transactions_on_conflict>;
  }) => Maybe<transactions>;
  insert_tx_type: (args: {
    objects: Array<tx_type_insert_input>;
    on_conflict?: Maybe<tx_type_on_conflict>;
  }) => Maybe<tx_type_mutation_response>;
  insert_tx_type_one: (args: {
    object: tx_type_insert_input;
    on_conflict?: Maybe<tx_type_on_conflict>;
  }) => Maybe<tx_type>;
  insert_users: (args: {
    objects: Array<users_insert_input>;
    on_conflict?: Maybe<users_on_conflict>;
  }) => Maybe<users_mutation_response>;
  insert_users_one: (args: {
    object: users_insert_input;
    on_conflict?: Maybe<users_on_conflict>;
  }) => Maybe<users>;
  insert_voucher_certifications: (args: {
    objects: Array<voucher_certifications_insert_input>;
    on_conflict?: Maybe<voucher_certifications_on_conflict>;
  }) => Maybe<voucher_certifications_mutation_response>;
  insert_voucher_certifications_one: (args: {
    object: voucher_certifications_insert_input;
    on_conflict?: Maybe<voucher_certifications_on_conflict>;
  }) => Maybe<voucher_certifications>;
  insert_voucher_issuers: (args: {
    objects: Array<voucher_issuers_insert_input>;
    on_conflict?: Maybe<voucher_issuers_on_conflict>;
  }) => Maybe<voucher_issuers_mutation_response>;
  insert_voucher_issuers_one: (args: {
    object: voucher_issuers_insert_input;
    on_conflict?: Maybe<voucher_issuers_on_conflict>;
  }) => Maybe<voucher_issuers>;
  insert_vouchers: (args: {
    objects: Array<vouchers_insert_input>;
    on_conflict?: Maybe<vouchers_on_conflict>;
  }) => Maybe<vouchers_mutation_response>;
  insert_vouchers_one: (args: {
    object: vouchers_insert_input;
    on_conflict?: Maybe<vouchers_on_conflict>;
  }) => Maybe<vouchers>;
  insert_vpa: (args: {
    objects: Array<vpa_insert_input>;
    on_conflict?: Maybe<vpa_on_conflict>;
  }) => Maybe<vpa_mutation_response>;
  insert_vpa_one: (args: {
    object: vpa_insert_input;
    on_conflict?: Maybe<vpa_on_conflict>;
  }) => Maybe<vpa>;
  update_account_type: (args: {
    _set?: Maybe<account_type_set_input>;
    where: account_type_bool_exp;
  }) => Maybe<account_type_mutation_response>;
  update_account_type_by_pk: (args: {
    _set?: Maybe<account_type_set_input>;
    pk_columns: account_type_pk_columns_input;
  }) => Maybe<account_type>;
  update_account_type_many: (args: {
    updates: Array<account_type_updates>;
  }) => Maybe<Array<Maybe<account_type_mutation_response>>>;
  update_accounts: (args: {
    _inc?: Maybe<accounts_inc_input>;
    _set?: Maybe<accounts_set_input>;
    where: accounts_bool_exp;
  }) => Maybe<accounts_mutation_response>;
  update_accounts_by_pk: (args: {
    _inc?: Maybe<accounts_inc_input>;
    _set?: Maybe<accounts_set_input>;
    pk_columns: accounts_pk_columns_input;
  }) => Maybe<accounts>;
  update_accounts_many: (args: {
    updates: Array<accounts_updates>;
  }) => Maybe<Array<Maybe<accounts_mutation_response>>>;
  update_gender_type: (args: {
    _set?: Maybe<gender_type_set_input>;
    where: gender_type_bool_exp;
  }) => Maybe<gender_type_mutation_response>;
  update_gender_type_by_pk: (args: {
    _set?: Maybe<gender_type_set_input>;
    pk_columns: gender_type_pk_columns_input;
  }) => Maybe<gender_type>;
  update_gender_type_many: (args: {
    updates: Array<gender_type_updates>;
  }) => Maybe<Array<Maybe<gender_type_mutation_response>>>;
  update_interface_type: (args: {
    _set?: Maybe<interface_type_set_input>;
    where: interface_type_bool_exp;
  }) => Maybe<interface_type_mutation_response>;
  update_interface_type_by_pk: (args: {
    _set?: Maybe<interface_type_set_input>;
    pk_columns: interface_type_pk_columns_input;
  }) => Maybe<interface_type>;
  update_interface_type_many: (args: {
    updates: Array<interface_type_updates>;
  }) => Maybe<Array<Maybe<interface_type_mutation_response>>>;
  update_marketplaces: (args: {
    _inc?: Maybe<marketplaces_inc_input>;
    _set?: Maybe<marketplaces_set_input>;
    where: marketplaces_bool_exp;
  }) => Maybe<marketplaces_mutation_response>;
  update_marketplaces_by_pk: (args: {
    _inc?: Maybe<marketplaces_inc_input>;
    _set?: Maybe<marketplaces_set_input>;
    pk_columns: marketplaces_pk_columns_input;
  }) => Maybe<marketplaces>;
  update_marketplaces_many: (args: {
    updates: Array<marketplaces_updates>;
  }) => Maybe<Array<Maybe<marketplaces_mutation_response>>>;
  update_personal_information: (args: {
    _inc?: Maybe<personal_information_inc_input>;
    _set?: Maybe<personal_information_set_input>;
    where: personal_information_bool_exp;
  }) => Maybe<personal_information_mutation_response>;
  update_personal_information_many: (args: {
    updates: Array<personal_information_updates>;
  }) => Maybe<Array<Maybe<personal_information_mutation_response>>>;
  update_service_accepted_payment: (args: {
    _inc?: Maybe<service_accepted_payment_inc_input>;
    _set?: Maybe<service_accepted_payment_set_input>;
    where: service_accepted_payment_bool_exp;
  }) => Maybe<service_accepted_payment_mutation_response>;
  update_service_accepted_payment_by_pk: (args: {
    _inc?: Maybe<service_accepted_payment_inc_input>;
    _set?: Maybe<service_accepted_payment_set_input>;
    pk_columns: service_accepted_payment_pk_columns_input;
  }) => Maybe<service_accepted_payment>;
  update_service_accepted_payment_many: (args: {
    updates: Array<service_accepted_payment_updates>;
  }) => Maybe<Array<Maybe<service_accepted_payment_mutation_response>>>;
  update_service_type: (args: {
    _set?: Maybe<service_type_set_input>;
    where: service_type_bool_exp;
  }) => Maybe<service_type_mutation_response>;
  update_service_type_by_pk: (args: {
    _set?: Maybe<service_type_set_input>;
    pk_columns: service_type_pk_columns_input;
  }) => Maybe<service_type>;
  update_service_type_many: (args: {
    updates: Array<service_type_updates>;
  }) => Maybe<Array<Maybe<service_type_mutation_response>>>;
  update_services: (args: {
    _inc?: Maybe<services_inc_input>;
    _set?: Maybe<services_set_input>;
    where: services_bool_exp;
  }) => Maybe<services_mutation_response>;
  update_services_by_pk: (args: {
    _inc?: Maybe<services_inc_input>;
    _set?: Maybe<services_set_input>;
    pk_columns: services_pk_columns_input;
  }) => Maybe<services>;
  update_services_images: (args: {
    _inc?: Maybe<services_images_inc_input>;
    _set?: Maybe<services_images_set_input>;
    where: services_images_bool_exp;
  }) => Maybe<services_images_mutation_response>;
  update_services_images_by_pk: (args: {
    _inc?: Maybe<services_images_inc_input>;
    _set?: Maybe<services_images_set_input>;
    pk_columns: services_images_pk_columns_input;
  }) => Maybe<services_images>;
  update_services_images_many: (args: {
    updates: Array<services_images_updates>;
  }) => Maybe<Array<Maybe<services_images_mutation_response>>>;
  update_services_many: (args: {
    updates: Array<services_updates>;
  }) => Maybe<Array<Maybe<services_mutation_response>>>;
  update_services_ratings: (args: {
    _inc?: Maybe<services_ratings_inc_input>;
    _set?: Maybe<services_ratings_set_input>;
    where: services_ratings_bool_exp;
  }) => Maybe<services_ratings_mutation_response>;
  update_services_ratings_by_pk: (args: {
    _inc?: Maybe<services_ratings_inc_input>;
    _set?: Maybe<services_ratings_set_input>;
    pk_columns: services_ratings_pk_columns_input;
  }) => Maybe<services_ratings>;
  update_services_ratings_many: (args: {
    updates: Array<services_ratings_updates>;
  }) => Maybe<Array<Maybe<services_ratings_mutation_response>>>;
  update_till: (args: {
    _inc?: Maybe<till_inc_input>;
    _set?: Maybe<till_set_input>;
    where: till_bool_exp;
  }) => Maybe<till_mutation_response>;
  update_till_by_pk: (args: {
    _inc?: Maybe<till_inc_input>;
    _set?: Maybe<till_set_input>;
    pk_columns: till_pk_columns_input;
  }) => Maybe<till>;
  update_till_many: (args: {
    updates: Array<till_updates>;
  }) => Maybe<Array<Maybe<till_mutation_response>>>;
  update_transactions: (args: {
    _inc?: Maybe<transactions_inc_input>;
    _set?: Maybe<transactions_set_input>;
    where: transactions_bool_exp;
  }) => Maybe<transactions_mutation_response>;
  update_transactions_by_pk: (args: {
    _inc?: Maybe<transactions_inc_input>;
    _set?: Maybe<transactions_set_input>;
    pk_columns: transactions_pk_columns_input;
  }) => Maybe<transactions>;
  update_transactions_many: (args: {
    updates: Array<transactions_updates>;
  }) => Maybe<Array<Maybe<transactions_mutation_response>>>;
  update_tx_type: (args: {
    _set?: Maybe<tx_type_set_input>;
    where: tx_type_bool_exp;
  }) => Maybe<tx_type_mutation_response>;
  update_tx_type_by_pk: (args: {
    _set?: Maybe<tx_type_set_input>;
    pk_columns: tx_type_pk_columns_input;
  }) => Maybe<tx_type>;
  update_tx_type_many: (args: {
    updates: Array<tx_type_updates>;
  }) => Maybe<Array<Maybe<tx_type_mutation_response>>>;
  update_users: (args: {
    _set?: Maybe<users_set_input>;
    where: users_bool_exp;
  }) => Maybe<users_mutation_response>;
  update_users_by_pk: (args: {
    _set?: Maybe<users_set_input>;
    pk_columns: users_pk_columns_input;
  }) => Maybe<users>;
  update_users_many: (args: {
    updates: Array<users_updates>;
  }) => Maybe<Array<Maybe<users_mutation_response>>>;
  update_voucher_certifications: (args: {
    _inc?: Maybe<voucher_certifications_inc_input>;
    _set?: Maybe<voucher_certifications_set_input>;
    where: voucher_certifications_bool_exp;
  }) => Maybe<voucher_certifications_mutation_response>;
  update_voucher_certifications_by_pk: (args: {
    _inc?: Maybe<voucher_certifications_inc_input>;
    _set?: Maybe<voucher_certifications_set_input>;
    pk_columns: voucher_certifications_pk_columns_input;
  }) => Maybe<voucher_certifications>;
  update_voucher_certifications_many: (args: {
    updates: Array<voucher_certifications_updates>;
  }) => Maybe<Array<Maybe<voucher_certifications_mutation_response>>>;
  update_voucher_issuers: (args: {
    _inc?: Maybe<voucher_issuers_inc_input>;
    _set?: Maybe<voucher_issuers_set_input>;
    where: voucher_issuers_bool_exp;
  }) => Maybe<voucher_issuers_mutation_response>;
  update_voucher_issuers_by_pk: (args: {
    _inc?: Maybe<voucher_issuers_inc_input>;
    _set?: Maybe<voucher_issuers_set_input>;
    pk_columns: voucher_issuers_pk_columns_input;
  }) => Maybe<voucher_issuers>;
  update_voucher_issuers_many: (args: {
    updates: Array<voucher_issuers_updates>;
  }) => Maybe<Array<Maybe<voucher_issuers_mutation_response>>>;
  update_vouchers: (args: {
    _inc?: Maybe<vouchers_inc_input>;
    _set?: Maybe<vouchers_set_input>;
    where: vouchers_bool_exp;
  }) => Maybe<vouchers_mutation_response>;
  update_vouchers_by_pk: (args: {
    _inc?: Maybe<vouchers_inc_input>;
    _set?: Maybe<vouchers_set_input>;
    pk_columns: vouchers_pk_columns_input;
  }) => Maybe<vouchers>;
  update_vouchers_many: (args: {
    updates: Array<vouchers_updates>;
  }) => Maybe<Array<Maybe<vouchers_mutation_response>>>;
  update_vpa: (args: {
    _inc?: Maybe<vpa_inc_input>;
    _set?: Maybe<vpa_set_input>;
    where: vpa_bool_exp;
  }) => Maybe<vpa_mutation_response>;
  update_vpa_by_pk: (args: {
    _inc?: Maybe<vpa_inc_input>;
    _set?: Maybe<vpa_set_input>;
    pk_columns: vpa_pk_columns_input;
  }) => Maybe<vpa>;
  update_vpa_many: (args: {
    updates: Array<vpa_updates>;
  }) => Maybe<Array<Maybe<vpa_mutation_response>>>;
}

/**
 * columns and relationships of "personal_information"
 */
export interface personal_information {
  __typename?: "personal_information";
  family_name?: Maybe<ScalarsEnums["String"]>;
  gender?: Maybe<ScalarsEnums["gender_type_enum"]>;
  /**
   * An object relationship
   */
  gender_type?: Maybe<gender_type>;
  geo?: Maybe<ScalarsEnums["point"]>;
  given_names?: Maybe<ScalarsEnums["String"]>;
  language_code?: Maybe<ScalarsEnums["String"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  /**
   * An object relationship
   */
  user: users;
  user_identifier: ScalarsEnums["Int"];
  year_of_birth?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregated selection of "personal_information"
 */
export interface personal_information_aggregate {
  __typename?: "personal_information_aggregate";
  aggregate?: Maybe<personal_information_aggregate_fields>;
  nodes: Array<personal_information>;
}

/**
 * aggregate fields of "personal_information"
 */
export interface personal_information_aggregate_fields {
  __typename?: "personal_information_aggregate_fields";
  avg?: Maybe<personal_information_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<personal_information_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<personal_information_max_fields>;
  min?: Maybe<personal_information_min_fields>;
  stddev?: Maybe<personal_information_stddev_fields>;
  stddev_pop?: Maybe<personal_information_stddev_pop_fields>;
  stddev_samp?: Maybe<personal_information_stddev_samp_fields>;
  sum?: Maybe<personal_information_sum_fields>;
  var_pop?: Maybe<personal_information_var_pop_fields>;
  var_samp?: Maybe<personal_information_var_samp_fields>;
  variance?: Maybe<personal_information_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface personal_information_avg_fields {
  __typename?: "personal_information_avg_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface personal_information_max_fields {
  __typename?: "personal_information_max_fields";
  family_name?: Maybe<ScalarsEnums["String"]>;
  given_names?: Maybe<ScalarsEnums["String"]>;
  language_code?: Maybe<ScalarsEnums["String"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
  year_of_birth?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface personal_information_min_fields {
  __typename?: "personal_information_min_fields";
  family_name?: Maybe<ScalarsEnums["String"]>;
  given_names?: Maybe<ScalarsEnums["String"]>;
  language_code?: Maybe<ScalarsEnums["String"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
  year_of_birth?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "personal_information"
 */
export interface personal_information_mutation_response {
  __typename?: "personal_information_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<personal_information>;
}

/**
 * aggregate stddev on columns
 */
export interface personal_information_stddev_fields {
  __typename?: "personal_information_stddev_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface personal_information_stddev_pop_fields {
  __typename?: "personal_information_stddev_pop_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface personal_information_stddev_samp_fields {
  __typename?: "personal_information_stddev_samp_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface personal_information_sum_fields {
  __typename?: "personal_information_sum_fields";
  user_identifier?: Maybe<ScalarsEnums["Int"]>;
  year_of_birth?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface personal_information_var_pop_fields {
  __typename?: "personal_information_var_pop_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface personal_information_var_samp_fields {
  __typename?: "personal_information_var_samp_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface personal_information_variance_fields {
  __typename?: "personal_information_variance_fields";
  user_identifier?: Maybe<ScalarsEnums["Float"]>;
  year_of_birth?: Maybe<ScalarsEnums["Float"]>;
}

export interface Query {
  __typename?: "Query";
  account_type: (args?: {
    distinct_on?: Maybe<Array<account_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<account_type_order_by>>;
    where?: Maybe<account_type_bool_exp>;
  }) => Array<account_type>;
  account_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<account_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<account_type_order_by>>;
    where?: Maybe<account_type_bool_exp>;
  }) => account_type_aggregate;
  account_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<account_type>;
  accounts: (args?: {
    distinct_on?: Maybe<Array<accounts_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<accounts_order_by>>;
    where?: Maybe<accounts_bool_exp>;
  }) => Array<accounts>;
  accounts_aggregate: (args?: {
    distinct_on?: Maybe<Array<accounts_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<accounts_order_by>>;
    where?: Maybe<accounts_bool_exp>;
  }) => accounts_aggregate;
  accounts_by_pk: (args: { id: Scalars["Int"] }) => Maybe<accounts>;
  gender_type: (args?: {
    distinct_on?: Maybe<Array<gender_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<gender_type_order_by>>;
    where?: Maybe<gender_type_bool_exp>;
  }) => Array<gender_type>;
  gender_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<gender_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<gender_type_order_by>>;
    where?: Maybe<gender_type_bool_exp>;
  }) => gender_type_aggregate;
  gender_type_by_pk: (args: { value: Scalars["String"] }) => Maybe<gender_type>;
  interface_type: (args?: {
    distinct_on?: Maybe<Array<interface_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<interface_type_order_by>>;
    where?: Maybe<interface_type_bool_exp>;
  }) => Array<interface_type>;
  interface_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<interface_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<interface_type_order_by>>;
    where?: Maybe<interface_type_bool_exp>;
  }) => interface_type_aggregate;
  interface_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<interface_type>;
  marketplaces: (args?: {
    distinct_on?: Maybe<Array<marketplaces_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<marketplaces_order_by>>;
    where?: Maybe<marketplaces_bool_exp>;
  }) => Array<marketplaces>;
  marketplaces_aggregate: (args?: {
    distinct_on?: Maybe<Array<marketplaces_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<marketplaces_order_by>>;
    where?: Maybe<marketplaces_bool_exp>;
  }) => marketplaces_aggregate;
  marketplaces_by_pk: (args: { id: Scalars["Int"] }) => Maybe<marketplaces>;
  personal_information: (args?: {
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<personal_information_order_by>>;
    where?: Maybe<personal_information_bool_exp>;
  }) => Array<personal_information>;
  personal_information_aggregate: (args?: {
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<personal_information_order_by>>;
    where?: Maybe<personal_information_bool_exp>;
  }) => personal_information_aggregate;
  service_accepted_payment: (args?: {
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => Array<service_accepted_payment>;
  service_accepted_payment_aggregate: (args?: {
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => service_accepted_payment_aggregate;
  service_accepted_payment_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<service_accepted_payment>;
  service_type: (args?: {
    distinct_on?: Maybe<Array<service_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_type_order_by>>;
    where?: Maybe<service_type_bool_exp>;
  }) => Array<service_type>;
  service_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<service_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_type_order_by>>;
    where?: Maybe<service_type_bool_exp>;
  }) => service_type_aggregate;
  service_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<service_type>;
  services: (args?: {
    distinct_on?: Maybe<Array<services_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_order_by>>;
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  services_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_order_by>>;
    where?: Maybe<services_bool_exp>;
  }) => services_aggregate;
  services_by_pk: (args: { id: Scalars["Int"] }) => Maybe<services>;
  services_images: (args?: {
    distinct_on?: Maybe<Array<services_images_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_images_order_by>>;
    where?: Maybe<services_images_bool_exp>;
  }) => Array<services_images>;
  services_images_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_images_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_images_order_by>>;
    where?: Maybe<services_images_bool_exp>;
  }) => services_images_aggregate;
  services_images_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_images>;
  services_ratings: (args?: {
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_ratings_order_by>>;
    where?: Maybe<services_ratings_bool_exp>;
  }) => Array<services_ratings>;
  services_ratings_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_ratings_order_by>>;
    where?: Maybe<services_ratings_bool_exp>;
  }) => services_ratings_aggregate;
  services_ratings_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_ratings>;
  till: (args?: {
    distinct_on?: Maybe<Array<till_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<till_order_by>>;
    where?: Maybe<till_bool_exp>;
  }) => Array<till>;
  till_aggregate: (args?: {
    distinct_on?: Maybe<Array<till_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<till_order_by>>;
    where?: Maybe<till_bool_exp>;
  }) => till_aggregate;
  till_by_pk: (args: { id: Scalars["Int"] }) => Maybe<till>;
  transactions: (args?: {
    distinct_on?: Maybe<Array<transactions_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<transactions_order_by>>;
    where?: Maybe<transactions_bool_exp>;
  }) => Array<transactions>;
  transactions_aggregate: (args?: {
    distinct_on?: Maybe<Array<transactions_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<transactions_order_by>>;
    where?: Maybe<transactions_bool_exp>;
  }) => transactions_aggregate;
  transactions_by_pk: (args: { id: Scalars["Int"] }) => Maybe<transactions>;
  tx_type: (args?: {
    distinct_on?: Maybe<Array<tx_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<tx_type_order_by>>;
    where?: Maybe<tx_type_bool_exp>;
  }) => Array<tx_type>;
  tx_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<tx_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<tx_type_order_by>>;
    where?: Maybe<tx_type_bool_exp>;
  }) => tx_type_aggregate;
  tx_type_by_pk: (args: { value: Scalars["String"] }) => Maybe<tx_type>;
  users: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  users_aggregate: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
  users_by_pk: (args: { id: Scalars["Int"] }) => Maybe<users>;
  voucher_certifications: (args?: {
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => Array<voucher_certifications>;
  voucher_certifications_aggregate: (args?: {
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => voucher_certifications_aggregate;
  voucher_certifications_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_certifications>;
  voucher_issuers: (args?: {
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => Array<voucher_issuers>;
  voucher_issuers_aggregate: (args?: {
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => voucher_issuers_aggregate;
  voucher_issuers_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_issuers>;
  vouchers: (args?: {
    distinct_on?: Maybe<Array<vouchers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vouchers_order_by>>;
    where?: Maybe<vouchers_bool_exp>;
  }) => Array<vouchers>;
  vouchers_aggregate: (args?: {
    distinct_on?: Maybe<Array<vouchers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vouchers_order_by>>;
    where?: Maybe<vouchers_bool_exp>;
  }) => vouchers_aggregate;
  vouchers_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vouchers>;
  vpa: (args?: {
    distinct_on?: Maybe<Array<vpa_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vpa_order_by>>;
    where?: Maybe<vpa_bool_exp>;
  }) => Array<vpa>;
  vpa_aggregate: (args?: {
    distinct_on?: Maybe<Array<vpa_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vpa_order_by>>;
    where?: Maybe<vpa_bool_exp>;
  }) => vpa_aggregate;
  vpa_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vpa>;
}

/**
 * columns and relationships of "service_accepted_payment"
 */
export interface service_accepted_payment {
  __typename?: "service_accepted_payment";
  id: ScalarsEnums["Int"];
  price: ScalarsEnums["float8"];
  /**
   * An array relationship
   */
  services: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  /**
   * An aggregate relationship
   */
  services_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => services_aggregate;
  voucher: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  voucherByVoucher: vouchers;
}

/**
 * aggregated selection of "service_accepted_payment"
 */
export interface service_accepted_payment_aggregate {
  __typename?: "service_accepted_payment_aggregate";
  aggregate?: Maybe<service_accepted_payment_aggregate_fields>;
  nodes: Array<service_accepted_payment>;
}

/**
 * aggregate fields of "service_accepted_payment"
 */
export interface service_accepted_payment_aggregate_fields {
  __typename?: "service_accepted_payment_aggregate_fields";
  avg?: Maybe<service_accepted_payment_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<service_accepted_payment_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<service_accepted_payment_max_fields>;
  min?: Maybe<service_accepted_payment_min_fields>;
  stddev?: Maybe<service_accepted_payment_stddev_fields>;
  stddev_pop?: Maybe<service_accepted_payment_stddev_pop_fields>;
  stddev_samp?: Maybe<service_accepted_payment_stddev_samp_fields>;
  sum?: Maybe<service_accepted_payment_sum_fields>;
  var_pop?: Maybe<service_accepted_payment_var_pop_fields>;
  var_samp?: Maybe<service_accepted_payment_var_samp_fields>;
  variance?: Maybe<service_accepted_payment_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface service_accepted_payment_avg_fields {
  __typename?: "service_accepted_payment_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface service_accepted_payment_max_fields {
  __typename?: "service_accepted_payment_max_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  price?: Maybe<ScalarsEnums["float8"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface service_accepted_payment_min_fields {
  __typename?: "service_accepted_payment_min_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  price?: Maybe<ScalarsEnums["float8"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "service_accepted_payment"
 */
export interface service_accepted_payment_mutation_response {
  __typename?: "service_accepted_payment_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<service_accepted_payment>;
}

/**
 * aggregate stddev on columns
 */
export interface service_accepted_payment_stddev_fields {
  __typename?: "service_accepted_payment_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface service_accepted_payment_stddev_pop_fields {
  __typename?: "service_accepted_payment_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface service_accepted_payment_stddev_samp_fields {
  __typename?: "service_accepted_payment_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface service_accepted_payment_sum_fields {
  __typename?: "service_accepted_payment_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  price?: Maybe<ScalarsEnums["float8"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface service_accepted_payment_var_pop_fields {
  __typename?: "service_accepted_payment_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface service_accepted_payment_var_samp_fields {
  __typename?: "service_accepted_payment_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface service_accepted_payment_variance_fields {
  __typename?: "service_accepted_payment_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  price?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "service_type"
 */
export interface service_type {
  __typename?: "service_type";
  /**
   * An array relationship
   */
  services: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  /**
   * An aggregate relationship
   */
  services_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_bool_exp>;
  }) => services_aggregate;
  value: ScalarsEnums["String"];
}

/**
 * aggregated selection of "service_type"
 */
export interface service_type_aggregate {
  __typename?: "service_type_aggregate";
  aggregate?: Maybe<service_type_aggregate_fields>;
  nodes: Array<service_type>;
}

/**
 * aggregate fields of "service_type"
 */
export interface service_type_aggregate_fields {
  __typename?: "service_type_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<service_type_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<service_type_max_fields>;
  min?: Maybe<service_type_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface service_type_max_fields {
  __typename?: "service_type_max_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface service_type_min_fields {
  __typename?: "service_type_min_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "service_type"
 */
export interface service_type_mutation_response {
  __typename?: "service_type_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<service_type>;
}

/**
 * columns and relationships of "services"
 */
export interface services {
  __typename?: "services";
  created_at: ScalarsEnums["timestamp"];
  geo?: Maybe<ScalarsEnums["point"]>;
  id: ScalarsEnums["Int"];
  location_name: ScalarsEnums["String"];
  marketplace: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  marketplaceByMarketplace: marketplaces;
  /**
   * An object relationship
   */
  serviceAcceptedPaymentByServiceAcceptedPayment: service_accepted_payment;
  /**
   * An object relationship
   */
  serviceTypeByServiceType: service_type;
  service_accepted_payment: ScalarsEnums["Int"];
  service_available?: Maybe<ScalarsEnums["Boolean"]>;
  service_description: ScalarsEnums["String"];
  service_type: ScalarsEnums["service_type_enum"];
  /**
   * An array relationship
   */
  services_images: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_images_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_images_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_images_bool_exp>;
  }) => Array<services_images>;
  /**
   * An aggregate relationship
   */
  services_images_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_images_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_images_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_images_bool_exp>;
  }) => services_images_aggregate;
  /**
   * An array relationship
   */
  services_ratings: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_ratings_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_ratings_bool_exp>;
  }) => Array<services_ratings>;
  /**
   * An aggregate relationship
   */
  services_ratings_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<services_ratings_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<services_ratings_bool_exp>;
  }) => services_ratings_aggregate;
}

/**
 * aggregated selection of "services"
 */
export interface services_aggregate {
  __typename?: "services_aggregate";
  aggregate?: Maybe<services_aggregate_fields>;
  nodes: Array<services>;
}

/**
 * aggregate fields of "services"
 */
export interface services_aggregate_fields {
  __typename?: "services_aggregate_fields";
  avg?: Maybe<services_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<services_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<services_max_fields>;
  min?: Maybe<services_min_fields>;
  stddev?: Maybe<services_stddev_fields>;
  stddev_pop?: Maybe<services_stddev_pop_fields>;
  stddev_samp?: Maybe<services_stddev_samp_fields>;
  sum?: Maybe<services_sum_fields>;
  var_pop?: Maybe<services_var_pop_fields>;
  var_samp?: Maybe<services_var_samp_fields>;
  variance?: Maybe<services_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface services_avg_fields {
  __typename?: "services_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "services_images"
 */
export interface services_images {
  __typename?: "services_images";
  id: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  service?: Maybe<services>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
  url_pointer: ScalarsEnums["String"];
}

/**
 * aggregated selection of "services_images"
 */
export interface services_images_aggregate {
  __typename?: "services_images_aggregate";
  aggregate?: Maybe<services_images_aggregate_fields>;
  nodes: Array<services_images>;
}

/**
 * aggregate fields of "services_images"
 */
export interface services_images_aggregate_fields {
  __typename?: "services_images_aggregate_fields";
  avg?: Maybe<services_images_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<services_images_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<services_images_max_fields>;
  min?: Maybe<services_images_min_fields>;
  stddev?: Maybe<services_images_stddev_fields>;
  stddev_pop?: Maybe<services_images_stddev_pop_fields>;
  stddev_samp?: Maybe<services_images_stddev_samp_fields>;
  sum?: Maybe<services_images_sum_fields>;
  var_pop?: Maybe<services_images_var_pop_fields>;
  var_samp?: Maybe<services_images_var_samp_fields>;
  variance?: Maybe<services_images_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface services_images_avg_fields {
  __typename?: "services_images_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface services_images_max_fields {
  __typename?: "services_images_max_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
  url_pointer?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface services_images_min_fields {
  __typename?: "services_images_min_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
  url_pointer?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "services_images"
 */
export interface services_images_mutation_response {
  __typename?: "services_images_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<services_images>;
}

/**
 * aggregate stddev on columns
 */
export interface services_images_stddev_fields {
  __typename?: "services_images_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface services_images_stddev_pop_fields {
  __typename?: "services_images_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface services_images_stddev_samp_fields {
  __typename?: "services_images_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface services_images_sum_fields {
  __typename?: "services_images_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface services_images_var_pop_fields {
  __typename?: "services_images_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface services_images_var_samp_fields {
  __typename?: "services_images_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface services_images_variance_fields {
  __typename?: "services_images_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface services_max_fields {
  __typename?: "services_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  marketplace?: Maybe<ScalarsEnums["Int"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Int"]>;
  service_description?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface services_min_fields {
  __typename?: "services_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  marketplace?: Maybe<ScalarsEnums["Int"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Int"]>;
  service_description?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "services"
 */
export interface services_mutation_response {
  __typename?: "services_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<services>;
}

/**
 * columns and relationships of "services_ratings"
 */
export interface services_ratings {
  __typename?: "services_ratings";
  /**
   * An object relationship
   */
  account: accounts;
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  rating_by: ScalarsEnums["Int"];
  score: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  service: services;
  service_id: ScalarsEnums["Int"];
}

/**
 * aggregated selection of "services_ratings"
 */
export interface services_ratings_aggregate {
  __typename?: "services_ratings_aggregate";
  aggregate?: Maybe<services_ratings_aggregate_fields>;
  nodes: Array<services_ratings>;
}

/**
 * aggregate fields of "services_ratings"
 */
export interface services_ratings_aggregate_fields {
  __typename?: "services_ratings_aggregate_fields";
  avg?: Maybe<services_ratings_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<services_ratings_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<services_ratings_max_fields>;
  min?: Maybe<services_ratings_min_fields>;
  stddev?: Maybe<services_ratings_stddev_fields>;
  stddev_pop?: Maybe<services_ratings_stddev_pop_fields>;
  stddev_samp?: Maybe<services_ratings_stddev_samp_fields>;
  sum?: Maybe<services_ratings_sum_fields>;
  var_pop?: Maybe<services_ratings_var_pop_fields>;
  var_samp?: Maybe<services_ratings_var_samp_fields>;
  variance?: Maybe<services_ratings_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface services_ratings_avg_fields {
  __typename?: "services_ratings_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface services_ratings_max_fields {
  __typename?: "services_ratings_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  rating_by?: Maybe<ScalarsEnums["Int"]>;
  score?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface services_ratings_min_fields {
  __typename?: "services_ratings_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  rating_by?: Maybe<ScalarsEnums["Int"]>;
  score?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "services_ratings"
 */
export interface services_ratings_mutation_response {
  __typename?: "services_ratings_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<services_ratings>;
}

/**
 * aggregate stddev on columns
 */
export interface services_ratings_stddev_fields {
  __typename?: "services_ratings_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface services_ratings_stddev_pop_fields {
  __typename?: "services_ratings_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface services_ratings_stddev_samp_fields {
  __typename?: "services_ratings_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface services_ratings_sum_fields {
  __typename?: "services_ratings_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  rating_by?: Maybe<ScalarsEnums["Int"]>;
  score?: Maybe<ScalarsEnums["Int"]>;
  service_id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface services_ratings_var_pop_fields {
  __typename?: "services_ratings_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface services_ratings_var_samp_fields {
  __typename?: "services_ratings_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface services_ratings_variance_fields {
  __typename?: "services_ratings_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  rating_by?: Maybe<ScalarsEnums["Float"]>;
  score?: Maybe<ScalarsEnums["Float"]>;
  service_id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev on columns
 */
export interface services_stddev_fields {
  __typename?: "services_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface services_stddev_pop_fields {
  __typename?: "services_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface services_stddev_samp_fields {
  __typename?: "services_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface services_sum_fields {
  __typename?: "services_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  marketplace?: Maybe<ScalarsEnums["Int"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface services_var_pop_fields {
  __typename?: "services_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface services_var_samp_fields {
  __typename?: "services_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface services_variance_fields {
  __typename?: "services_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  marketplace?: Maybe<ScalarsEnums["Float"]>;
  service_accepted_payment?: Maybe<ScalarsEnums["Float"]>;
}

export interface Subscription {
  __typename?: "Subscription";
  account_type: (args?: {
    distinct_on?: Maybe<Array<account_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<account_type_order_by>>;
    where?: Maybe<account_type_bool_exp>;
  }) => Array<account_type>;
  account_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<account_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<account_type_order_by>>;
    where?: Maybe<account_type_bool_exp>;
  }) => account_type_aggregate;
  account_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<account_type>;
  account_type_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<account_type_stream_cursor_input>>;
    where?: Maybe<account_type_bool_exp>;
  }) => Array<account_type>;
  accounts: (args?: {
    distinct_on?: Maybe<Array<accounts_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<accounts_order_by>>;
    where?: Maybe<accounts_bool_exp>;
  }) => Array<accounts>;
  accounts_aggregate: (args?: {
    distinct_on?: Maybe<Array<accounts_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<accounts_order_by>>;
    where?: Maybe<accounts_bool_exp>;
  }) => accounts_aggregate;
  accounts_by_pk: (args: { id: Scalars["Int"] }) => Maybe<accounts>;
  accounts_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<accounts_stream_cursor_input>>;
    where?: Maybe<accounts_bool_exp>;
  }) => Array<accounts>;
  gender_type: (args?: {
    distinct_on?: Maybe<Array<gender_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<gender_type_order_by>>;
    where?: Maybe<gender_type_bool_exp>;
  }) => Array<gender_type>;
  gender_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<gender_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<gender_type_order_by>>;
    where?: Maybe<gender_type_bool_exp>;
  }) => gender_type_aggregate;
  gender_type_by_pk: (args: { value: Scalars["String"] }) => Maybe<gender_type>;
  gender_type_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<gender_type_stream_cursor_input>>;
    where?: Maybe<gender_type_bool_exp>;
  }) => Array<gender_type>;
  interface_type: (args?: {
    distinct_on?: Maybe<Array<interface_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<interface_type_order_by>>;
    where?: Maybe<interface_type_bool_exp>;
  }) => Array<interface_type>;
  interface_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<interface_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<interface_type_order_by>>;
    where?: Maybe<interface_type_bool_exp>;
  }) => interface_type_aggregate;
  interface_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<interface_type>;
  interface_type_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<interface_type_stream_cursor_input>>;
    where?: Maybe<interface_type_bool_exp>;
  }) => Array<interface_type>;
  marketplaces: (args?: {
    distinct_on?: Maybe<Array<marketplaces_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<marketplaces_order_by>>;
    where?: Maybe<marketplaces_bool_exp>;
  }) => Array<marketplaces>;
  marketplaces_aggregate: (args?: {
    distinct_on?: Maybe<Array<marketplaces_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<marketplaces_order_by>>;
    where?: Maybe<marketplaces_bool_exp>;
  }) => marketplaces_aggregate;
  marketplaces_by_pk: (args: { id: Scalars["Int"] }) => Maybe<marketplaces>;
  marketplaces_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<marketplaces_stream_cursor_input>>;
    where?: Maybe<marketplaces_bool_exp>;
  }) => Array<marketplaces>;
  personal_information: (args?: {
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<personal_information_order_by>>;
    where?: Maybe<personal_information_bool_exp>;
  }) => Array<personal_information>;
  personal_information_aggregate: (args?: {
    distinct_on?: Maybe<Array<personal_information_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<personal_information_order_by>>;
    where?: Maybe<personal_information_bool_exp>;
  }) => personal_information_aggregate;
  personal_information_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<personal_information_stream_cursor_input>>;
    where?: Maybe<personal_information_bool_exp>;
  }) => Array<personal_information>;
  service_accepted_payment: (args?: {
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => Array<service_accepted_payment>;
  service_accepted_payment_aggregate: (args?: {
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => service_accepted_payment_aggregate;
  service_accepted_payment_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<service_accepted_payment>;
  service_accepted_payment_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<service_accepted_payment_stream_cursor_input>>;
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => Array<service_accepted_payment>;
  service_type: (args?: {
    distinct_on?: Maybe<Array<service_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_type_order_by>>;
    where?: Maybe<service_type_bool_exp>;
  }) => Array<service_type>;
  service_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<service_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<service_type_order_by>>;
    where?: Maybe<service_type_bool_exp>;
  }) => service_type_aggregate;
  service_type_by_pk: (args: {
    value: Scalars["String"];
  }) => Maybe<service_type>;
  service_type_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<service_type_stream_cursor_input>>;
    where?: Maybe<service_type_bool_exp>;
  }) => Array<service_type>;
  services: (args?: {
    distinct_on?: Maybe<Array<services_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_order_by>>;
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  services_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_order_by>>;
    where?: Maybe<services_bool_exp>;
  }) => services_aggregate;
  services_by_pk: (args: { id: Scalars["Int"] }) => Maybe<services>;
  services_images: (args?: {
    distinct_on?: Maybe<Array<services_images_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_images_order_by>>;
    where?: Maybe<services_images_bool_exp>;
  }) => Array<services_images>;
  services_images_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_images_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_images_order_by>>;
    where?: Maybe<services_images_bool_exp>;
  }) => services_images_aggregate;
  services_images_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_images>;
  services_images_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<services_images_stream_cursor_input>>;
    where?: Maybe<services_images_bool_exp>;
  }) => Array<services_images>;
  services_ratings: (args?: {
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_ratings_order_by>>;
    where?: Maybe<services_ratings_bool_exp>;
  }) => Array<services_ratings>;
  services_ratings_aggregate: (args?: {
    distinct_on?: Maybe<Array<services_ratings_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<services_ratings_order_by>>;
    where?: Maybe<services_ratings_bool_exp>;
  }) => services_ratings_aggregate;
  services_ratings_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<services_ratings>;
  services_ratings_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<services_ratings_stream_cursor_input>>;
    where?: Maybe<services_ratings_bool_exp>;
  }) => Array<services_ratings>;
  services_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<services_stream_cursor_input>>;
    where?: Maybe<services_bool_exp>;
  }) => Array<services>;
  till: (args?: {
    distinct_on?: Maybe<Array<till_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<till_order_by>>;
    where?: Maybe<till_bool_exp>;
  }) => Array<till>;
  till_aggregate: (args?: {
    distinct_on?: Maybe<Array<till_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<till_order_by>>;
    where?: Maybe<till_bool_exp>;
  }) => till_aggregate;
  till_by_pk: (args: { id: Scalars["Int"] }) => Maybe<till>;
  till_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<till_stream_cursor_input>>;
    where?: Maybe<till_bool_exp>;
  }) => Array<till>;
  transactions: (args?: {
    distinct_on?: Maybe<Array<transactions_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<transactions_order_by>>;
    where?: Maybe<transactions_bool_exp>;
  }) => Array<transactions>;
  transactions_aggregate: (args?: {
    distinct_on?: Maybe<Array<transactions_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<transactions_order_by>>;
    where?: Maybe<transactions_bool_exp>;
  }) => transactions_aggregate;
  transactions_by_pk: (args: { id: Scalars["Int"] }) => Maybe<transactions>;
  transactions_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<transactions_stream_cursor_input>>;
    where?: Maybe<transactions_bool_exp>;
  }) => Array<transactions>;
  tx_type: (args?: {
    distinct_on?: Maybe<Array<tx_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<tx_type_order_by>>;
    where?: Maybe<tx_type_bool_exp>;
  }) => Array<tx_type>;
  tx_type_aggregate: (args?: {
    distinct_on?: Maybe<Array<tx_type_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<tx_type_order_by>>;
    where?: Maybe<tx_type_bool_exp>;
  }) => tx_type_aggregate;
  tx_type_by_pk: (args: { value: Scalars["String"] }) => Maybe<tx_type>;
  tx_type_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<tx_type_stream_cursor_input>>;
    where?: Maybe<tx_type_bool_exp>;
  }) => Array<tx_type>;
  users: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  users_aggregate: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
  users_by_pk: (args: { id: Scalars["Int"] }) => Maybe<users>;
  users_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<users_stream_cursor_input>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  voucher_certifications: (args?: {
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => Array<voucher_certifications>;
  voucher_certifications_aggregate: (args?: {
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => voucher_certifications_aggregate;
  voucher_certifications_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_certifications>;
  voucher_certifications_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<voucher_certifications_stream_cursor_input>>;
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => Array<voucher_certifications>;
  voucher_issuers: (args?: {
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => Array<voucher_issuers>;
  voucher_issuers_aggregate: (args?: {
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => voucher_issuers_aggregate;
  voucher_issuers_by_pk: (args: {
    id: Scalars["Int"];
  }) => Maybe<voucher_issuers>;
  voucher_issuers_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<voucher_issuers_stream_cursor_input>>;
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => Array<voucher_issuers>;
  vouchers: (args?: {
    distinct_on?: Maybe<Array<vouchers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vouchers_order_by>>;
    where?: Maybe<vouchers_bool_exp>;
  }) => Array<vouchers>;
  vouchers_aggregate: (args?: {
    distinct_on?: Maybe<Array<vouchers_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vouchers_order_by>>;
    where?: Maybe<vouchers_bool_exp>;
  }) => vouchers_aggregate;
  vouchers_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vouchers>;
  vouchers_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<vouchers_stream_cursor_input>>;
    where?: Maybe<vouchers_bool_exp>;
  }) => Array<vouchers>;
  vpa: (args?: {
    distinct_on?: Maybe<Array<vpa_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vpa_order_by>>;
    where?: Maybe<vpa_bool_exp>;
  }) => Array<vpa>;
  vpa_aggregate: (args?: {
    distinct_on?: Maybe<Array<vpa_select_column>>;
    limit?: Maybe<Scalars["Int"]>;
    offset?: Maybe<Scalars["Int"]>;
    order_by?: Maybe<Array<vpa_order_by>>;
    where?: Maybe<vpa_bool_exp>;
  }) => vpa_aggregate;
  vpa_by_pk: (args: { id: Scalars["Int"] }) => Maybe<vpa>;
  vpa_stream: (args: {
    batch_size: Scalars["Int"];
    cursor: Array<Maybe<vpa_stream_cursor_input>>;
    where?: Maybe<vpa_bool_exp>;
  }) => Array<vpa>;
}

/**
 * columns and relationships of "till"
 */
export interface till {
  __typename?: "till";
  /**
   * An object relationship
   */
  account: accounts;
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  linked_account: ScalarsEnums["Int"];
  till: ScalarsEnums["String"];
}

/**
 * aggregated selection of "till"
 */
export interface till_aggregate {
  __typename?: "till_aggregate";
  aggregate?: Maybe<till_aggregate_fields>;
  nodes: Array<till>;
}

/**
 * aggregate fields of "till"
 */
export interface till_aggregate_fields {
  __typename?: "till_aggregate_fields";
  avg?: Maybe<till_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<till_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<till_max_fields>;
  min?: Maybe<till_min_fields>;
  stddev?: Maybe<till_stddev_fields>;
  stddev_pop?: Maybe<till_stddev_pop_fields>;
  stddev_samp?: Maybe<till_stddev_samp_fields>;
  sum?: Maybe<till_sum_fields>;
  var_pop?: Maybe<till_var_pop_fields>;
  var_samp?: Maybe<till_var_samp_fields>;
  variance?: Maybe<till_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface till_avg_fields {
  __typename?: "till_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface till_max_fields {
  __typename?: "till_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
  till?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface till_min_fields {
  __typename?: "till_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
  till?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "till"
 */
export interface till_mutation_response {
  __typename?: "till_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<till>;
}

/**
 * aggregate stddev on columns
 */
export interface till_stddev_fields {
  __typename?: "till_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface till_stddev_pop_fields {
  __typename?: "till_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface till_stddev_samp_fields {
  __typename?: "till_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface till_sum_fields {
  __typename?: "till_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface till_var_pop_fields {
  __typename?: "till_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface till_var_samp_fields {
  __typename?: "till_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface till_variance_fields {
  __typename?: "till_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "transactions"
 */
export interface transactions {
  __typename?: "transactions";
  block_number: ScalarsEnums["Int"];
  date_block: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  recipient_address: ScalarsEnums["String"];
  sender_address: ScalarsEnums["String"];
  success: ScalarsEnums["Boolean"];
  /**
   * An object relationship
   */
  txTypeByTxType?: Maybe<tx_type>;
  tx_hash: ScalarsEnums["String"];
  tx_index: ScalarsEnums["Int"];
  tx_type?: Maybe<ScalarsEnums["tx_type_enum"]>;
  tx_value: ScalarsEnums["bigint"];
  /**
   * An object relationship
   */
  voucher: vouchers;
  voucher_address: ScalarsEnums["String"];
}

/**
 * aggregated selection of "transactions"
 */
export interface transactions_aggregate {
  __typename?: "transactions_aggregate";
  aggregate?: Maybe<transactions_aggregate_fields>;
  nodes: Array<transactions>;
}

/**
 * aggregate fields of "transactions"
 */
export interface transactions_aggregate_fields {
  __typename?: "transactions_aggregate_fields";
  avg?: Maybe<transactions_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<transactions_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<transactions_max_fields>;
  min?: Maybe<transactions_min_fields>;
  stddev?: Maybe<transactions_stddev_fields>;
  stddev_pop?: Maybe<transactions_stddev_pop_fields>;
  stddev_samp?: Maybe<transactions_stddev_samp_fields>;
  sum?: Maybe<transactions_sum_fields>;
  var_pop?: Maybe<transactions_var_pop_fields>;
  var_samp?: Maybe<transactions_var_samp_fields>;
  variance?: Maybe<transactions_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface transactions_avg_fields {
  __typename?: "transactions_avg_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface transactions_max_fields {
  __typename?: "transactions_max_fields";
  block_number?: Maybe<ScalarsEnums["Int"]>;
  date_block?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  recipient_address?: Maybe<ScalarsEnums["String"]>;
  sender_address?: Maybe<ScalarsEnums["String"]>;
  tx_hash?: Maybe<ScalarsEnums["String"]>;
  tx_index?: Maybe<ScalarsEnums["Int"]>;
  tx_value?: Maybe<ScalarsEnums["bigint"]>;
  voucher_address?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface transactions_min_fields {
  __typename?: "transactions_min_fields";
  block_number?: Maybe<ScalarsEnums["Int"]>;
  date_block?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  recipient_address?: Maybe<ScalarsEnums["String"]>;
  sender_address?: Maybe<ScalarsEnums["String"]>;
  tx_hash?: Maybe<ScalarsEnums["String"]>;
  tx_index?: Maybe<ScalarsEnums["Int"]>;
  tx_value?: Maybe<ScalarsEnums["bigint"]>;
  voucher_address?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "transactions"
 */
export interface transactions_mutation_response {
  __typename?: "transactions_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<transactions>;
}

/**
 * aggregate stddev on columns
 */
export interface transactions_stddev_fields {
  __typename?: "transactions_stddev_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface transactions_stddev_pop_fields {
  __typename?: "transactions_stddev_pop_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface transactions_stddev_samp_fields {
  __typename?: "transactions_stddev_samp_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface transactions_sum_fields {
  __typename?: "transactions_sum_fields";
  block_number?: Maybe<ScalarsEnums["Int"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  tx_index?: Maybe<ScalarsEnums["Int"]>;
  tx_value?: Maybe<ScalarsEnums["bigint"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface transactions_var_pop_fields {
  __typename?: "transactions_var_pop_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface transactions_var_samp_fields {
  __typename?: "transactions_var_samp_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface transactions_variance_fields {
  __typename?: "transactions_variance_fields";
  block_number?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  tx_index?: Maybe<ScalarsEnums["Float"]>;
  tx_value?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "tx_type"
 */
export interface tx_type {
  __typename?: "tx_type";
  /**
   * An array relationship
   */
  transactions: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<transactions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<transactions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<transactions_bool_exp>;
  }) => Array<transactions>;
  /**
   * An aggregate relationship
   */
  transactions_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<transactions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<transactions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<transactions_bool_exp>;
  }) => transactions_aggregate;
  value: ScalarsEnums["String"];
}

/**
 * aggregated selection of "tx_type"
 */
export interface tx_type_aggregate {
  __typename?: "tx_type_aggregate";
  aggregate?: Maybe<tx_type_aggregate_fields>;
  nodes: Array<tx_type>;
}

/**
 * aggregate fields of "tx_type"
 */
export interface tx_type_aggregate_fields {
  __typename?: "tx_type_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<tx_type_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<tx_type_max_fields>;
  min?: Maybe<tx_type_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface tx_type_max_fields {
  __typename?: "tx_type_max_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface tx_type_min_fields {
  __typename?: "tx_type_min_fields";
  value?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "tx_type"
 */
export interface tx_type_mutation_response {
  __typename?: "tx_type_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<tx_type>;
}

/**
 * columns and relationships of "users"
 */
export interface users {
  __typename?: "users";
  /**
   * An array relationship
   */
  accounts: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<accounts_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<accounts_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<accounts_bool_exp>;
  }) => Array<accounts>;
  /**
   * An aggregate relationship
   */
  accounts_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<accounts_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<accounts_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<accounts_bool_exp>;
  }) => accounts_aggregate;
  activated?: Maybe<ScalarsEnums["Boolean"]>;
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  interfaceTypeByInterfaceType: interface_type;
  interface_identifier: ScalarsEnums["String"];
  interface_type: ScalarsEnums["interface_type_enum"];
  /**
   * An object relationship
   */
  personal_information?: Maybe<personal_information>;
}

/**
 * aggregated selection of "users"
 */
export interface users_aggregate {
  __typename?: "users_aggregate";
  aggregate?: Maybe<users_aggregate_fields>;
  nodes: Array<users>;
}

/**
 * aggregate fields of "users"
 */
export interface users_aggregate_fields {
  __typename?: "users_aggregate_fields";
  avg?: Maybe<users_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<users_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<users_max_fields>;
  min?: Maybe<users_min_fields>;
  stddev?: Maybe<users_stddev_fields>;
  stddev_pop?: Maybe<users_stddev_pop_fields>;
  stddev_samp?: Maybe<users_stddev_samp_fields>;
  sum?: Maybe<users_sum_fields>;
  var_pop?: Maybe<users_var_pop_fields>;
  var_samp?: Maybe<users_var_samp_fields>;
  variance?: Maybe<users_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface users_avg_fields {
  __typename?: "users_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface users_max_fields {
  __typename?: "users_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  interface_identifier?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface users_min_fields {
  __typename?: "users_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  interface_identifier?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "users"
 */
export interface users_mutation_response {
  __typename?: "users_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<users>;
}

/**
 * aggregate stddev on columns
 */
export interface users_stddev_fields {
  __typename?: "users_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface users_stddev_pop_fields {
  __typename?: "users_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface users_stddev_samp_fields {
  __typename?: "users_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface users_sum_fields {
  __typename?: "users_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface users_var_pop_fields {
  __typename?: "users_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface users_var_samp_fields {
  __typename?: "users_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface users_variance_fields {
  __typename?: "users_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "voucher_certifications"
 */
export interface voucher_certifications {
  __typename?: "voucher_certifications";
  /**
   * An object relationship
   */
  account: accounts;
  certificate_url_pointer: ScalarsEnums["String"];
  certifier: ScalarsEnums["Int"];
  certifier_weight: ScalarsEnums["numeric"];
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  voucher: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  voucherByVoucher: vouchers;
}

/**
 * aggregated selection of "voucher_certifications"
 */
export interface voucher_certifications_aggregate {
  __typename?: "voucher_certifications_aggregate";
  aggregate?: Maybe<voucher_certifications_aggregate_fields>;
  nodes: Array<voucher_certifications>;
}

/**
 * aggregate fields of "voucher_certifications"
 */
export interface voucher_certifications_aggregate_fields {
  __typename?: "voucher_certifications_aggregate_fields";
  avg?: Maybe<voucher_certifications_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<voucher_certifications_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<voucher_certifications_max_fields>;
  min?: Maybe<voucher_certifications_min_fields>;
  stddev?: Maybe<voucher_certifications_stddev_fields>;
  stddev_pop?: Maybe<voucher_certifications_stddev_pop_fields>;
  stddev_samp?: Maybe<voucher_certifications_stddev_samp_fields>;
  sum?: Maybe<voucher_certifications_sum_fields>;
  var_pop?: Maybe<voucher_certifications_var_pop_fields>;
  var_samp?: Maybe<voucher_certifications_var_samp_fields>;
  variance?: Maybe<voucher_certifications_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface voucher_certifications_avg_fields {
  __typename?: "voucher_certifications_avg_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface voucher_certifications_max_fields {
  __typename?: "voucher_certifications_max_fields";
  certificate_url_pointer?: Maybe<ScalarsEnums["String"]>;
  certifier?: Maybe<ScalarsEnums["Int"]>;
  certifier_weight?: Maybe<ScalarsEnums["numeric"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface voucher_certifications_min_fields {
  __typename?: "voucher_certifications_min_fields";
  certificate_url_pointer?: Maybe<ScalarsEnums["String"]>;
  certifier?: Maybe<ScalarsEnums["Int"]>;
  certifier_weight?: Maybe<ScalarsEnums["numeric"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "voucher_certifications"
 */
export interface voucher_certifications_mutation_response {
  __typename?: "voucher_certifications_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<voucher_certifications>;
}

/**
 * aggregate stddev on columns
 */
export interface voucher_certifications_stddev_fields {
  __typename?: "voucher_certifications_stddev_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface voucher_certifications_stddev_pop_fields {
  __typename?: "voucher_certifications_stddev_pop_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface voucher_certifications_stddev_samp_fields {
  __typename?: "voucher_certifications_stddev_samp_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface voucher_certifications_sum_fields {
  __typename?: "voucher_certifications_sum_fields";
  certifier?: Maybe<ScalarsEnums["Int"]>;
  certifier_weight?: Maybe<ScalarsEnums["numeric"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface voucher_certifications_var_pop_fields {
  __typename?: "voucher_certifications_var_pop_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface voucher_certifications_var_samp_fields {
  __typename?: "voucher_certifications_var_samp_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface voucher_certifications_variance_fields {
  __typename?: "voucher_certifications_variance_fields";
  certifier?: Maybe<ScalarsEnums["Float"]>;
  certifier_weight?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "voucher_issuers"
 */
export interface voucher_issuers {
  __typename?: "voucher_issuers";
  /**
   * An object relationship
   */
  account: accounts;
  active?: Maybe<ScalarsEnums["Boolean"]>;
  backer: ScalarsEnums["Int"];
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  voucher: ScalarsEnums["Int"];
  /**
   * An object relationship
   */
  voucherByVoucher: vouchers;
}

/**
 * aggregated selection of "voucher_issuers"
 */
export interface voucher_issuers_aggregate {
  __typename?: "voucher_issuers_aggregate";
  aggregate?: Maybe<voucher_issuers_aggregate_fields>;
  nodes: Array<voucher_issuers>;
}

/**
 * aggregate fields of "voucher_issuers"
 */
export interface voucher_issuers_aggregate_fields {
  __typename?: "voucher_issuers_aggregate_fields";
  avg?: Maybe<voucher_issuers_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<voucher_issuers_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<voucher_issuers_max_fields>;
  min?: Maybe<voucher_issuers_min_fields>;
  stddev?: Maybe<voucher_issuers_stddev_fields>;
  stddev_pop?: Maybe<voucher_issuers_stddev_pop_fields>;
  stddev_samp?: Maybe<voucher_issuers_stddev_samp_fields>;
  sum?: Maybe<voucher_issuers_sum_fields>;
  var_pop?: Maybe<voucher_issuers_var_pop_fields>;
  var_samp?: Maybe<voucher_issuers_var_samp_fields>;
  variance?: Maybe<voucher_issuers_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface voucher_issuers_avg_fields {
  __typename?: "voucher_issuers_avg_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface voucher_issuers_max_fields {
  __typename?: "voucher_issuers_max_fields";
  backer?: Maybe<ScalarsEnums["Int"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate min on columns
 */
export interface voucher_issuers_min_fields {
  __typename?: "voucher_issuers_min_fields";
  backer?: Maybe<ScalarsEnums["Int"]>;
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * response of any mutation on the table "voucher_issuers"
 */
export interface voucher_issuers_mutation_response {
  __typename?: "voucher_issuers_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<voucher_issuers>;
}

/**
 * aggregate stddev on columns
 */
export interface voucher_issuers_stddev_fields {
  __typename?: "voucher_issuers_stddev_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface voucher_issuers_stddev_pop_fields {
  __typename?: "voucher_issuers_stddev_pop_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface voucher_issuers_stddev_samp_fields {
  __typename?: "voucher_issuers_stddev_samp_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface voucher_issuers_sum_fields {
  __typename?: "voucher_issuers_sum_fields";
  backer?: Maybe<ScalarsEnums["Int"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  voucher?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface voucher_issuers_var_pop_fields {
  __typename?: "voucher_issuers_var_pop_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface voucher_issuers_var_samp_fields {
  __typename?: "voucher_issuers_var_samp_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface voucher_issuers_variance_fields {
  __typename?: "voucher_issuers_variance_fields";
  backer?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  voucher?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "vouchers"
 */
export interface vouchers {
  __typename?: "vouchers";
  active?: Maybe<ScalarsEnums["Boolean"]>;
  created_at: ScalarsEnums["timestamp"];
  demurrage_rate: ScalarsEnums["numeric"];
  geo?: Maybe<ScalarsEnums["point"]>;
  id: ScalarsEnums["Int"];
  location_name?: Maybe<ScalarsEnums["String"]>;
  radius?: Maybe<ScalarsEnums["Int"]>;
  /**
   * An array relationship
   */
  service_accepted_payments: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => Array<service_accepted_payment>;
  /**
   * An aggregate relationship
   */
  service_accepted_payments_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<service_accepted_payment_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<service_accepted_payment_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<service_accepted_payment_bool_exp>;
  }) => service_accepted_payment_aggregate;
  sink_address: ScalarsEnums["String"];
  supply: ScalarsEnums["Int"];
  symbol: ScalarsEnums["String"];
  /**
   * An array relationship
   */
  transactions: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<transactions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<transactions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<transactions_bool_exp>;
  }) => Array<transactions>;
  /**
   * An aggregate relationship
   */
  transactions_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<transactions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<transactions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<transactions_bool_exp>;
  }) => transactions_aggregate;
  voucher_address: ScalarsEnums["String"];
  /**
   * An array relationship
   */
  voucher_backers: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => Array<voucher_issuers>;
  /**
   * An aggregate relationship
   */
  voucher_backers_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_issuers_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_issuers_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_issuers_bool_exp>;
  }) => voucher_issuers_aggregate;
  /**
   * An array relationship
   */
  voucher_certifications: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => Array<voucher_certifications>;
  /**
   * An aggregate relationship
   */
  voucher_certifications_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<voucher_certifications_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars["Int"]>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars["Int"]>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<voucher_certifications_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<voucher_certifications_bool_exp>;
  }) => voucher_certifications_aggregate;
  voucher_description: ScalarsEnums["String"];
  voucher_name: ScalarsEnums["String"];
}

/**
 * aggregated selection of "vouchers"
 */
export interface vouchers_aggregate {
  __typename?: "vouchers_aggregate";
  aggregate?: Maybe<vouchers_aggregate_fields>;
  nodes: Array<vouchers>;
}

/**
 * aggregate fields of "vouchers"
 */
export interface vouchers_aggregate_fields {
  __typename?: "vouchers_aggregate_fields";
  avg?: Maybe<vouchers_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<vouchers_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<vouchers_max_fields>;
  min?: Maybe<vouchers_min_fields>;
  stddev?: Maybe<vouchers_stddev_fields>;
  stddev_pop?: Maybe<vouchers_stddev_pop_fields>;
  stddev_samp?: Maybe<vouchers_stddev_samp_fields>;
  sum?: Maybe<vouchers_sum_fields>;
  var_pop?: Maybe<vouchers_var_pop_fields>;
  var_samp?: Maybe<vouchers_var_samp_fields>;
  variance?: Maybe<vouchers_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface vouchers_avg_fields {
  __typename?: "vouchers_avg_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface vouchers_max_fields {
  __typename?: "vouchers_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  demurrage_rate?: Maybe<ScalarsEnums["numeric"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  radius?: Maybe<ScalarsEnums["Int"]>;
  sink_address?: Maybe<ScalarsEnums["String"]>;
  supply?: Maybe<ScalarsEnums["Int"]>;
  symbol?: Maybe<ScalarsEnums["String"]>;
  voucher_address?: Maybe<ScalarsEnums["String"]>;
  voucher_description?: Maybe<ScalarsEnums["String"]>;
  voucher_name?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface vouchers_min_fields {
  __typename?: "vouchers_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  demurrage_rate?: Maybe<ScalarsEnums["numeric"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  location_name?: Maybe<ScalarsEnums["String"]>;
  radius?: Maybe<ScalarsEnums["Int"]>;
  sink_address?: Maybe<ScalarsEnums["String"]>;
  supply?: Maybe<ScalarsEnums["Int"]>;
  symbol?: Maybe<ScalarsEnums["String"]>;
  voucher_address?: Maybe<ScalarsEnums["String"]>;
  voucher_description?: Maybe<ScalarsEnums["String"]>;
  voucher_name?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "vouchers"
 */
export interface vouchers_mutation_response {
  __typename?: "vouchers_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<vouchers>;
}

/**
 * aggregate stddev on columns
 */
export interface vouchers_stddev_fields {
  __typename?: "vouchers_stddev_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface vouchers_stddev_pop_fields {
  __typename?: "vouchers_stddev_pop_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface vouchers_stddev_samp_fields {
  __typename?: "vouchers_stddev_samp_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface vouchers_sum_fields {
  __typename?: "vouchers_sum_fields";
  demurrage_rate?: Maybe<ScalarsEnums["numeric"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  radius?: Maybe<ScalarsEnums["Int"]>;
  supply?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface vouchers_var_pop_fields {
  __typename?: "vouchers_var_pop_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface vouchers_var_samp_fields {
  __typename?: "vouchers_var_samp_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface vouchers_variance_fields {
  __typename?: "vouchers_variance_fields";
  demurrage_rate?: Maybe<ScalarsEnums["Float"]>;
  id?: Maybe<ScalarsEnums["Float"]>;
  radius?: Maybe<ScalarsEnums["Float"]>;
  supply?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * columns and relationships of "vpa"
 */
export interface vpa {
  __typename?: "vpa";
  /**
   * An object relationship
   */
  account: accounts;
  created_at: ScalarsEnums["timestamp"];
  id: ScalarsEnums["Int"];
  linked_account: ScalarsEnums["Int"];
  vpa: ScalarsEnums["String"];
}

/**
 * aggregated selection of "vpa"
 */
export interface vpa_aggregate {
  __typename?: "vpa_aggregate";
  aggregate?: Maybe<vpa_aggregate_fields>;
  nodes: Array<vpa>;
}

/**
 * aggregate fields of "vpa"
 */
export interface vpa_aggregate_fields {
  __typename?: "vpa_aggregate_fields";
  avg?: Maybe<vpa_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<vpa_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]>;
  }) => ScalarsEnums["Int"];
  max?: Maybe<vpa_max_fields>;
  min?: Maybe<vpa_min_fields>;
  stddev?: Maybe<vpa_stddev_fields>;
  stddev_pop?: Maybe<vpa_stddev_pop_fields>;
  stddev_samp?: Maybe<vpa_stddev_samp_fields>;
  sum?: Maybe<vpa_sum_fields>;
  var_pop?: Maybe<vpa_var_pop_fields>;
  var_samp?: Maybe<vpa_var_samp_fields>;
  variance?: Maybe<vpa_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface vpa_avg_fields {
  __typename?: "vpa_avg_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate max on columns
 */
export interface vpa_max_fields {
  __typename?: "vpa_max_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
  vpa?: Maybe<ScalarsEnums["String"]>;
}

/**
 * aggregate min on columns
 */
export interface vpa_min_fields {
  __typename?: "vpa_min_fields";
  created_at?: Maybe<ScalarsEnums["timestamp"]>;
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
  vpa?: Maybe<ScalarsEnums["String"]>;
}

/**
 * response of any mutation on the table "vpa"
 */
export interface vpa_mutation_response {
  __typename?: "vpa_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums["Int"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<vpa>;
}

/**
 * aggregate stddev on columns
 */
export interface vpa_stddev_fields {
  __typename?: "vpa_stddev_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface vpa_stddev_pop_fields {
  __typename?: "vpa_stddev_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface vpa_stddev_samp_fields {
  __typename?: "vpa_stddev_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate sum on columns
 */
export interface vpa_sum_fields {
  __typename?: "vpa_sum_fields";
  id?: Maybe<ScalarsEnums["Int"]>;
  linked_account?: Maybe<ScalarsEnums["Int"]>;
}

/**
 * aggregate var_pop on columns
 */
export interface vpa_var_pop_fields {
  __typename?: "vpa_var_pop_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate var_samp on columns
 */
export interface vpa_var_samp_fields {
  __typename?: "vpa_var_samp_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

/**
 * aggregate variance on columns
 */
export interface vpa_variance_fields {
  __typename?: "vpa_variance_fields";
  id?: Maybe<ScalarsEnums["Float"]>;
  linked_account?: Maybe<ScalarsEnums["Float"]>;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {
  account_type_constraint: account_type_constraint | undefined;
  account_type_enum: account_type_enum | undefined;
  account_type_select_column: account_type_select_column | undefined;
  account_type_update_column: account_type_update_column | undefined;
  accounts_constraint: accounts_constraint | undefined;
  accounts_select_column: accounts_select_column | undefined;
  accounts_update_column: accounts_update_column | undefined;
  cursor_ordering: cursor_ordering | undefined;
  gender_type_constraint: gender_type_constraint | undefined;
  gender_type_enum: gender_type_enum | undefined;
  gender_type_select_column: gender_type_select_column | undefined;
  gender_type_update_column: gender_type_update_column | undefined;
  interface_type_constraint: interface_type_constraint | undefined;
  interface_type_enum: interface_type_enum | undefined;
  interface_type_select_column: interface_type_select_column | undefined;
  interface_type_update_column: interface_type_update_column | undefined;
  marketplaces_constraint: marketplaces_constraint | undefined;
  marketplaces_select_column: marketplaces_select_column | undefined;
  marketplaces_update_column: marketplaces_update_column | undefined;
  order_by: order_by | undefined;
  personal_information_constraint: personal_information_constraint | undefined;
  personal_information_select_column:
    | personal_information_select_column
    | undefined;
  personal_information_update_column:
    | personal_information_update_column
    | undefined;
  service_accepted_payment_constraint:
    | service_accepted_payment_constraint
    | undefined;
  service_accepted_payment_select_column:
    | service_accepted_payment_select_column
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_avg_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_corr_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_covar_samp_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_max_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_min_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_stddev_samp_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_sum_arguments_columns
    | undefined;
  service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns:
    | service_accepted_payment_select_column_service_accepted_payment_aggregate_bool_exp_var_samp_arguments_columns
    | undefined;
  service_accepted_payment_update_column:
    | service_accepted_payment_update_column
    | undefined;
  service_type_constraint: service_type_constraint | undefined;
  service_type_enum: service_type_enum | undefined;
  service_type_select_column: service_type_select_column | undefined;
  service_type_update_column: service_type_update_column | undefined;
  services_constraint: services_constraint | undefined;
  services_images_constraint: services_images_constraint | undefined;
  services_images_select_column: services_images_select_column | undefined;
  services_images_update_column: services_images_update_column | undefined;
  services_ratings_constraint: services_ratings_constraint | undefined;
  services_ratings_select_column: services_ratings_select_column | undefined;
  services_ratings_update_column: services_ratings_update_column | undefined;
  services_select_column: services_select_column | undefined;
  services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns:
    | services_select_column_services_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns:
    | services_select_column_services_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  services_update_column: services_update_column | undefined;
  till_constraint: till_constraint | undefined;
  till_select_column: till_select_column | undefined;
  till_update_column: till_update_column | undefined;
  transactions_constraint: transactions_constraint | undefined;
  transactions_select_column: transactions_select_column | undefined;
  transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns:
    | transactions_select_column_transactions_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns:
    | transactions_select_column_transactions_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  transactions_update_column: transactions_update_column | undefined;
  tx_type_constraint: tx_type_constraint | undefined;
  tx_type_enum: tx_type_enum | undefined;
  tx_type_select_column: tx_type_select_column | undefined;
  tx_type_update_column: tx_type_update_column | undefined;
  users_constraint: users_constraint | undefined;
  users_select_column: users_select_column | undefined;
  users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns:
    | users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns:
    | users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  users_update_column: users_update_column | undefined;
  voucher_certifications_constraint:
    | voucher_certifications_constraint
    | undefined;
  voucher_certifications_select_column:
    | voucher_certifications_select_column
    | undefined;
  voucher_certifications_update_column:
    | voucher_certifications_update_column
    | undefined;
  voucher_issuers_constraint: voucher_issuers_constraint | undefined;
  voucher_issuers_select_column: voucher_issuers_select_column | undefined;
  voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns:
    | voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns:
    | voucher_issuers_select_column_voucher_issuers_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  voucher_issuers_update_column: voucher_issuers_update_column | undefined;
  vouchers_constraint: vouchers_constraint | undefined;
  vouchers_select_column: vouchers_select_column | undefined;
  vouchers_update_column: vouchers_update_column | undefined;
  vpa_constraint: vpa_constraint | undefined;
  vpa_select_column: vpa_select_column | undefined;
  vpa_update_column: vpa_update_column | undefined;
}
