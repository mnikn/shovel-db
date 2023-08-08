import { Box, Stack } from '@mui/material';
import { isEqual } from 'lodash';
import {
  pluckFirst,
  useObservable,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import useStaticData, { StaticData } from '../../../../data/static_data';
import { SchemaFieldSelect } from '../../../../models/schema';
import { useExplorerStore, useStaticDataStore } from '../../../../store';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';
import { from, tap, map, filter } from 'rxjs';
import { Translation } from '../../../../store/common/translation';
import { useFormSync } from '../../../../../utils/hooks/use_form_sync';
import { EditorContext } from '../../context';

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
  const { files, currentOpenFile } = useContext(EditorContext);

  const [formData, setFormData] = useState<StaticData | null>(null);
  const [formTranslations, setFormTranslations] = useState<Translation>({});
  const { projectPath, projectSettings } = useContext(EditorContext);
  const {
    currentData,
    setCurrentData,
    currentSchema,
    currentLang,
    setCurrentLang,
    translations,
    updateTranslations,
  } = useStaticData({
    langs: projectSettings?.i18n || [],
    files,
    projectPath,
    currentFile: currentOpenFile,
  });

  useFormSync({
    originData: currentData,
    formData,
    setOriginData: setCurrentData,
    setFormData,
  });
  useFormSync({
    originData: translations,
    formData: formTranslations,
    setOriginData: updateTranslations,
    setFormData: setFormTranslations,
  });

  const onValueChange = useCallback(
    (val) => {
      setFormData(val);
      setFormTranslations(translations);
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
        translations={formTranslations}
        schema={currentSchema}
        currentLang={currentLang}
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
          onValueChange={setCurrentLang}
        />
      </Box>
    </Stack>
  );
}
