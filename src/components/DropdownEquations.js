import React from 'react';
import { makeStyles} from '@material-ui/core/styles';
import {
  Box,
  FormControl,
  Typography,
  NativeSelect,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
  dropdownHeader: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export default function Data({value, onChange}) {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <FormControl className={classes.formControl}>
        <Typography variant="h6" className={classes.dropdownHeader}>Choose Type:</Typography>
        <NativeSelect
          labelId="dropdownEquationsLabel"
          id="dropdownEquations"
          value={value}
          onChange={onChange}
        >
          <option value={"linearEquations"}>Linear</option>
          <option value={"trigEquations"}>Trigonometric</option>
          <option value={"polyEquations"}>Polynomial</option>
          <option value={"equations"}>Mixed</option>
        </NativeSelect>
      </FormControl>
    </Box>
  );
}