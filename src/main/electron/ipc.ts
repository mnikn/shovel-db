import dayjs from 'dayjs';
import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import { cloneDeep } from 'lodash';
import path from 'path';
import { IPC_API } from '../../common/constants';
import {
  FileService,
  restoreServiceMemento,
  serviceMemento,
  ServiceMemento,
} from '../../common/services';
import { appDataCacheFilePath, appDataLogPath } from '../constants';
import { ensureDirExists } from '../utils/file';

import { createLogger } from '../logger';
import { toValue } from '@vue/reactivity';

const logger = createLogger('ipc');

const route = (api: string, fn: (arg: any) => any) => {
  ipcMain.on(api, (event, arg) => {
    const res = fn(arg);
    event.sender.send(api + '-response', res);
  });
};

const sendToRenderer = async (api: string, data: any): Promise<any> => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(api, data);
  });
};

const init = () => {
  // route methods
  route(IPC_API.SYNC_SERVICE_MEMENTO, (memento: string) => {
    logger.cacheLog('sync service memento from renderer');
    restoreServiceMemento(JSON.parse(memento));
  });

  route(IPC_API.FETCH_SERVICE_MEMENTO, () => {
    return JSON.stringify(toValue(serviceMemento));
  });

  route(IPC_API.SAVE_CURRENT_PROJECT, () => {
    const fileServiceMemento = serviceMemento.value.fileServiceMemento;
    logger.cacheLog('save current project');
    ensureDirExists(appDataCacheFilePath);
    fs.writeFileSync(
      appDataCacheFilePath,
      JSON.stringify(fileServiceMemento, null, 2)
    );
  });

  route(IPC_API.LOG, (log: string) => {
    const formatDay = dayjs().format('YYYY-MM-DD');
    const logFilePath = path.join(appDataLogPath, `${formatDay}.log`);
    ensureDirExists(logFilePath);
    fs.appendFileSync(logFilePath, log + '\n');
  });
};

export default {
  init,
  sendToRenderer,
};
