import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface DataTableColumn<Data> {
  name: keyof Data;
  label: string;
  renderCell?: (data: Data) => string | number | JSX.Element;
}

interface DataTableProps<
  T extends Record<string, string | number | undefined>
> {
  data: T[];
  columns: DataTableColumn<T>[];
}

const DataTable = <
  T extends Record<string, string | number | undefined | any>
>({
  data,
  columns,
}: DataTableProps<T>) => (
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
          <TableRow key={`row-${idx}`}>
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

export default DataTable;
