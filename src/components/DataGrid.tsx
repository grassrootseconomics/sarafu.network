import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useRef } from "react";

interface DataTableColumn<Data> {
  name: keyof Data | string;
  label: string;
  renderCell?: (data: Data) => string | number | JSX.Element;
}

interface DataTableProps<
  T extends Record<string, string | number | undefined>
> {
  data: T[];
  columns: DataTableColumn<T>[];
  loadMore?: () => void; // Function to load more data
  hasMore?: boolean; // Indicates if there is more data to load
}

const DataTable = <
  T extends Record<string, string | number | undefined | any>
>({
  data,
  columns,
  loadMore,
  hasMore,
}: DataTableProps<T>) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
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
      if (target?.isIntersecting && hasMore) {
        loadMore && loadMore();
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
  }, [hasMore, loadMore]);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="customizable table">
        <TableHead>
          <TableRow>
            {columns.map(({ name, label }) => (
              <TableCell key={name as string}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={`row-${idx}`}
              ref={idx === data.length - 5 ? lastRowRef : null}
            >
              {columns.map(({ name, renderCell }) => (
                <TableCell key={name as string}>
                  {/*  eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
                  {renderCell ? renderCell(row) : row[name]?.toString()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
