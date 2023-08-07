import { Box, Stack } from '@mui/material';
import {
  pluckFirst,
  useObservable,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useStaticData, { StaticData } from '../../../../data/static_data';
import { SchemaFieldSelect } from '../../../../models/schema';
import { useExplorerStore, useStaticDataStore } from '../../../../store';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';
import { from, tap } from 'rxjs';
import { Translation } from '../../../../store/common/translation';

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

  /* const [formData] = useObservableState(() => {
   *   return from($currentData);
   * }, null); */

  const [formData, setFormData] = useState<StaticData | null>(null);
  const [formDataTranslations, setFormDataTranslations] = useState<Translation>(
    {}
  );
  const { $currentData, $currentSchema } = useStaticData({
    files,
    currentFile: currentOpenFile,
    $currentDataChange: useObservable(pluckFirst, [formData]),
  });
  useSubscription($currentData, setFormData);

  const currentSchema = useObservableState($currentSchema);

  /* const [formTranslations, setFormTranslations] = useState(translations); */
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

  /* const formData = fileData?.[currentOpenFile?.id || '']?.data || []; */

  const onValueChange = useCallback(
    (val) => {
      setFormData(val);
      /* setFormDataTranslations(translations); */
    },
    [updateTranslations]
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
