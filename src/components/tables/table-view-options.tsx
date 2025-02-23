"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { type Table } from "@tanstack/react-table";
import { DownloadIcon, SlidersHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// Utility function to convert JSON to CSV
const convertToCSV = (data: Record<string, unknown>[]) => {
  const headers = Object.keys(data[0] || {});
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) =>
          JSON.stringify(row[header] || "", (key: string, v: unknown) => {
            if (v === null) return "";
            if (typeof v === "object" && "formattedNumber" in v)
              return v.formattedNumber as number;
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            if (typeof v === "object" && "toString" in v) return v.toString();
            return v;
          })
        )
        .join(",")
    ),
  ];
  return csvRows.join("\n");
};

const downloadCSV = (
  data: Record<string, unknown>[],
  filename = "data.csv"
) => {
  const csvData = convertToCSV(data);
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  downloadFileName?: string;
}

export function DataTableViewOptions<TData>({
  table,
  downloadFileName,
}: DataTableViewOptionsProps<TData>) {
  const getData = () => {
    return table.getRowModel().rows.map((row) => row.original);
  };

  return (
    <div className="flex items-center gap-2 mr-2">
      {downloadFileName && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() =>
                  downloadCSV(
                    getData() as Record<string, unknown>[],
                    downloadFileName
                  )
                }
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download data as CSV</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.header?.toString() ?? column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
