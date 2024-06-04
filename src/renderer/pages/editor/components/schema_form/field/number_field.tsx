import { TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SchemaFieldNumber } from '../../../../../models/schema';

export default function FieldNumber({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldNumber;
  value: number;
  onValueChange?: (value: any) => void;
}) {
  const [valueText, setValueText] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    setValueText(
      (schema.config.prefix || '') +
        (typeof value !== 'undefined' ? String(value) : '') +
        (schema.config.suffix || '')
    );
  }, [value, schema]);

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value
      .replace(schema.config.suffix || '', '')
      .replace(schema.config.prefix || '', '');

    if (textValue === '') {
      setValueText(
        (schema.config.prefix || '') +
          schema.config.defaultValue +
          (schema.config.suffix || '')
      );
    }

    if (!/^[+-]?\d*(\.\d*)?$/.test(textValue)) {
      return;
    }

    const realValue = Number(textValue);
    setValueText(
      (schema.config.prefix || '') + textValue + (schema.config.suffix || '')
    );

    if (schema.config.required && !realValue) {
      setErrorText('Number cannot be empty');
      return;
    }
    if (realValue < schema.config.min) {
      setErrorText(`Number must more than ${schema.config.min}`);
      return;
    }
    if (realValue > schema.config.max) {
      setErrorText(`Number must less than ${schema.config.max}`);
      return;
    }
    if (schema.config.type === 'int' && !Number.isInteger(realValue)) {
      setErrorText(`Number must be integer`);
      return;
    }
    if (schema.config.customValidate) {
      /* no-warn=eval */
      const fn = eval(schema.config.customValidate || '');
      if (fn) {
        const success = fn(realValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange && !Number.isNaN(realValue)) {
      onValueChange(Number(realValue));
    }
  };
  return (
    <TextField
      size='small'
      sx={{
        width: '100%',
      }}
      label={label}
      value={valueText}
      onChange={onTextChange}
    />
  );
}
