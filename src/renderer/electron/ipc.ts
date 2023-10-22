import { dialog } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { IPC_API } from '../../common/constants';
import type { ServiceMementoType } from '../services';
import { UUID } from '../../common/utils/uuid';

const processPool = new Map<string, () => Promise<any>>();

export async function ipcSend(channel: string, data: any): Promise<any> {
  return new Promise((resolve) => {
    ipcRenderer.send(channel, data);
    ipcRenderer.once(`${channel}-response`, (_, response) => {
      resolve(response);
    });
  });
}

const route = (api: string, fn: (arg: any) => any) => {
  ipcRenderer.on(api, (event, arg) => {
    const res = fn(arg);
    event.sender.send(api + '-response', res);
  });
};

const doSend = (api: string, ...data: any): Promise<any> => {
  let promise: Promise<any>;
  const id = UUID();
  promise = new Promise((resolve) => {
    // processPool.set(api, () => promise);
    ipcRenderer.send(api, { id, arg: data });
    ipcRenderer.once(`${api}-${id}-response`, (_, response) => {
      resolve(response);
      // processPool.delete(api);
    });
  });
  return promise;
};

const send = (api: string, ...data: any): Promise<any> | null => {
  // if (processPool.has(api)) {
  //   return (processPool.get(api) as () => Promise<any>)();
  // }
  return doSend(api, ...data);
};

const init = () => {
  route(IPC_API.OPEN_PROJECT, () => {
    openProject();
  });
};

const storeLog = (log: string) => {
  send(IPC_API.LOG, log);
};

const retrieveServiceCache = async (): Promise<ServiceMementoType> => {
  return await send(IPC_API.RETRIEVE_SERVICE_CACHE);
};

const fetchDataFiles = async (
  projectPath: string,
  filePathChainArr: string[][]
) => {
  if (!projectPath) {
    return null;
  }
  return await send(IPC_API.FETCH_DATA_FILES, projectPath, filePathChainArr);
};

const saveExternalResource = async (
  projectPath: string,
  resourcePath: string
) => {
  return await send(IPC_API.SAVE_EXTERNAL_RESOURCE, projectPath, resourcePath);
};

const openProject = async () => {
  const result = dialog.showOpenDialogSync({
    title: 'Select project path',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (result) {
    await send(IPC_API.OPEN_PROJECT, result[0]);
    window.location.reload();
  }
};

export default {
  route,
  send,
  init,
  storeLog,
  fetchDataFiles,
  retrieveServiceCache,
  saveExternalResource,
  openProject,
};
