import React from 'react';
import {
  Stack,
  Select,
  MenuItem,
  FormLabel,
  Box,
  InputLabel,
  FormControl,
} from '@mui/material';
import { SchemaFieldSelect } from '../../../../../models/schema';

function FieldSelect({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldSelect;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth>
        <InputLabel id={schema.config.fieldId}>Age</InputLabel>
        <Select
          labelId={schema.config.fieldId}
          size='small'
          value={schema.config.options.find((d) => d.value === value)?.value}
          onChange={onChange}
          label={label}
          sx={{
            width: '100%',
          }}
        >
          {schema.config.options.map((item: any) => {
            return (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}

export default FieldSelect;
