import { createGlobalStore } from 'hox';
import { maxBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Event, eventEmitter } from '.';
import { RawJson } from '../../type';
import {
  createFile,
  createFolder,
  File,
  Folder,
  getChildren,
  getRootParent,
} from '../models/explorer';

export function getDeepChildren(currentFolder: any, files: any[]): any[] {
  let res: any[] = [];
  files.forEach((item) => {
    if (item.parentId === currentFolder.id && item.type === 'folder') {
      res = [...res, ...getDeepChildren(item, files)];
    } else {
      if (item.parentId === currentFolder.id) {
        res.push(item);
      }
    }
  });
  return res;
}

export const [useExplorerStore, getExplorerStore] = createGlobalStore(() => {
  const [currentOpenFile, setCurrentOpenFile] = useState<File | null>(null);
  const [recentOpenFiles, setRecentOpenFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<Array<File | Folder>>([]);
  const filesRef = useRef<Array<File | Folder>>(files);
  filesRef.current = files;

  useEffect(() => {
    setFiles([
      {
        id: 'story',
        name: 'story',
        type: 'folder',
        order: 1,
        parentId: null,
      },
      {
        id: 'static-data',
        name: 'static-data',
        type: 'folder',
        order: 2,
        parentId: null,
      },
    ]);
  }, []);

  useEffect(() => {
    const updateExploere = (files: Array<File | Folder>) => {
      setFiles(files);
    };
    const startOpenFile = (fileId: string) => {
      const data = filesRef.current.find((item) => item.id === fileId) as File;
      if (!data) {
        return;
      }
      setCurrentOpenFile(data);
      const rootParent = getRootParent(data?.parentId || '', filesRef.current);
      if (rootParent.id === 'story') {
        eventEmitter.emit(Event.OpenStorylet, data?.id);
      }
    };
    eventEmitter.on(Event.UpdateExplorer, updateExploere);
    eventEmitter.on(Event.UpdateRecentOpenFiles, setRecentOpenFiles);
    eventEmitter.on(Event.OpenFile, startOpenFile);
    return () => {
      eventEmitter.off(Event.UpdateExplorer, updateExploere);
      eventEmitter.off(Event.UpdateRecentOpenFiles, setRecentOpenFiles);
      eventEmitter.off(Event.OpenFile, startOpenFile);
    };
  }, []);

  const openFile = useCallback((file: File | null) => {
    setCurrentOpenFile(file);
    if (file) {
      setRecentOpenFiles((prev) => {
        let newVal = [...prev];
        newVal.push(file.id);
        newVal = newVal.slice(-10);
        return newVal;
      });
    }
    const rootParent = getRootParent(file?.parentId || '', filesRef.current);
    if (rootParent.id === 'story') {
      eventEmitter.emit(Event.OpenStorylet, file?.id);
    }
  }, []);

  const updateItem = (id: string, val: File | Folder) => {
    const file = files.find((item) => item.id === id);
    if (!file) {
      return;
    }

    file.name = val.name;

    if (file.type === 'file') {
      const rootParent = getRootParent(file?.parentId || '', filesRef.current);
      if (rootParent.id === 'story') {
        eventEmitter.emit(Event.UpdateStoryletName, id, val.name);
      }
    }

    setFiles([...files]);
  };

  const newFile = useCallback(
    (parentId: string, name?: string): File | null => {
      const prev = filesRef.current;
      const val = createFile();
      val.name = name || 'Untitled';
      const parent = prev.find((item) => item.id === parentId);
      if (!parent) {
        return null;
      }
      val.parentId = parentId;
      val.order =
        maxBy(
          prev.filter((item) => item.parentId === parentId),
          'order'
        )?.order || -1 + 1;
      const res = prev.concat(val);
      setFiles(res);
      const rootFolder = getRootParent(parentId, res);
      if (rootFolder.id === 'story') {
        eventEmitter.emit(Event.CreateStorylet, val);
      }
      return val;
    },
    []
  );

  const newFolder = useCallback((parentId: string) => {
    setFiles((prev) => {
      const val = createFolder();
      val.name = 'Untitled';
      const parent = prev.find((item) => item.id === parentId);
      if (!parent) {
        return prev;
      }
      val.parentId = parentId;
      val.order =
        maxBy(
          prev.filter((item) => item.parentId === parentId),
          'order'
        )?.order || 0 + 1;
      return prev.concat(val);
    });
  }, []);

  const deleteItem = (id: string) => {
    const file = files.find((item) => item.id === id);
    if (!file) {
      return;
    }

    const rootParent = getRootParent(file?.parentId || '', filesRef.current);
    if (rootParent.id === 'story') {
      eventEmitter.emit(Event.DeleteStorylet, id);
    }

    if (file.type === 'folder') {
      const children = getChildren(file.id, files).map((item) => item.id);
      setFiles(
        files.filter((item) => !children.includes(item.id) && item.id !== id)
      );
    } else {
      setFiles(files.filter((f) => f.id !== id));
    }
  };

  const moveFile = useCallback((sourceId: string, targetId: string) => {
    console.log('dsds: ', sourceId, targetId);
    setFiles((files) => {
      const newVal = [...files];
      const sourceItem = newVal.find((item) => item.id === sourceId);
      const targetItem = newVal.find((item) => item.id === targetId);
      if (!sourceItem || !targetItem) {
        return files;
      }
      if (targetItem.type === 'folder') {
        sourceItem.parentId = targetId;
        sourceItem.order =
          maxBy(
            newVal.filter((item) => item.parentId === targetId),
            'order'
          )?.order || -1 + 1;
        // targetItem.children.push(sourceItem.id);
      } else if (targetItem.type === 'file') {
        const parentId = targetItem.parentId;
        sourceItem.parentId = parentId;
        sourceItem.order = targetItem.order + 1;
        newVal
          .filter((item) => item.parentId === parentId)
          .forEach((item) => {
            if (item.order >= sourceItem.order && item.id !== sourceItem.id) {
              item.order += 1;
            }
          });
      }

      return newVal;
    });
  }, []);

  return {
    files,
    currentOpenFile,
    recentOpenFiles,
    openFile,
    newFile,
    newFolder,
    updateItem,
    deleteItem,
    moveFile,
  };
});
