import { Stack } from '@mui/material';
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { LANG } from '../../../../../constants/i18n';
import {
  DEFAULT_CONFIG_JSON,
  SchemaFieldArray,
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../models/schema';
import { buildSchema } from '../../../../models/schema/factory';
import { useExplorerStore, useStaticDataStore } from '../../../../store';
import SchemaForm from '../../components/schema_form';

export default function StaticData() {
  const {
    fileData,
    updateData,
    currentLang,
    translations,
    updateTranslations,
  } = useStaticDataStore();
  const [formTranslations, setFormTranslations] = useState(translations);
  const { currentOpenFile } = useExplorerStore();
  const schemaConfig = fileData?.[currentOpenFile?.id || '']?.schema;
  const currentFileSchema = useMemo(() => {
    if (!fileData) {
      return new SchemaFieldArray(new SchemaFieldObject());
    }
    const config = schemaConfig;
    if (!config) {
      return buildSchema(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON) as SchemaFieldArray;
    }
    return buildSchema(JSON.parse(config)) as SchemaFieldArray;
  }, [schemaConfig]);

  useEffect(() => {
    setFormTranslations(translations);
  }, [translations]);

  const formData = fileData?.[currentOpenFile?.id || '']?.data || [];

  const onValueChange = useCallback(
    debounce((val: any) => {
      if (!fileData || !currentOpenFile) {
        return;
      }
      updateData(currentOpenFile.id, val);
      updateTranslations(formTranslations);
    }, 50),
    [
      updateData,
      updateTranslations,
      fileData,
      formTranslations,
      currentOpenFile,
    ]
  );
  return (
    <Stack sx={{ p: 6, height: '100%' }}>
      <SchemaForm
        formData={formData}
        schema={currentFileSchema}
        currentLang={currentLang}
        translations={translations}
        onValueChange={onValueChange}
      />
    </Stack>
  );
}
