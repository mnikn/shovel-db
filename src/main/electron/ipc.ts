import dayjs from 'dayjs';
import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { IPC_API } from '../../common/constants';
import {
  appDataCacheFilePath,
  appDataLogPath,
  appDataPath,
} from '../constants';
import { ensureDirExists } from '../utils/file';

import { createLogger } from '../logger';

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
  route(IPC_API.LOG, (log: string) => {
    const formatDay = dayjs().format('YYYY-MM-DD');
    const logFilePath = path.join(appDataLogPath, `${formatDay}.log`);
    ensureDirExists(logFilePath);
    fs.appendFileSync(logFilePath, log + '\n');
  });

  route(IPC_API.SAVE_CURRENT_PROJECT, (data: any) => {
    logger.cacheLog('save current project');
    const serviceMemento = JSON.parse(data);
    const fileServiceMemento = serviceMemento.fileServiceMemento;
    ensureDirExists(appDataCacheFilePath);
    fs.writeFileSync(
      appDataCacheFilePath,
      JSON.stringify(fileServiceMemento, null, 2)
    );

    const projectPath = appDataPath;
    const staticDataNeedSaveFileData =
      serviceMemento.staticDataServiceMemento.needSaveFileData;
    staticDataNeedSaveFileData.forEach((saveData: any) => {
      const targetPath =
        path.join(projectPath, ...saveData.filePathChain) + '.json';
      ensureDirExists(targetPath);
      fs.writeFileSync(targetPath, JSON.stringify(saveData.data, null, 2));
    });
  });

  route(IPC_API.RETRIEVE_SERVICE_CACHE, () => {
    logger.cacheLog('retrive cache');
    const cacheServiceMemento: any = {};
    if (fs.existsSync(appDataCacheFilePath)) {
      const fileCache = JSON.parse(
        fs.readFileSync(appDataCacheFilePath, 'utf8')
      );
      cacheServiceMemento.fileServiceMemento = fileCache;
    }
    return cacheServiceMemento;
  });

  route(IPC_API.FETCH_DATA_FILES, (filePathChainArr: string[][]) => {
    const projectPath = appDataPath;

    return filePathChainArr.map((filePathChain) => {
      const targetPath = path.join(projectPath, ...filePathChain) + '.json';
      if (fs.existsSync(targetPath)) {
        return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      }
      return null;
    });
  });
};

export default {
  init,
  sendToRenderer,
};
