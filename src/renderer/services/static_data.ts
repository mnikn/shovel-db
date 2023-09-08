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
let currentStaticFileRawData = ref<StaticFileData | null>(null);
const currentSchema = ref<SchemaFieldArray | null>(null);
const currentData = ref<JSONData | null>(null);
let projectService: ProjectServiceType;

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

const init = (
  _fileService: FileServiceType,
  _projectService: ProjectServiceType
) => {
  fileService = _fileService;
  projectService = _projectService;

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
      currentStaticFileRawData.value =
        staticFileDataTable.value[currentOpenFile];
      return;
    }

    const filePathChain = fileService.getFilePathChain(currentOpenFile);
    const data = (await ipc.fetchDataFiles([filePathChain]))?.[0];

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
    currentStaticFileRawData.value =
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

const updateFileSchema = (fileId: string, schema: string) => {
  if (!fileId) {
    return;
  }

  staticFileDataTable.value[fileId].schema = schema;
  staticFileDataTable.value = { ...staticFileDataTable.value };
};

const updateFileData = (fileId: string, data: JSONData) => {
  if (!fileId) {
    return;
  }
  staticFileDataTable.value[fileId].data = data;
  staticFileDataTable.value = { ...staticFileDataTable.value };
};

export default {
  currentStaticFileRawData,
  init,
  memento,
  getStaticFileData,
  currentData,
  currentSchema,
  updateFileData,
  updateFileSchema,
};
