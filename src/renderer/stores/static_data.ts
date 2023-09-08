import { watch } from '@vue-reactivity/watch';
import { createGlobalStore } from 'hox';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { SchemaFieldArray } from '../models/schema';
import { getStaticDataService, StaticFileData } from '../services';
import { Translation } from '../services/parts/translation';

export const [useStaticDataStore, getStaticDataStore] = createGlobalStore(
  () => {
    const [currentStaticFileRawData, setCurrentStaticFileData] =
      useState<StaticFileData | null>(null);
    const [currentSchema, setCurrentSchema] = useState<SchemaFieldArray | null>(
      null
    );
    const [currentData, setCurrentData] = useState<any | null>(null);

    const [currentLang, setCurrentLang] = useState<string>('zh-cn');
    const [translations, setTranslations] = useState<Translation>({});
    const staticDataService = getStaticDataService();

    useEffect(() => {
      const stopWatchFileData = watch(
        () => staticDataService.currentStaticFileRawData.value,
        (fileData) => {
          setCurrentStaticFileData(cloneDeep(fileData));
        },
        {
          immediate: true,
        }
      );
      const stopWatchSchema = watch(
        () => staticDataService.currentSchema.value,
        (schema) => {
          setCurrentSchema(cloneDeep(schema));
        },
        {
          immediate: true,
        }
      );
      const stopWatchData = watch(
        () => staticDataService.currentData.value,
        (data) => {
          setCurrentData(cloneDeep(data));
        },
        {
          immediate: true,
        }
      );
      const stopWatchCurrentLang = watch(
        () => staticDataService.currentLang.value,
        (lang) => {
          setCurrentLang(lang);
        },
        {
          immediate: true,
        }
      );
      const stopWatchTranslations = watch(
        () => staticDataService.translations.value,
        (translations) => {
          setTranslations(cloneDeep(translations));
        },
        {
          immediate: true,
        }
      );
      return () => {
        stopWatchFileData();
        stopWatchSchema();
        stopWatchData();
        stopWatchCurrentLang();
        stopWatchTranslations();
      };
    }, []);

    const updateFileData = staticDataService.updateFileData;
    const updateFileSchema = staticDataService.updateFileSchema;
    const getStaticFileData = staticDataService.getStaticFileData;
    const tr = staticDataService.tr;
    const switchLang = staticDataService.switchLang;
    const updateTranslations = staticDataService.updateTranslations;

    return {
      currentData,
      currentStaticFileRawData,
      updateFileData,
      updateFileSchema,
      currentSchema,
      getStaticFileData,

      tr,
      currentLang,
      switchLang,
      translations,
      updateTranslations,
    };
  }
);
export type StaticDataStoreType = ReturnType<typeof getStaticDataStore>;
