import { debounce } from '@mui/material';
import { watch } from '@vue-reactivity/watch';
import { computed, ref, toValue } from '@vue/reactivity';
import type { ProjectServiceType } from '.';
import { FILE_GROUP } from '../../common/constants';
import ipc from '../../renderer/electron/ipc';
import {
  buildSchema,
  DEFAULT_CONFIG_JSON,
  SchemaFieldArray,
  validateValue,
} from '../models/schema';
import type { FileServiceType } from './file';
import TranslationService from './parts/translation';

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
  const loading = ref<boolean>(false);

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

  const getStaticFileDataByPath = async (filePath: string) => {
    const targetFile = Object.values(fileService.files.value).find((item) => {
      return (
        item.type === 'file' &&
        fileService.getFilePathChain(item.id).join('.') ===
          'static-data' + '.' + filePath
      );
    });
    if (!targetFile?.id) {
      return;
    }
    return await getStaticFileData(targetFile.id);
  };

  const getStaticFileData = async (fileId: string) => {
    if (fileService.getFileRootParent(fileId)?.id !== FILE_GROUP.STATIC_DATA) {
      return;
    }

    const projectPath = toValue(projectService.projectPath);
    // when first get static data, fetch static data translation data
    if (Object.keys(staticFileDataTable.value).length === 0 && projectPath) {
      const translationRawData = (
        await ipc.fetchDataFiles(projectPath, [
          ['static-data', 'translations.csv'],
        ])
      )?.[0];
      if (translationRawData) {
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

    let data: any;
    if (projectPath) {
      data = (await ipc.fetchDataFiles(projectPath, [filePathChain]))[0];
    }
    if (!data) {
      staticFileDataTable.value[fileId] = {
        data: [],
        schema: JSON.stringify(
          DEFAULT_CONFIG_JSON.TEMPLATE_ARR_OBJ_JSON,
          null,
          2
        ),
      };
    } else {
      const schemaObj = buildSchema(JSON.parse(data.schema));
      staticFileDataTable.value[fileId] = {
        data: validateValue(data.data, data.data, schemaObj),
        schema: data.schema,
      };
    }
    return staticFileDataTable.value[fileId];
  };

  const refreshCurrentFileData = debounce(async () => {
    if (
      !fileService.currentOpenFile.value ||
      fileService.getFileRootParent(fileService.currentOpenFile.value)?.id !==
        FILE_GROUP.STATIC_DATA
    ) {
      return;
    }
    loading.value = true;
    const fileData = await getStaticFileData(fileService.currentOpenFile.value);
    if (fileData) {
      currentStaticFileRawData.value = fileData;
    }
    loading.value = false;
  }, 0);
  // }, 500);

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
      // const json = toml.parse(fileData.schema);
      const json = JSON.parse(fileData.schema);
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
      const json = JSON.parse(schema);
      currentSchema.value = buildSchema(json) as SchemaFieldArray;
    }
  };

  const updateFileData = (fileId: string, data: JSONData) => {
    if (!fileId || !currentSchema.value) {
      return;
    }

    staticFileDataTable.value[fileId].data = validateValue(
      data,
      data,
      currentSchema.value
    );
    staticFileDataTable.value = { ...staticFileDataTable.value };
  };

  return {
    ...translationService,
    currentStaticFileRawData,
    memento,
    restoreMemento,
    getStaticFileData,
    getStaticFileDataByPath,
    currentData,
    currentSchema,
    updateFileData,
    updateFileSchema,
    loading,
  };
};

export type StaticDataServiceType = ReturnType<typeof StaticDataService>;
export type StaticDataServiceMemento = StaticDataServiceType['memento'];
export default StaticDataService;
