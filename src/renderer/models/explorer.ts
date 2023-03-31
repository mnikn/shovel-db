import { UUID } from "../../utils/uuid";

function getFullPath(item: Folder | File | null): string | null {
  if (item === null) {
    return null;
  }
  if (item.parent === null) {
    return item.name;
  }

  return `${getFullPath(item.parent)}.${item.name}`;
}

export class File {
  public id = UUID();
  public name = "";
  public parent: Folder | null = null;
  get fullpath(): string | null {
    return getFullPath(this);
  }

  public toJson(): any {
    return {
      id: this.id,
      type: "file",
      name: this.name,
      parentId: this.parent?.id || null,
    };
  }
}

export class Folder {
  public id = UUID();
  public name = "";
  public collapsed = false;
  public children: Array<Folder | File> = [];

  public parent: Folder | null = null;

  get fullpath(): string | null {
    return getFullPath(this);
  }

  public toJson(): any {
    return {
      id: this.id,
      type: "folder",
      name: this.name,
      parentId: this.parent?.id || null,
      children: this.children.map((item) => item.id),
    };
  }
}

export function buildFileTree(data: any[]): Array<File | Folder> {
  const dataMap = new Map<string, any>();
  data.forEach((item) => {
    dataMap.set(item.id, item);
  });

  const values = Array.from(dataMap.values()).reduce((res, item) => {
    res.push(buildFileTreeItem(item, dataMap));
    return res;
  }, []);
  return values.filter((val: File | Folder) => val.parent === null);
}

function buildFileTreeItem(item: any, dataMap: Map<string, any>) {
  if (item.type === "folder") {
    const folder = new Folder();
    folder.id = item.id;
    folder.name = item.name;
    folder.parent =
      item.parentId !== null
        ? dataMap.get(item.parentId) instanceof Folder
          ? dataMap.get(item.parentId)
          : buildFileTreeItem(dataMap.get(item.parentId), dataMap)
        : null;

    if (folder.parent && !folder.parent.children.includes(folder)) {
      folder.parent.children.push(folder);
    }
    folder.children = (item.children || []).map((id: string) => {
      return dataMap.get(item.parentId) instanceof Folder ||
        dataMap.get(item.parentId) instanceof File
        ? dataMap.get(id)
        : buildFileTreeItem(item, dataMap);
    });
    dataMap.set(folder.id, folder);
    return folder;
  }

  if (item.type === "file") {
    const file = new File();
    file.id = item.id;
    file.name = item.name;
    file.parent =
      item.parentId !== null
        ? dataMap.get(item.parentId) instanceof Folder
          ? dataMap.get(item.parentId)
          : buildFileTreeItem(dataMap.get(item.parentId), dataMap)
        : null;

    if (file.parent && !file.parent.children.includes(file)) {
      file.parent.children.push(file);
    }
    dataMap.set(file.id, file);
    return file;
  }
}
