import { watch } from '@vue-reactivity/watch';
import { createGlobalStore } from 'hox';
import { useEffect, useState } from 'react';
import { createLogger } from '../logger';
import { File, Folder } from '../models/file';
import { FileServiceType, getFileService } from '../services';

const logger = createLogger('file-store');

export const [useFileStore, getFileStore] = createGlobalStore(() => {
  const [files, setFiles] = useState<Array<File | Folder>>([]);

  const [currentOpenFile, setCurrentOpenFile] = useState<string | null>();
  const [recentOpenFiles, setRecentOpenFiles] = useState<string[]>([]);

  const fileService = getFileService();

  useEffect(() => {
    const stop = watch(
      () => fileService.memento.value,
      (memento) => {
        logger.debugLog('sync memento to store: ', memento);
        setFiles(memento.files);
        setCurrentOpenFile(memento.currentOpenFile);
        setRecentOpenFiles(memento.recentOpenFiles);
      },
      {
        immediate: true,
      }
    );
    return () => {
      stop();
    };
  }, [fileService]);

  const createFile = (targetFileId: string, data?: Partial<File>) => {
    logger.cacheLog(
      `create file: [target file id: ${targetFileId}, data: ${data}]`
    );
    return fileService.createFile(targetFileId, data);
  };
  const createFolder = (targetFileId: string, data?: Partial<Folder>) => {
    logger.cacheLog(
      `create folder: [target file id: ${targetFileId}, data: ${data}]`
    );
    return fileService.createFolder(targetFileId, data);
  };
  const renameFile = (fileId: string, name: string) => {
    logger.cacheLog(`rename file: ${fileId}`);
    return fileService.renameFile(fileId, name);
  };
  const deleteFile = (fileId: string) => {
    logger.cacheLog(`delete file: ${fileId}`);
    fileService.deleteFile(fileId);
  };
  const openFile = (fileId: string) => {
    logger.cacheLog(`open file: ${fileId}`);
    fileService.openFile(fileId);
  };

  const getFile = fileService.getFile;
  const getFileRootParent = fileService.getFileRootParent;
  const getFilePathChain = fileService.getFilePathChain;
  const getFolderChildren = fileService.getFolderChildren;

  return {
    files,
    currentOpenFile,
    recentOpenFiles,

    createFile,
    createFolder,
    renameFile,
    deleteFile,
    openFile,

    getFile,
    getFileRootParent,
    getFilePathChain,
    getFolderChildren,
  };
});
export type FileStoreType = ReturnType<typeof getFileStore>;
