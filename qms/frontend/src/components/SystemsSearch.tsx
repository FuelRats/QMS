import React, { useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client/core";
import * as _ from "lodash";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";

const SEARCH_SYSTEMS = gql`
  query SearchSystems($search: String!) {
    systems(filter: { search: $search }) {
      name
    }
  }
`;

export default function SystemsSearch({ onChange, label }) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchSystems, { loading, data, error }] =
    useLazyQuery<{ systems: { name: string }[] }>(SEARCH_SYSTEMS);
  const debounceSearchSystems = useMemo(
    () =>
      _.debounce((value: string) => {
        if (value.length < 3) {
          return;
        }
        searchSystems({ variables: { search: value } });
      }, 500),
    [searchSystems] // make sure to include dependencies if needed
  );

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, newValue) => option.name === newValue.name}
      getOptionLabel={(option) => option.name ?? searchValue}
      options={data?.systems ?? []}
      loading={loading}
      onInputChange={(ev, newValue) => {
        debounceSearchSystems(newValue);
        setSearchValue(newValue);
        onChange(newValue);
      }}
      value={searchValue}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={label ?? "Search for a system"}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
