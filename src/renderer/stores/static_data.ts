import { watch } from '@vue-reactivity/watch';
import { toValue } from '@vue/reactivity';
import { createGlobalStore } from 'hox';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { buildSchema, SchemaFieldArray } from '../models/schema';
import { StaticDataService, StaticFileData } from '../services';

// type StaticFileData = {
//   data: any;
//   schema: SchemaFieldArray;
// };

export const [useStaticDataStore, getStaticDataStore] = createGlobalStore(
  () => {
    const [currentStaticFileRawData, setCurrentStaticFileData] =
      useState<StaticFileData | null>(null);
    const [currentSchema, setCurrentSchema] = useState<SchemaFieldArray | null>(
      null
    );
    const [currentData, setCurrentData] = useState<any | null>(null);

    useEffect(() => {
      const stopWatchFileData = watch(
        () => StaticDataService.currentStaticFileRawData.value,
        (fileData) => {
          setCurrentStaticFileData(cloneDeep(fileData));
        },
        {
          immediate: true,
        }
      );
      const stopWatchSchema = watch(
        () => StaticDataService.currentSchema.value,
        (schema) => {
          setCurrentSchema(cloneDeep(schema));
        },
        {
          immediate: true,
        }
      );
      const stopWatchData = watch(
        () => StaticDataService.currentData.value,
        (data) => {
          setCurrentData(cloneDeep(data));
        },
        {
          immediate: true,
        }
      );
      return () => {
        stopWatchFileData();
        stopWatchSchema();
        stopWatchData();
      };
    }, []);

    const updateFileData = StaticDataService.updateFileData;
    const updateFileSchema = StaticDataService.updateFileSchema;
    const getStaticFileData = StaticDataService.getStaticFileData;
    return {
      currentData,
      currentStaticFileRawData,
      updateFileData,
      updateFileSchema,
      currentSchema,
      getStaticFileData,
    };
  }
);
export type StaticDataStoreType = ReturnType<typeof getStaticDataStore>;
