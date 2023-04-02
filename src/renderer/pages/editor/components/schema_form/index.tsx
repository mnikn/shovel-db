import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { RawJson } from '../../../../../type';
import { SchemaFieldObject, validateValue } from '../../../../models/schema';
import { FieldContainer } from './field';
import { Translation } from '../../../../store/story/translation';
import { LANG } from '../../../../../constants/i18n';

export default function SchemaForm({
  formData,
  schema,
  onValueChange,
  translations,
  currentLang,
}: {
  formData: RawJson;
  schema: SchemaFieldObject;
  onValueChange: (val: RawJson) => void;
  translations: Translation;
  currentLang: LANG;
}) {
  const [form, setForm] = useState<any>(formData);

  useEffect(() => {
    onValueChange(form);
  }, [form]);

  return (
    <Box
      sx={{
        pt: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <FieldContainer
        schema={schema}
        value={form}
        translations={translations}
        currentLang={currentLang}
        onValueChange={(val) => {
          setForm(validateValue(val, val, schema, {}));
        }}
        isRoot
      />
    </Box>
  );
}
