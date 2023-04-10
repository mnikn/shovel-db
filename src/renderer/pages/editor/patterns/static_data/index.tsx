import { Stack } from '@mui/material';
import React, { useMemo } from 'react';
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
  const { schemaConfigs } = useStaticDataStore();
  const { currentOpenFile } = useExplorerStore();
  const currentFileSchema = useMemo(() => {
    const config = schemaConfigs[currentOpenFile?.id || ''];
    if (!config) {
      return buildSchema(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON) as SchemaFieldArray;
    }
    return buildSchema(JSON.parse(config)) as SchemaFieldArray;
  }, [schemaConfigs, currentOpenFile]);
  return (
    <Stack sx={{ p: 6, height: '100%' }}>
      <SchemaForm
        formData={[] as any}
        schema={currentFileSchema}
        currentLang={LANG.ZH_CN}
        translations={{}}
        onValueChange={(val) => {}}
      />
    </Stack>
  );
}
