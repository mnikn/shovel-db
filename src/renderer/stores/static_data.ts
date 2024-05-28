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
    const [currentFilters, setCurrentFilters] = useState<any[]>([]);

    const [currentLang, setCurrentLang] = useState<string>('zh-cn');
    const [translations, setTranslations] = useState<Translation>({});
    const [loading, setLoading] = useState(true);
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
      const stopWatchFilters = watch(
        () => staticDataService.currentFilters.value,
        (filters) => {
          setCurrentFilters(filters);
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

      const stopWatchLoading = watch(
        () => staticDataService.loading.value,
        setLoading,
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
        stopWatchLoading();
        stopWatchFilters();
      };
    }, []);

    const updateFileData = staticDataService.updateFileData;
    const updateFileSchema = staticDataService.updateFileSchema;
    const syncCurrentData = staticDataService.syncCurrentData;
    const getStaticFileData = staticDataService.getStaticFileData;
    const getStaticFileDataByPath = staticDataService.getStaticFileDataByPath;
    const tr = staticDataService.tr;
    const switchLang = staticDataService.switchLang;
    const updateTranslations = staticDataService.updateTranslations;
    const updateTranslateKey = staticDataService.updateTranslateKey;

    return {
      currentData,
      currentStaticFileRawData,
      updateFileData,
      syncCurrentData,
      updateFileSchema,
      currentSchema,
      getStaticFileData,
      getStaticFileDataByPath,

      tr,
      currentLang,
      switchLang,
      translations,
      updateTranslations,
      updateTranslateKey,
      loading,

      currentFilters,
    };
  }
);
export type StaticDataStoreType = ReturnType<typeof getStaticDataStore>;
