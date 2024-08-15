import React from "react";

//3 TanStack Libraries!!!
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTableViewOptions } from "./table-view-options";

interface TableProps<T> {
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  columns: ColumnDef<T>[];
  className?: string;
  containerClassName?: string;
  downloadFileName?: string;
  stickyHeader?: boolean;
  actions?: React.ReactNode;
}
export function BasicTable<T>(props: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <>
      <div className="flex w-full justify-end">
        {props?.actions}
        <DataTableViewOptions
          table={table}
          downloadFileName={props.downloadFileName}
        />
      </div>
      <Table
        className={props.className}
        containerClassName={props.containerClassName}
      >
        <TableHeader
          className={
            props.stickyHeader
              ? "sticky top-0 backdrop-blur-sm bg-white bg-opacity-90"
              : ""
          }
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow
                className={`${props?.onRowClick ? "cursor-pointer" : ""}`}
                key={row.id}
                onClick={() =>
                  props?.onRowClick && props.onRowClick(row.original)
                }
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
          {props.isLoading &&
            table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
