import { Box, Stack } from '@mui/material';
import { debounce } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_CONFIG_JSON,
  SchemaFieldArray,
  SchemaFieldObject,
  SchemaFieldSelect,
} from '../../../../models/schema';
import { buildSchema } from '../../../../models/schema/factory';
import { useExplorerStore, useStaticDataStore } from '../../../../store';
import {
  useFileStore,
  useStaticDataStore as useStaticDataStoreV2,
} from '../../../../stores';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';

const i18nSchema = new SchemaFieldSelect({
  options: [
    {
      label: 'zh-cn',
      value: 'zh-cn',
    },
    {
      label: 'en',
      value: 'en',
    },
  ],
});

export default function StaticData() {
  const {
    fileData,
    /* updateData, */
    currentLang,
    switchLang,
    translations,
    updateTranslations,
  } = useStaticDataStore();
  const [formTranslations, setFormTranslations] = useState(translations);
  const { currentSchema, currentData, updateFileData } = useStaticDataStoreV2();
  const { currentOpenFile } = useFileStore();
  /* const schemaConfig = fileData?.[currentOpenFile?.id || '']?.schema; */
  const fileDataRef = useRef(fileData);
  fileDataRef.current = fileData;
  /* const currentFileSchema = useMemo(() => {
   *   if (!fileDataRef.current) {
   *     return new SchemaFieldArray(new SchemaFieldObject());
   *   }
   *   const config = schemaConfig;
   *   if (!config) {
   *     return buildSchema(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON) as SchemaFieldArray;
   *   }
   *   return buildSchema(JSON.parse(config)) as SchemaFieldArray;
   * }, [schemaConfig]); */

  useEffect(() => {
    setFormTranslations(translations);
  }, [translations]);

  const formData = currentData;

  const onValueChange = useCallback(
    (val: any) => {
      if (!fileDataRef.current || !currentOpenFile) {
        return;
      }
      /* updateData(currentOpenFile.id, val); */
      updateFileData(currentOpenFile, val);
      updateTranslations(formTranslations);
    },
    [updateTranslations, formTranslations, currentOpenFile, updateFileData]
  );

  if (!currentSchema) {
    return null;
  }

  return (
    <Stack sx={{ p: 6, height: '100%' }}>
      <SchemaForm
        formData={formData}
        schema={currentSchema}
        currentLang={currentLang}
        translations={translations}
        onValueChange={onValueChange}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '24px',
          top: '24px',
          width: '120px',
        }}
      >
        <FieldSelect
          schema={i18nSchema}
          value={currentLang}
          onValueChange={switchLang}
        />
      </Box>
    </Stack>
  );
}
