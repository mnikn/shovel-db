import { watch } from '@vue-reactivity/watch';
import { createGlobalStore } from 'hox';
import { useEffect, useState } from 'react';
import { createLogger } from '../logger';
import { File, Folder } from '../models/file';
import { FileService } from '../services';

const logger = createLogger('file-store');

export const [useFileStore, getFileStore] = createGlobalStore(() => {
  const [files, setFiles] = useState<Array<File | Folder>>([]);

  const [currentOpenFile, setCurrentOpenFile] = useState<string | null>();

  useEffect(() => {
    const stop = watch(
      () => FileService.memento.value,
      (memento) => {
        logger.debugLog('sync memento to store: ', memento);
        setFiles(memento.files);
        setCurrentOpenFile(memento.currentOpenFile);
      },
      {
        immediate: true,
      }
    );
    return () => {
      stop();
    };
  }, []);

  const createFile = (targetFileId: string, data?: Partial<File>) => {
    logger.cacheLog(
      `create file: [target file id: ${targetFileId}, data: ${data}]`
    );
    return FileService.createFile(targetFileId, data);
  };
  const createFolder = (targetFileId: string, data?: Partial<Folder>) => {
    logger.cacheLog(
      `create folder: [target file id: ${targetFileId}, data: ${data}]`
    );
    return FileService.createFolder(targetFileId, data);
  };
  const renameFile = (fileId: string, name: string) => {
    logger.cacheLog(`rename file: ${fileId}`);
    return FileService.renameFile(fileId, name);
  };
  const deleteFile = (fileId: string) => {
    logger.cacheLog(`delete file: ${fileId}`);
    FileService.deleteFile(fileId);
  };
  const openFile = (fileId: string) => {
    logger.cacheLog(`open file: ${fileId}`);
    FileService.openFile(fileId);
  };

  const getFile = FileService.getFile;
  const getFileRootParent = FileService.getFileRootParent;
  const getFilePathChain = FileService.getFilePathChain;

  return {
    files,
    currentOpenFile,

    createFile,
    createFolder,
    renameFile,
    deleteFile,
    openFile,

    getFile,
    getFileRootParent,
    getFilePathChain,
  };
});
export type FileStoreType = ReturnType<typeof getFileStore>;
