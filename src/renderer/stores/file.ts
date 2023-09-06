import { useCallback, useEffect, useState } from 'react';
import { watch } from '@vue-reactivity/watch';
import { File, Folder } from '../../common/models/file';
import { FileService } from '../../common/services';
import { createLogger } from '../logger';

const logger = createLogger('file-service');

const useFile = () => {
  const [files, setFiles] = useState<Array<File | Folder>>(
    FileService.memento.value.files
  );

  useEffect(() => {
    const stop = watch(
      () => FileService.memento.value,
      (memento) => {
        logger.debugLog('sync memento to store: ', memento);
        setFiles(memento.files);
      }
    );
    return () => {
      stop();
    };
  }, []);

  const createFile = useCallback(
    (targetFileId: string, data?: Partial<File>) => {
      logger.cacheLog(
        `create file: [target file id: ${targetFileId}, data: ${data}]`
      );
      return FileService.createFile(targetFileId, data);
    },
    []
  );
  const createFolder = useCallback(
    (targetFileId: string, data?: Partial<Folder>) => {
      logger.cacheLog(
        `create folder: [target file id: ${targetFileId}, data: ${data}]`
      );
      return FileService.createFolder(targetFileId, data);
    },
    []
  );
  const renameFile = useCallback((fileId: string, name: string) => {
    logger.cacheLog(`rename file: ${fileId}`);
    return FileService.renameFile(fileId, name);
  }, []);
  const deleteFile = useCallback((fileId: string) => {
    logger.cacheLog(`delete file: ${fileId}`);
    FileService.deleteFile(fileId);
  }, []);

  return {
    files,
    createFile,
    createFolder,
    renameFile,
    deleteFile,
  };
};

export default useFile;
