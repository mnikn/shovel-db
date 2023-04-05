import { useCallback, useEffect, useMemo, useState } from 'react';
import { maxBy } from 'lodash';
import { createGlobalStore } from 'hox';
import { buildFileTree, File, Folder } from '../models/explorer';
import { UUID } from '../../utils/uuid';
import { RawJson } from '../../type';

function getDeepChildren(currentFolder: any, files: any[]): any[] {
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
  const [files, setFiles] = useState<RawJson[]>([]);

  const fileTree = useMemo(() => {
    return buildFileTree(Object.values(files));
  }, [files]);

  useEffect(() => {
    const createItemFile = (parentId: string | null = null, order = -1) => {
      const res = {
        id: UUID(),
        name: UUID().substring(0, 10),
        type: 'file',
        order,
        parentId: parentId,
      };
      return res;
    };
    const createFolder = (parentId: string | null = null, order = -1) => {
      const res = {
        id: UUID(),
        name: UUID().substring(0, 10),
        type: 'folder',
        order,
        parentId: parentId,
      };
      return res;
    };

    const itemA = createFolder('static-data');
    setFiles([
      {
        id: 'story',
        name: 'Story',
        type: 'folder',
        order: 1,
        parentId: null,
      },
      {
        id: 'static-data',
        name: 'Static Data',
        type: 'folder',
        order: 2,
        parentId: null,
      },
      createItemFile('story', 1),
      createItemFile('story', 2),
      createItemFile('story', 3),
      // itemA,
      // createItemFile('static-data'),
      // createItemFile('static-data'),
      // createItemFile('static-data'),
      // createItemFile('static-data'),
      // createItemFile('static-data'),
      // createItemFile('static-data'),
      // createItemFile('story'),
      // createItemFile('story'),
      // createItemFile('story'),
      // createItemFile('story'),
      // createItemFile('story'),
      // createItemFile('story'),
      // createItemFile(itemA.id),
      // createItemFile(itemA.id),
      // createItemFile(itemA.id),
      // createItemFile(itemA.id),
      // createItemFile(itemA.id),
    ]);
  }, []);

  const openFile = (file: File | null) => {
    setCurrentOpenFile(file);
  };

  const updateItem = (id: string, val: File | Folder) => {
    const file = files.find((item) => item.id === id);
    if (!file) {
      return;
    }

    file.name = val.name;

    setFiles([...files]);
  };

  const newFile = useCallback((parentId: string) => {
    setFiles((prev) => {
      const val = new File().toJson();
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
        ) || 0 + 1;
      return prev.concat(val);
    });
  }, []);

  const newFolder = useCallback((parentId: string) => {
    setFiles((prev) => {
      const val = new Folder().toJson();
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
        ) || 0 + 1;
      return prev.concat(val);
    });
  }, []);

  const deleteItem = (id: string) => {
    const file = files.find((item) => item.id === id);
    if (!file) {
      return;
    }
    if (file.type === 'folder') {
      const children = getDeepChildren(file, files).map((item) => item.id);
      setFiles(
        files.filter((item) => !children.includes(item.id) && item.id !== id)
      );
    } else {
      setFiles(files.filter((f) => f.id !== id));
    }
  };

  const moveFile = useCallback((sourceId: string, targetId: string) => {
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
          ) + 1;
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
    fileTree,
    currentOpenFile,
    openFile,
    newFile,
    newFolder,
    updateItem,
    deleteItem,
    moveFile,
  };
});
