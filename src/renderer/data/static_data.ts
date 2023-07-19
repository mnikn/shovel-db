import { join } from 'path';
import { useEffect, useState } from 'react';
import { filter, from, map, Observable } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { READ_FILE } from '../../constants/events';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcSend } from '../electron/ipc';
import { File, Folder, getFullPath } from '../models/explorer';
import { SchemaFieldArray, SchemaFieldObject } from '../models/schema';
import { buildSchema } from '../models/schema/factory';

type StaticData = any;
type StaticFileData = {
  fileId: string;
  schema: SchemaFieldArray;
  data: Observable<StaticData>;
};

export default function useStaticData({
  files,
  currentFile,
}: {
  files: Array<File | Folder>;
  currentFile: File | null;
}) {
  const projectPath = localStorage.getItem(PROJECT_ROOT_PATH) as string | null;
  const [totalSchemaData, setTotalSchemaData] = useState<{
    [fileId: string]: SchemaFieldArray;
  }>({});

  useEffect(() => {
    if (!projectPath) {
      return;
    }
    const getSchemaData = async () => {
      const staticDataPath = join(projectPath, 'static-data');
      const schemaDataPath = join(staticDataPath, '.static-data.json');
      const schemaData = JSON.parse(
        await ipcSend(READ_FILE, {
          filePath: schemaDataPath,
        })
      );
      // const schemaData = {} as any;
      const schemaContent = schemaData?.fileData || {};
      const schemaList = Object.keys(schemaContent).reduce((res, key) => {
        const item = schemaContent[key];
        res[key] = buildSchema(JSON.parse(item.schema));
        return res;
      }, {});

      setTotalSchemaData(schemaList);
    };
    getSchemaData();
  }, [projectPath]);

  const totalFileData = useObservable<
    {
      [fileId: string]: StaticFileData;
    },
    [
      Array<File | Folder>,
      {
        [fileId: string]: SchemaFieldArray;
      }
    ]
  >(
    (_, $inputs) => {
      return $inputs.pipe(
        filter(() => {
          return !!projectPath;
        }),
        map(([_files, _totalSchemaTable]) => {
          return _files
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
                    data: from(Promise.resolve([] as StaticData)),
                  };
                  return res;
                }
                const relativeFilePath = getFullPath(item, _files)?.replaceAll(
                  '.',
                  '/'
                );
                const filePath = join(projectPath, relativeFilePath + '.json');
                res[item.id] = {
                  fileId: item.id,
                  schema:
                    _totalSchemaTable[item.id] ||
                    new SchemaFieldArray(new SchemaFieldObject()),
                  data: from(
                    ipcSend(READ_FILE, {
                      filePath,
                    }).then((data) => {
                      return JSON.parse(data);
                    })
                  ),
                };
                return res;
              },
              {} as {
                [fileId: string]: StaticFileData;
              }
            );
        })
      );
    },
    {},
    [files, totalSchemaData]
  );

  const currentFileData = useObservable<
    StaticFileData | null,
    [
      {
        [fileId: string]: StaticFileData;
      },
      File | null
    ]
  >(
    (_, inputs$) => {
      return inputs$.pipe(
        map(([_totalData, _currentFile]) => {
          return _totalData[_currentFile?.id || ''] || null;
        })
      );
    },
    null,
    [totalFileData, currentFile]
  );

  return {
    totalFileData,
    currentFileData,
  };
}
