"use client";

import React from "react";

import { keepPreviousData } from "@tanstack/react-query";
import { isAddress } from "viem";
import Address from "~/components/address";
import { InfiniteTable } from "~/components/tables/infinite-table";
import { Badge } from "~/components/ui/badge";
import { trpc } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { type GasGiftStatus } from "~/server/enums";
import { StaffProfileDialog } from "../dialogs/staff-profile-dialog";
import {
  UserFilterForm,
  type UsersFilterFormData,
} from "../forms/users-filter-form";
import { gasBadgeVariant } from "../staff-gas-status";

export function StaffUsersTable() {
  const [selectedAccount, setSelectedAccount] =
    React.useState<RouterOutput["user"]["list"]["users"][0]>();

  const [filters, setFilters] = React.useState<UsersFilterFormData>();

  //react-query has an useInfiniteQuery hook just for this situation!
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    trpc.user.list.useInfiniteQuery(filters ?? {}, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    });
  //we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.users) ?? [],
    [data]
  );
  return (
    <>
      <StaffProfileDialog
        isOpen={!!selectedAccount}
        address={selectedAccount?.blockchain_address as `0x${string}`}
        setIsOpen={() => {
          setSelectedAccount(undefined);
        }}
      />
      <div className="p-2">
        <UserFilterForm onFilter={setFilters} isLoading={isFetching} />
      </div>
      <InfiniteTable
        onRowClick={(row: (typeof flatData)[0]) => setSelectedAccount(row)}
        data={flatData}
        columns={[
          {
            accessorKey: "gas_gift_status",
            header: "Gas Status",
            size: 60,
            cell: (info) => (
              <Badge
                variant={
                  gasBadgeVariant[info.getValue() as keyof typeof GasGiftStatus]
                }
              >
                {info.getValue() as keyof typeof GasGiftStatus}
              </Badge>
            ),
          },
          {
            header: "Interface",
            accessorKey: "interface_type",
            cell: (info) => info.getValue(),
          },
          {
            header: "Identifier",
            accessorKey: "interface_identifier",
            cell: (info) =>
              isAddress(info.getValue<string>()) ? (
                <Address address={info.getValue<string>()} truncate />
              ) : (
                info.getValue<string>()
              ),
          },
          {
            header: "Role",
            accessorKey: "role",
          },
          {
            header: "Given Names",
            accessorKey: "given_names",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Family Name",
            accessorKey: "family_name",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Location Name",
            accessorKey: "location_name",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Account Role",
            accessorKey: "role",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Account Type",
            accessorKey: "account_type",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Language Code",
            accessorKey: "language_code",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Year of Birth",
            accessorKey: "year_of_birth",
            cell: (info) => info.getValue() as string,
          },
          {
            header: "Gender",
            accessorKey: "gender",
            cell: (info) => info.getValue() as string,
          },

          {
            header: "Address",
            accessorKey: "blockchain_address",
            cell: (info) =>
              isAddress(info.getValue<string>()) ? (
                <Address address={info.getValue<string>()} truncate />
              ) : (
                info.getValue<string>()
              ),
          },
        ]}
        hasNextPage={hasNextPage}
        isLoading={isFetching || isFetchingNextPage}
        fetchNextPage={() => {
          void fetchNextPage();
        }}
      />
    </>
  );
}
