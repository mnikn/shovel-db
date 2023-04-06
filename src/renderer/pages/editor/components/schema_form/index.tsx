import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { RawJson } from '../../../../../type';
import {
  SchemaFieldObject,
  SchemaFieldArray,
  validateValue,
} from '../../../../models/schema';
import Field from './field';
import { Translation } from '../../../../store/story/translation';
import { LANG } from '../../../../../constants/i18n';

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
  const [form, setForm] = useState<any>(formData);

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
        value={form}
        translations={translations}
        currentLang={currentLang}
        onValueChange={(val) => {
          const finalVal = validateValue(val, val, schema, {});
          setForm(finalVal);
          onValueChange(finalVal);
        }}
      />
    </Box>
  );
}
