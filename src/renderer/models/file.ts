export type JSONData = {
  [key: string]: number | string | boolean | null | JSONData;
} | null;

export type File = {
  id: string;
  type: 'file';
  name: string;
  order: number;
  parentId: string | null;
};

export type Folder = {
  id: string;
  type: 'folder';
  name: string;
  order: number;
  parentId: string | null;
};

export function getFullPath(
  item: Folder | File | null,
  files: Array<File | Folder>
): string | null {
  if (item === null) {
    return null;
  }
  if (!item.parentId) {
    return item.name;
  }

  const parent = files.find((d) => d.id === item.parentId) || null;
  return `${getFullPath(parent, files)}.${item.name}`;
}

export function getFolderChildren(
  folderId: string,
  files: Map<string, File | Folder>,
  deep = false
): (File | Folder)[] {
  const children = Array.from(files.values()).filter(
    (item) => item.parentId === folderId
  );
  if (deep) {
    return children
      .map((item) => {
        return getFolderChildren(item.id, files, deep);
      })
      .concat(children)
      .flat();
  }
  return children;
}

export function getRootParent(
  id: string,
  files: Map<string, File | Folder>
): Folder | null {
  const item = files.get(id);
  if (!item) {
    return null;
  }

  if (!item.parentId) {
    return item as Folder;
  }
  return getRootParent(item.parentId, files);
}

export function getPathParents(
  id: string,
  files: Map<string, File | Folder>,
  res: string[] = []
): string[] {
  const item = files.get(id);
  if (!item) {
    return res;
  }

  if (!item.parentId) {
    return [...res, item.id];
  }
  return getPathParents(item.parentId, files, [...res, item.id]);
}

export function formatFilesOrder(
  files: Map<string, File | Folder>,
  parentId?: string
) {
  const children = parentId
    ? getFolderChildren(parentId, files)
    : Array.from(files.values()).filter((f) => !f.parentId);
  children
    .sort((a, b) => a.order - b.order)
    .forEach((item, i) => {
      const fileItem = files.get(item.id);
      if (fileItem) {
        fileItem.order = i + 1;
      }
      if (item.type === 'folder') {
        formatFilesOrder(files, item.id);
      }
    });
}
