import SearchIcon from "@mui/icons-material/Search";
import {
  InputAdornment,
  TextField,
  type SxProps,
  type Theme,
} from "@mui/material";
import { type SyntheticEvent } from "react";

export function SearchField({
  sx,
  value,
  onChange,
}: {
  sx: SxProps<Theme>;
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    if (onChange) {
      onChange(target.value);
    }
  };

  return (
    <TextField
      id="search"
      type="search"
      label="Search"
      value={value}
      onChange={handleChange}
      sx={sx}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}
