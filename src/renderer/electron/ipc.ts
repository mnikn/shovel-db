import { ipcRenderer } from 'electron';
import { IPC_API } from '../../common/constants';
import { restoreServiceMemento, ServiceMemento } from '../../common/services';
import { EVENT, eventEmitter } from '../events';
import { createLogger } from '../logger';

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
  route(IPC_API.SYNC_SERVICE_MEMENTO, (memento: string) => {
    restoreServiceMemento(JSON.parse(memento));
  });
};

const fetchServiceMemento = async () => {
  logger.cacheLog('fetch service memento from main');
  const memento = send(IPC_API.FETCH_SERVICE_MEMENTO);
  if (!memento) {
    return;
  }
  restoreServiceMemento(JSON.parse(await memento));
};

const syncServiceMemento = (memento: ServiceMemento) => {
  send(IPC_API.SYNC_SERVICE_MEMENTO, JSON.stringify(memento));
};

const storeLog = (log: string) => {
  send(IPC_API.LOG, log);
};

const saveProject = async () => {
  const startSaveProject = send(IPC_API.SAVE_CURRENT_PROJECT);
  if (startSaveProject) {
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_START);
    await startSaveProject;
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_FINISHED);
  }
};

export default {
  init,
  fetchServiceMemento,
  syncServiceMemento,
  storeLog,
  saveProject,
};
