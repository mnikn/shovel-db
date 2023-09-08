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
    const [currentStaticFileData, setCurrentStaticFileData] =
      useState<StaticFileData | null>(null);
    const [currentSchema, setCurrentSchema] = useState<SchemaFieldArray | null>(
      null
    );

    useEffect(() => {
      const stopWatchFileData = watch(
        () => StaticDataService.currentStaticFileData.value,
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
      return () => {
        stopWatchFileData();
        stopWatchSchema();
      };
    }, []);

    const updateFileSchema = StaticDataService.updateFileSchema;
    const getStaticFileData = StaticDataService.getStaticFileData;
    return {
      currentStaticFileData,
      updateFileSchema,
      currentSchema,
      getStaticFileData,
    };
  }
);
export type StaticDataStoreType = ReturnType<typeof getStaticDataStore>;
