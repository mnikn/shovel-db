import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { RawJson } from '../../../../../type';
import {
  SchemaFieldObject,
  SchemaFieldArray,
  validateValue,
} from '../../../../models/schema';
import Field from './field';
import { LANG } from '../../../../../constants/i18n';
import { Translation } from '../../../../store/common/translation';

export default function SchemaForm({
  formData,
  schema,
  onValueChange,
  translations,
  currentLang,
}: {
  formData: any;
  schema: SchemaFieldObject | SchemaFieldArray;
  onValueChange: (val: any) => void;
  translations?: Translation;
  currentLang?: LANG;
}) {
  const onChange = useCallback(
    (val) => {
      const finalVal = validateValue(val, val, schema, {});
      onValueChange(finalVal);
    },
    [onValueChange]
  );

  return (
    <Box
      sx={{
        pt: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Field
        schema={schema}
        rootValue={formData}
        value={formData}
        translations={translations}
        currentLang={currentLang}
        onValueChange={onChange}
      />
    </Box>
  );
}
