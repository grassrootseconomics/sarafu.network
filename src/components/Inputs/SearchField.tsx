import SearchIcon from "@mui/icons-material/Search";
import { Container, InputAdornment, TextField } from "@mui/material";
import { useState, type SyntheticEvent } from "react";

export function SearchField() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setSearchTerm(target.value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 20 }}>
      <TextField
        id="search"
        type="search"
        label="Search"
        value={searchTerm}
        onChange={handleChange}
        sx={{ width: 600 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Container>
  );
}
