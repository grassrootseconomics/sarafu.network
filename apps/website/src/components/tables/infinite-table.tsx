import React from "react";

//3 TanStack Libraries!!!
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import { DataTableColumnHeader } from "./table-column-header";
import { DataTableViewOptions } from "./table-view-options";
interface TableProps<T> {
  data: T[];
  onRowClick?: (row: T) => void;

  isLoading?: boolean;
  hasNextPage?: boolean;
  containerClassName?: string;
  stickyHeader?: boolean;
  fetchNextPage?: () => void;
  columns: ColumnDef<T>[];
}
export function InfiniteTable<T>(props: TableProps<T>) {
  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastRowRef = React.useRef<HTMLTableRowElement>(null);

  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = React.useRef<HTMLTableElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<T>[]>(() => props.columns, []);

  React.useEffect(() => {
    if (lastRowRef.current && observer.current) {
      observer.current.disconnect();
    }
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target?.isIntersecting && props.hasNextPage) {
        props.fetchNextPage?.();
      }
    };

    observer.current = new IntersectionObserver(handleObserver, options);

    if (lastRowRef.current) {
      observer.current.observe(lastRowRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [props.hasNextPage, props.fetchNextPage, lastRowRef.current]);
  const table = useReactTable({
    data: props.data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  //Virtualizing is optional, but might be necessary if we are going to potentially have hundreds or thousands of rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35, // Estimate the size of each row (adjust as needed)
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <>
      <DataTableViewOptions table={table} />
      <Table
        ref={tableContainerRef}
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
                      <DataTableColumnHeader
                        key={header.id}
                        title={
                          (header.column.columnDef.header as string) ??
                          header.id
                        }
                        column={header.column}
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <TableRow>
              <TableCell style={{ height: `${paddingTop}px` }} />
            </TableRow>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<T>;
            return (
              <TableRow
                about={`${virtualRow.index} ${virtualRows.length}`}
                key={row.id}
                ref={
                  virtualRow.index === virtualRows.length - 5
                    ? lastRowRef
                    : null
                }
                className={`${props?.onRowClick ? "cursor-pointer" : ""}`}
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
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
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
          {!props.isLoading && props.data.length === 0 && (
            <div className="w-full p-4">No Results</div>
          )}
        </TableBody>
      </Table>
    </>
  );
}
