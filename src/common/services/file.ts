import { isEqual, cloneDeep } from 'lodash';
import { ref, computed } from '@vue/reactivity';
import { FILE_GROUP } from '../constants';
import { File, Folder } from '../models/file';
import { UUID } from '../utils/uuid';

export type FileServiceMemento = {
  files: Array<File | Folder>;
};

let files = ref<{ [key: string]: File | Folder }>({
  [FILE_GROUP.STATIC_DATA]: {
    id: FILE_GROUP.STATIC_DATA,
    type: 'folder',
    name: 'Data',
    order: 1,
    parentId: null,
  },
  [FILE_GROUP.STORY]: {
    id: FILE_GROUP.STORY,
    type: 'folder',
    name: 'Story',
    order: 2,
    parentId: null,
  },
});

const memento = computed((): FileServiceMemento => {
  return {
    files: Object.values(files.value),
  };
});

const restoreMemento = (newMemento: FileServiceMemento) => {
  if (isEqual(newMemento, memento.value)) {
    return;
  }
  files.value = newMemento.files.reduce((res, item) => {
    res[item.id] = item;
    return res;
  }, {});
};

const getFile = (fileId: string): File | Folder | null => {
  return files.value[fileId] || null;
};

const getFileParent = (fileId: string): File | Folder | null => {
  const currentFile = getFile(fileId);
  if (!currentFile || currentFile.parentId === null) {
    return null;
  }
  return getFile(currentFile.parentId);
};

const getFileRootParent = (fileId: string): Folder | null => {
  const item = files.value[fileId];
  if (!item) {
    return null;
  }

  if (!item.parentId) {
    return item as Folder;
  }
  return getFileRootParent(item.parentId);
};

const getFolderChildren = (
  folderId: string,
  deep = false
): Array<File | Folder> => {
  const children = Object.values(files.value).filter(
    (item) => item.parentId === folderId
  );
  if (deep) {
    return children
      .map((item) => {
        return getFolderChildren(item.id, deep);
      })
      .concat(children)
      .flat();
  }
  return children;
};

const doCreateFile = (
  targetFileId: string,
  dataGenerateFn: (group: string) => File | Folder
) => {
  const targetFile = getFile(targetFileId);
  if (!targetFile) {
    throw new Error('target file not exists: ' + targetFileId);
  }
  const group = getFileRootParent(targetFileId);
  if (!group) {
    throw new Error('target file group not exists: ' + targetFileId);
  }

  const newFile = dataGenerateFn(group.id);

  let targetFolder: Folder;
  if (targetFile.type === 'file') {
    if (!targetFile.parentId) {
      throw new Error('target file parent not exists: ' + targetFileId);
    }
    targetFolder = getFile(targetFile.parentId) as Folder;
  } else {
    targetFolder = targetFile;
  }

  const folderChildren = getFolderChildren(targetFolder.id);
  newFile.parentId = targetFolder.id;
  newFile.order =
    targetFile.type === 'file' ? targetFile.order + 1 : folderChildren.length;
  newFile.order = Math.max(newFile.order, 1);
  folderChildren.forEach((file) => {
    if (file.order >= newFile.order) {
      file.order += 1;
    }
  });
  files.value[newFile.id] = newFile;
  return newFile;
};

const createFile = (targetFileId: string, data?: Partial<File>): File => {
  return doCreateFile(targetFileId, (group) => {
    return {
      id: `${group}-file-${UUID()}`,
      type: 'file',
      name: '',
      order: 1,
      parentId: null,
      ...data,
    };
  }) as File;
};

const createFolder = (targetFileId: string, data?: Partial<Folder>): Folder => {
  return doCreateFile(targetFileId, (group) => {
    return {
      id: `${group}-folder-${UUID()}`,
      type: 'folder',
      name: '',
      order: 1,
      parentId: null,
      ...data,
    };
  }) as Folder;
};

const renameFile = (fileId: string, name: string) => {
  const targetFile = getFile(fileId);
  if (!targetFile) {
    throw new Error(`file ${fileId} not exists!`);
  }
  targetFile.name = name;
  // trigger compute
  files.value = {
    ...files.value,
  };
};

const deleteFile = (fileId: string) => {
  const file = getFile(fileId);
  if (!file) {
    throw new Error('file not exists: ' + fileId);
  }

  if (file.type === 'file') {
    delete files.value[fileId];
  } else {
    const children = getFolderChildren(file.id);
    children.forEach((child) => {
      delete files.value[child.id];
    });
    delete files.value[fileId];
  }
};

export default {
  memento,
  restoreMemento,
  getFile,
  getFileParent,
  getFileRootParent,
  getFolderChildren,
  createFile,
  createFolder,
  renameFile,
  deleteFile,
};
