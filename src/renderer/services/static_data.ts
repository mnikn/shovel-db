import { watch } from '@vue-reactivity/watch';
import { computed, ref } from '@vue/reactivity';
import toml from 'toml';
import type { ProjectServiceType } from '.';
import { FILE_GROUP } from '../../common/constants';
import ipc from '../../renderer/electron/ipc';
import {
  buildSchema,
  SchemaFieldArray,
  TEMPLATE_ARR_OBJ_SCHEMA_CONFIG,
} from '../models/schema';
import type { FileServiceType } from './file';
import TranslationService from './parts/translation';

// type JSONPrimitive = string | number | boolean | null;
// type JSONArray = JSONValue[];
// type JSONValue = JSONPrimitive | JSONArray | JSONObject;
// interface JSONObject {
//   [key: string]: JSONValue;
// }
// type JSONData = JSONValue | null;

// export type JSONData = {
//   [key: string]: number | string | boolean | null | JSONData | Array<JSONData>;
// } | null;

export type JSONData = any;

export type StaticFileData = {
  data: JSONData;
  schema: JSONData;
};

const StaticDataService = (
  fileService: FileServiceType,
  projectService: ProjectServiceType
) => {
  const translationService = TranslationService(projectService);
  let staticFileDataTable = ref<{
    [key: string]: StaticFileData;
  }>({});
  let currentStaticFileRawData = ref<StaticFileData | null>(null);
  const currentSchema = ref<SchemaFieldArray | null>(null);
  const currentData = ref<JSONData | null>(null);

  const memento = computed(() => {
    return {
      needSaveFileData: Object.keys(staticFileDataTable.value).map((fileId) => {
        const filePathChain = fileService.getFilePathChain(fileId);
        return {
          filePathChain,
          data: staticFileDataTable.value[fileId],
        };
      }),
      trasnlationMemento: translationService.memento.value,
    };
  });

  const restoreMemento = (newMemento: Partial<{ trasnlationMemento: any }>) => {
    if (newMemento.trasnlationMemento !== undefined) {
      translationService.restoreMemento(newMemento.trasnlationMemento);
    }
  };

  const getStaticFileData = async (fileId: string) => {
    if (fileService.getFileRootParent(fileId)?.id !== FILE_GROUP.STATIC_DATA) {
      return;
    }

    // when first get static data, fetch static data translation data
    if (Object.keys(staticFileDataTable.value).length === 0) {
      const translationRawData = (
        await ipc.fetchDataFiles([['static-data', 'translations.csv']])
      )?.[0];
      if (translationRawData) {
        console.log('vcwe: ', translationRawData);
        const translations: any = {};
        translationRawData.forEach((s, i) => {
          s.forEach((s2, j) => {
            if (j === 0) {
              translations[s2] = {};
            } else {
              translations[s[0]][projectService.langs.value[j - 1]] = s2;
            }
          });
        });
        translationService.restoreMemento({
          translations,
        });
      }
    }
    if (fileId in staticFileDataTable.value) {
      return staticFileDataTable.value[fileId];
    }

    const filePathChain = fileService.getFilePathChain(fileId);
    if (filePathChain.length > 0) {
      filePathChain[filePathChain.length - 1] += '.json';
    }
    const data = (await ipc.fetchDataFiles([filePathChain]))[0];
    if (!data) {
      staticFileDataTable.value[fileId] = {
        data: [],
        schema: TEMPLATE_ARR_OBJ_SCHEMA_CONFIG,
      };
    } else {
      staticFileDataTable.value[fileId] = {
        data: data.data,
        schema: data.schema,
      };
    }
    return staticFileDataTable.value[fileId];
  };

  const refreshCurrentFileData = async () => {
    if (!fileService.currentOpenFile.value) {
      return;
    }
    const fileData = await getStaticFileData(fileService.currentOpenFile.value);
    if (fileData) {
      currentStaticFileRawData.value = fileData;
    }
  };

  watch(
    () => [
      fileService.files.value,
      fileService.currentOpenFile.value,
      staticFileDataTable.value,
    ],
    refreshCurrentFileData,
    {
      immediate: true,
    }
  );

  watch(
    () => currentStaticFileRawData.value,
    (fileData) => {
      if (!fileData) {
        return;
      }
      const json = toml.parse(fileData.schema);
      currentSchema.value = buildSchema(json) as SchemaFieldArray;
      currentData.value = fileData.data;
    }
  );

  const updateFileSchema = (fileId: string, schema: string) => {
    if (!fileId) {
      return;
    }

    staticFileDataTable.value[fileId].schema = schema;
    staticFileDataTable.value = { ...staticFileDataTable.value };
    if (fileService.currentOpenFile.value === fileId) {
      const json = toml.parse(schema);
      currentSchema.value = buildSchema(json) as SchemaFieldArray;
    }
  };

  const updateFileData = (fileId: string, data: JSONData) => {
    if (!fileId) {
      return;
    }
    staticFileDataTable.value[fileId].data = data;
    staticFileDataTable.value = { ...staticFileDataTable.value };
  };

  return {
    ...translationService,
    currentStaticFileRawData,
    memento,
    restoreMemento,
    getStaticFileData,
    currentData,
    currentSchema,
    updateFileData,
    updateFileSchema,
  };
};

export type StaticDataServiceType = ReturnType<typeof StaticDataService>;
export type StaticDataServiceMemento = StaticDataServiceType['memento'];
export default StaticDataService;
