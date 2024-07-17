import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { RawJson } from '../../../../../type';
import {
  SchemaFieldObject,
  SchemaFieldArray,
  validateValue,
} from '../../../../models/schema';
import Field from './field';
import { Translation } from '../../../../store/common/translation';

export default function SchemaForm({
  formData,
  schema,
  onValueChange,
  onTranslationsChange,
  translations,
  currentLang,
}: {
  formData: any;
  schema: SchemaFieldObject | SchemaFieldArray;
  onValueChange: (val: any) => void;
  translations?: Translation;
  onTranslationsChange?: (termKey: string, val: any) => void;
  currentLang?: string;
}) {
  const onChange = useCallback(
    (val) => {
      /* const finalVal = validateValue(val, val, schema); */
      onValueChange(val);
    },
    [onValueChange]
  );

  const [forceRender, setForceRender] = useState(true);

  useEffect(() => {
    setForceRender(false);
    setTimeout(() => {
      setForceRender(true);
    }, 200);
  }, [schema]);

  if (!forceRender) {
    return null;
  }
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
        onTranslationsChange={onTranslationsChange}
      />
    </Box>
  );
}
