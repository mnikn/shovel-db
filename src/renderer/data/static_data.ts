import {
  pluckFirst,
  useObservable,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import { join } from 'path';
import { combineLatestWith, debounceTime, from, map, of } from 'rxjs';
import { READ_FILE } from '../../constants/events';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcSend } from '../electron/ipc';
import { File, Folder, getFullPath } from '../models/explorer';
import { SchemaFieldArray, SchemaFieldObject } from '../models/schema';
import { buildSchema } from '../models/schema/factory';
import useTranslation, { PRESET_LANGS } from './common/translation';

export type StaticData = Array<any>;
export type StaticFileData = {
  fileId: string;
  schema: SchemaFieldArray;
  getData: () => Promise<StaticData | null>;
};

export default function useStaticData({
  files,
  currentFile,
}: {
  files: Array<File | Folder>;
  currentFile: File | null;
}) {
  const projectPath = localStorage.getItem(PROJECT_ROOT_PATH) as string | null;
  const translationModule = useTranslation({
    langs: PRESET_LANGS,
  });

  const [totalSchemaData] = useObservableState<{
    [fileId: string]: SchemaFieldArray;
  }>(() => {
    if (!projectPath) {
      return of({});
    }
    const staticDataPath = join(projectPath, 'static-data');
    const schemaDataPath = join(staticDataPath, '.static-data.json');
    return from(
      ipcSend(READ_FILE, {
        filePath: schemaDataPath,
      }).then((rawData) => {
        return JSON.parse(rawData);
      })
    ).pipe(
      map((schemaData) => {
        const schemaContent = schemaData?.fileData || {};
        const schemaList = Object.keys(schemaContent).reduce((res, key) => {
          const item = schemaContent[key];
          res[key] = buildSchema(JSON.parse(item.schema));
          return res;
        }, {});
        return schemaList;
      })
    );
  });
  const $totalSchemaData = useObservable(pluckFirst, [totalSchemaData]);

  const $files = useObservable(pluckFirst, [files]);
  const [totalFileData] = useObservableState(() => {
    return $totalSchemaData.pipe(
      combineLatestWith($files),
      map(([_totalSchemaTable, _files]) => {
        if (!_totalSchemaTable) {
          return {};
        }
        const res = _files
          .filter((f) => {
            return f.parentId === 'static-data';
          })
          .reduce(
            (res, item) => {
              if (!projectPath) {
                res[item.id] = {
                  fileId: item.id,
                  schema:
                    _totalSchemaTable[item.id] ||
                    new SchemaFieldArray(new SchemaFieldObject()),
                  getData: () => {
                    return Promise.resolve(null);
                  },
                };
                return res;
              }
              const relativeFilePath = getFullPath(item, _files)?.replaceAll(
                '.',
                '/'
              );
              const filePath = join(projectPath, relativeFilePath + '.json');

              const readFileData = async () => {
                return ipcSend(READ_FILE, {
                  filePath,
                }).then((data) => {
                  return JSON.parse(data) as StaticData;
                });
              };

              res[item.id] = {
                fileId: item.id,
                schema:
                  _totalSchemaTable[item.id] ||
                  new SchemaFieldArray(new SchemaFieldObject()),
                getData: readFileData,
              };
              return res;
            },
            {} as {
              [fileId: string]: StaticFileData;
            }
          );
        return res;
      })
    );
  }, {});
  const $totalFileData = useObservable(pluckFirst, [totalFileData]);
  const $currentFile = useObservable(pluckFirst, [currentFile]);

  const [currentFileData] = useObservableState(() => {
    return $totalFileData.pipe(
      combineLatestWith($currentFile),
      map(([_totalFileData, _currentFile]) => {
        if (!_totalFileData) {
          return null;
        }
        return _totalFileData[_currentFile?.id || ''] || null;
      })
    );
  }, null);
  const $currentFileData = useObservable(pluckFirst, [currentFileData]);

  const [currentData, setCurrentData] = useObservableState<StaticData | null>(
    ($inputs) => {
      return $inputs.pipe(debounceTime(500));
    },
    null
  );
  useSubscription($currentFileData, async (fileData) => {
    if (!fileData) {
      setCurrentData(null);
      return;
    }
    setCurrentData(await fileData.getData());
  });

  const [currentSchema] = useObservableState(() => {
    return $currentFileData.pipe(
      map((fileData) => {
        return fileData?.schema || null;
      })
    );
  }, null);

  return {
    currentData,
    setCurrentData,
    currentSchema,
    ...translationModule,
  };
}
