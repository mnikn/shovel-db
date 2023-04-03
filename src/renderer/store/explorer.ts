import { useEffect, useMemo, useState } from 'react';
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
    const createItemFile = (parentId: string | null = null) => {
      const res = {
        id: UUID(),
        name: UUID().substring(0, 10),
        type: 'file',
        parentId: parentId,
      };
      return res;
    };
    const createFolder = (parentId: string | null = null) => {
      const res = {
        id: UUID(),
        name: UUID().substring(0, 10),
        type: 'folder',
        parentId: parentId,
      };
      return res;
    };

    const itemA = createFolder('static-data');
    setFiles([
      {
        id: 'static-data',
        name: 'Static Data',
        type: 'folder',
        parentId: null,
      },
      {
        id: 'story',
        name: 'Story',
        type: 'folder',
        parentId: null,
      },
      itemA,
      createItemFile('static-data'),
      createItemFile('static-data'),
      createItemFile('static-data'),
      createItemFile('static-data'),
      createItemFile('static-data'),
      createItemFile('static-data'),
      createItemFile('story'),
      createItemFile('story'),
      createItemFile('story'),
      createItemFile('story'),
      createItemFile('story'),
      createItemFile('story'),
      createItemFile(itemA.id),
      createItemFile(itemA.id),
      createItemFile(itemA.id),
      createItemFile(itemA.id),
      createItemFile(itemA.id),
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

  return {
    files,
    fileTree,
    currentOpenFile,
    openFile,
    updateItem,
    deleteItem,
  };
});
