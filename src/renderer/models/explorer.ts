import { RawJson } from '../../type';
import { UUID } from '../../utils/uuid';

export interface File {
  id: string;
  type: 'file';
  name: string;
  order: number;
  parentId: string | null;
}

export interface Folder {
  id: string;
  type: 'folder';
  name: string;
  order: number;
  parentId: string | null;
}

export function getFullPath(
  item: Folder | File | null,
  files: Array<File | Folder>
): string | null {
  if (item === null) {
    return null;
  }
  if (item.parentId === null) {
    return item.name;
  }

  const parent = files.find((d) => d.id === item.parentId) || null;
  return `${getFullPath(parent, files)}.${item.name}`;
}

export function createFile(): File {
  return {
    id: UUID(),
    type: 'file',
    name: '',
    order: -1,
    parentId: null,
  };
}

export function createFolder(): Folder {
  return {
    id: UUID(),
    type: 'folder',
    name: '',
    order: -1,
    parentId: null,
  };
}

export function getChildren(
  parentId: string,
  files: Array<File | Folder>,
  deep = false
): (File | Folder)[] {
  const children = files.filter((item) => item.parentId === parentId);
  if (deep) {
    return children
      .map((item) => {
        return getChildren(item.id, files, deep);
      })
      .flat();
  }
  return children;
}

export function getRootParent(id: string, files: Array<File | Folder>): any {
  const item = files.find((d) => d.id === id);
  if (!item) {
    return null;
  }

  if (!item.parentId) {
    return item;
  }
  return getRootParent(item.parentId, files);
}
