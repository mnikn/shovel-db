import { pluckFirst, useObservable, useSubscription } from 'observable-hooks';
import { join } from 'path';
import { useCallback, useState } from 'react';
import {
  combineLatestWith,
  filter,
  first,
  map,
  skip,
  switchMap,
  take,
} from 'rxjs';
import { HAS_FILE, READ_FILE, WRITE_FILE } from '../../constants/events';
import { ipcSend } from '../electron/ipc';
import { File, Folder } from '../models/explorer';

export default function useExplorer({
  projectPath,
}: {
  projectPath: string | null;
}) {
  const $fileData = useObservable<
    {
      files: Array<File | Folder>;
      recentOpenFiles: string[];
    } | null,
    [string | null]
  >(
    ($inputs) => {
      return $inputs.pipe(
        switchMap(async ([_projectPath]) => {
          if (!_projectPath) {
            return Promise.resolve(null);
          }
          const explorerDataPath = join(_projectPath, 'explorer.json');
          const hasFile = await ipcSend(HAS_FILE, {
            filePath: explorerDataPath,
          });
          if (!hasFile) {
            return Promise.resolve(null);
          }
          // return JSON.parse(
          //   await ipcSend(READ_FILE, {
          //     filePath: explorerDataPath,
          //   })
          // );

          return ipcSend(READ_FILE, {
            filePath: explorerDataPath,
            json: true,
          });
        })
      );
    },
    [projectPath]
  );

  const [files, setFiles] = useState<Array<File | Folder>>([]);
  const [recentOpenFiles, setRecentOpenFiles] = useState<string[]>([]);
  const $files = useObservable(pluckFirst, [files]);
  useSubscription($fileData, (fileData) => {
    setFiles(fileData?.files || []);
    setRecentOpenFiles(fileData?.recentOpenFiles || []);
  });

  const [currentOpenFile, setCurrentOpenFile] = useState<File | null>(null);
  const $currentOpenFileChange = useObservable(
    ($inputs) => {
      return $inputs.pipe(skip(2), pluckFirst);
    },
    [currentOpenFile]
  );
  useSubscription($currentOpenFileChange, (val) => {
    if (!val) {
      return;
    }
    setRecentOpenFiles((prev) => {
      let newVal = [...prev];
      newVal.push(val.id);
      newVal = newVal.slice(-10);
      return newVal;
    });
  });
  useSubscription($files, (val) => {
    if (!val.find((f) => f.id === currentOpenFile?.id)) {
      setCurrentOpenFile(null);
    }
  });

  const $recentOpenFilesReady = useObservable(
    ($inputs) => {
      return $inputs.pipe(
        take(2),
        map(([val]) => {
          return val;
        })
      );
    },
    [recentOpenFiles]
  );
  useSubscription($recentOpenFilesReady, (val) => {
    const initFile = files.find((f) => f.id === val[val.length - 1]) || null;
    setCurrentOpenFile(initFile as File | null);
  });

  const createFile = useCallback((id: string) => {}, []);
  const renameFile = useCallback((id: string, name: string) => {}, []);
  const reoderFile = useCallback((fromId: string, toId: string) => {}, []);

  const save = async () => {
    if (!projectPath) {
      return;
    }
    const explorerConfigPath = join(projectPath, 'explorer.json');
    await ipcSend(WRITE_FILE, {
      filePath: explorerConfigPath,
      data: {
        files,
        recentOpenFiles,
      },
    });
  };

  // const $save = useObservable(
  //   ($inputs) => {
  //     return $inputs.pipe(
  //       map(async ([_projectPath, _recentOpenFiles, _files]) => {
  //         if (!_projectPath) {
  //           return;
  //         }
  //         const explorerConfigPath = join(_projectPath, 'explorer.json');
  //         console.log('explore: ', _recentOpenFiles);
  //         await ipcSend(WRITE_FILE, {
  //           filePath: explorerConfigPath,
  //           data: {
  //             files: _files,
  //             recentOpenFiles: _recentOpenFiles,
  //           },
  //         });
  //       })
  //     );
  //   },
  //   [projectPath, recentOpenFiles, files]
  // );

  return {
    files,
    createFile,
    renameFile,
    reoderFile,
    currentOpenFile,
    setCurrentOpenFile,
    save,
  };
}
