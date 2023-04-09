import React from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { SchemaFieldBoolean } from '../../../../../models/schema';

export default function FieldBoolean({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldBoolean;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  return (
    <FormGroup
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            onChange={(e) => {
              if (onValueChange) {
                onValueChange(e.target.checked);
              }
            }}
          />
        }
        label={label}
      />
    </FormGroup>
  );
}
