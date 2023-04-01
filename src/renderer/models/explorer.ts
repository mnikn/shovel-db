import { RawJson } from "../../type";
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

  public getRootPartent(): Folder | null {
    if (!this.parent) {
      return null;
    }
    if (!this.parent.parent) {
      return this.parent;
    }
    return this.parent.getRootPartent();
  }

  public addChild(child: File | Folder) {
    child.parent = this;
    this.children.push(child);
  }

  public removeChild(id: string) {
    this.children = this.children.filter((item) => item.id !== id);
  }

  public findChildRecursive(id: string): File | Folder | null {
    let match = this.children.find((item) => item.id === id) || null;
    if (match) {
      return match;
    }
    if (this.children.length <= 0) {
      return null;
    }
    this.children.forEach((item) => {
      if (item instanceof File) {
        return
      }
      const item2 = item.findChildRecursive(id);
      if (item2) {
        match = item2;
      }
    });
    return match;
  }
}

export function buildFileTree(data: RawJson[]): Array<File | Folder> {
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

export function buildFileTreeItem(item: RawJson, dataMap: Map<string, any> = new Map()) {
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