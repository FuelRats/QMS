import React, { useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client/core";
import * as _ from "lodash";

const SEARCH_SYSTEMS = gql`
  query SearchSystems($search: String!) {
    systems(filter: { search: $search }) {
      name
    }
  }
`;

export default function SystemsSearch({ onChange }) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchSystems, { loading: queryLoading, data, error }] =
    useLazyQuery<{ systems: { name: string }[] }>(SEARCH_SYSTEMS);
  const loadDataDebounced = _.debounce(async () => {
    if (searchValue.length < 3) {
      return;
    }
    searchSystems({ variables: { search: searchValue } });
  }, 500);

  const loading = queryLoading;

  useEffect(() => {
    loadDataDebounced();
  }, [searchValue]);

  if (error) {
    return <>Error</>;
  }

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
      getOptionSelected={(option, newValue) => option.name === newValue.name}
      getOptionLabel={(option) => option.name ?? searchValue}
      options={data?.systems ?? []}
      loading={loading}
      onInputChange={(ev, newValue) => {
        setSearchValue(newValue);
        onChange(newValue);
      }}
      value={searchValue}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search for a system"
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
