import { Box, Stack } from '@mui/material';
import {
  pluckFirst,
  useObservable,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useStaticData from '../../../../data/static_data';
import { SchemaFieldSelect } from '../../../../models/schema';
import { useExplorerStore, useStaticDataStore } from '../../../../store';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';
import { from, tap } from 'rxjs';

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
    updateData,
    currentLang,
    switchLang,
    translations,
    updateTranslations,
  } = useStaticDataStore();

  const { files, currentOpenFile } = useExplorerStore();
  const { $currentData, currentSchema } = useStaticData({
    files,
    currentFile: currentOpenFile,
  });

  const [formData] = useObservableState(() => {
    return from($currentData);
  }, null);
  const $formData = useObservable(pluckFirst, [formData]);
  useSubscription($formData, (val) => {
    console.log('ewwe: ', val);
  });

  const [formTranslations, setFormTranslations] = useState(translations);
  const fileDataRef = useRef(fileData);
  fileDataRef.current = fileData;
  /* const schemaConfig = fileData?.[currentOpenFile?.id || '']?.schema; */
  /* const currentFileSchema = useMemo(() => {
   *   if (!fileDataRef.current) {
   *     return new SchemaFieldArray(new SchemaFieldObject());
   *   }
   *   const config = schemaConfig;
   *   if (!config) {
   *     return buildSchema(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON) as SchemaFieldArray;
   *   }
   *   return buildSchema(JSON.parse(config)) as SchemaFieldArray;
   * }, [schemaConfig]);
   */
  useEffect(() => {
    setFormTranslations(translations);
  }, [translations]);

  /* const formData = fileData?.[currentOpenFile?.id || '']?.data || []; */

  const onValueChange = useCallback(
    (val) => {
      if (!fileDataRef.current || !currentOpenFile) {
        return;
      }
      console.log('yt: ', val);
      /* setFormData(val); */
      /* updateData(currentOpenFile.id, val); */
      updateTranslations(formTranslations);
    },
    [updateData, updateTranslations, formTranslations, currentOpenFile]
  );

  if (!currentSchema || !formData) {
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
