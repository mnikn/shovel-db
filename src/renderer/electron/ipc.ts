import { toValue } from '@vue/reactivity';
import { ipcRenderer } from 'electron';
import { IPC_API } from '../../common/constants';
import { EVENT, eventEmitter } from '../events';
import { createLogger } from '../logger';
import { serviceMemento, ServiceMementoType } from '../services';

const logger = createLogger('ipc');

const processPool: Set<string> = new Set();

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

const doSend = (api: string, data?: any): Promise<any> => {
  return new Promise((resolve) => {
    processPool.add(api);
    ipcRenderer.send(api, data);
    ipcRenderer.once(`${api}-response`, (_, response) => {
      resolve(response);
      processPool.delete(api);
    });
  });
};

const send = (api: string, data?: any): Promise<any> | null => {
  if (processPool.has(api)) {
    return null;
  }
  return doSend(api, data);
};

const init = () => {
  // route(IPC_API.SYNC_SERVICE_MEMENTO, (memento: string) => {
  //   restoreServiceMemento(JSON.parse(memento));
  // });
};

const storeLog = (log: string) => {
  send(IPC_API.LOG, log);
};

const retrieveServiceCache = async (): Promise<ServiceMementoType> => {
  return await send(IPC_API.RETRIEVE_SERVICE_CACHE);
};

const saveProject = async () => {
  const startSaveProject = send(
    IPC_API.SAVE_CURRENT_PROJECT,
    JSON.stringify(toValue(serviceMemento))
  );
  if (startSaveProject) {
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_START);
    await startSaveProject;
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_FINISHED);
  }
};

const fetchDataFiles = async (filePathChainArr: string[][]) => {
  return await send(IPC_API.FETCH_DATA_FILES, filePathChainArr);
};

export default {
  init,
  storeLog,
  saveProject,
  fetchDataFiles,
  retrieveServiceCache,
};
