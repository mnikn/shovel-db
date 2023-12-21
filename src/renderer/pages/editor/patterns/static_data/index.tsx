import { Box, CircularProgress, Stack } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SchemaFieldSelect } from '../../../../models/schema';
import { useFileStore, useStaticDataStore } from '../../../../stores';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';

const i18nSchema = new SchemaFieldSelect({
  options: [
    {
      label: 'zh-cn',
      value: 'zh-cn',
    },
    {
      label: 'en-us',
      value: 'en-us',
    },
  ],
});

export default function StaticData() {
  const {
    currentSchema,
    currentData,
    updateFileData,
    currentLang,
    switchLang,
    translations,
    updateTranslations,
    updateTranslateKey,
    loading,
  } = useStaticDataStore();
  const { currentOpenFile } = useFileStore();
  /* const schemaConfig = fileData?.[currentOpenFile?.id || '']?.schema; */
  /* const fileDataRef = useRef(fileData);
   * fileDataRef.current = fileData; */
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

  const formData = currentData;
  const onValueChange = useCallback(
    (val: any) => {
      if (!currentOpenFile) {
        return;
      }
      /* updateData(currentOpenFile.id, val); */
      updateFileData(currentOpenFile, val);
    },
    [updateTranslations, currentOpenFile, updateFileData]
  );

  if (loading) {
    return (
      <CircularProgress
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transofrm: 'translateX(-50%) translateY(-50%)',
          color: '#ffffff',
        }}
      />
    );
  }

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
        onTranslationsChange={(termKey, val) => {
          updateTranslateKey(termKey, val);
        }}
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
