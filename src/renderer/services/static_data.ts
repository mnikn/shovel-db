import type { FileServiceType } from './file';
import { File, Folder } from '../models/file';
import {
  buildSchema,
  DEFAULT_CONFIG_JSON,
  SchemaFieldArray,
  SchemaFieldObject,
  TEMPLATE_ARR_OBJ_SCHEMA_CONFIG,
} from '../models/schema';
import toml from 'toml';
import { watch } from '@vue-reactivity/watch';
import { computed, ref } from '@vue/reactivity';
import ipc from '../../renderer/electron/ipc';
import { FILE_GROUP } from '../../common/constants';

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

let fileService: FileServiceType;
let staticFileDataTable = ref<{
  [key: string]: StaticFileData;
}>({});
let currentStaticFileData = ref<StaticFileData | null>(null);
const currentSchema = ref<SchemaFieldArray | null>(null);

const memento = computed(() => {
  return {
    needSaveFileData: Object.keys(staticFileDataTable.value).map((fileId) => {
      const filePathChain = fileService.getFilePathChain(fileId);
      return {
        filePathChain,
        data: staticFileDataTable.value[fileId],
      };
    }),
  };
});
export type StaticDataServiceMemento = typeof memento.value;

const init = (_fileService: FileServiceType) => {
  fileService = _fileService;

  const refreshCurrentFileData = async () => {
    const currentOpenFile = fileService.currentOpenFile.value;
    if (
      !currentOpenFile ||
      fileService.getFileRootParent(currentOpenFile)?.id !==
        FILE_GROUP.STATIC_DATA
    ) {
      return;
    }

    const currentFile = fileService.getFile(currentOpenFile);
    if (!currentFile) {
      return;
    }

    if (currentOpenFile in staticFileDataTable.value) {
      currentStaticFileData.value = staticFileDataTable.value[currentOpenFile];
      return;
    }

    const filePathChain = fileService.getFilePathChain(currentOpenFile);
    const data = (await ipc.fetchDataFiles([filePathChain]))[0];

    if (!data) {
      staticFileDataTable.value[currentOpenFile] = {
        data: [],
        schema: TEMPLATE_ARR_OBJ_SCHEMA_CONFIG,
      };
    } else {
      staticFileDataTable.value[currentOpenFile] = {
        data: data.data,
        schema: data.schema,
      };
    }
    currentStaticFileData.value =
      staticFileDataTable.value[currentOpenFile] || null;
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
    () => currentStaticFileData.value,
    (fileData) => {
      if (!fileData) {
        return;
      }
      const json = toml.parse(fileData.schema);
      currentSchema.value = buildSchema(json) as SchemaFieldArray;
    }
  );
};

const getStaticFileData = async (fileId: string) => {
  if (fileService.getFileRootParent(fileId)?.id !== FILE_GROUP.STATIC_DATA) {
    return;
  }
  if (fileId in staticFileDataTable.value) {
    return staticFileDataTable.value[fileId];
  }

  const filePathChain = fileService.getFilePathChain(fileId);
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

// const updateCurrentFileSchema;

const updateFileSchema = (fileId: string, schema: string) => {
  if (!fileService.currentOpenFile.value) {
    return;
  }

  staticFileDataTable.value[fileId].schema = schema;
  staticFileDataTable.value = { ...staticFileDataTable.value };
};

export default {
  currentStaticFileData,
  init,
  memento,
  updateFileSchema,
  currentSchema,
  getStaticFileData,
};
