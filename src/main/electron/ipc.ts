import dayjs from 'dayjs';
import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { IPC_API } from '../../common/constants';
import { appDataCacheProjectPath, appDataLogPath } from '../constants';
import { ensureDirExists } from '../utils/file';
import csv from 'csvtojson';
import { Parser as CsvParser } from 'json2csv';

import { createLogger } from '../logger';
import crypto from 'crypto';

const logger = createLogger('ipc');

const route = (api: string, fn: (...arg: any) => any) => {
  ipcMain.on(api, (event, params) => {
    const { id, arg } = params;
    const res = fn(...arg);
    event.sender.send(api + `-${id}-response`, res);
  });
};

const routeAsync = (api: string, fn: (...arg: any) => Promise<any>) => {
  ipcMain.on(api, async (event, params) => {
    const { id, arg } = params;
    const res = await fn(...arg);
    event.sender.send(api + `-${id}-response`, res);
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

  route(IPC_API.SAVE_CURRENT_PROJECT, (projectPath: string, data: any) => {
    logger.cacheLog('save current project');
    const serviceMemento = JSON.parse(data);
    const projectServiceMemento = serviceMemento.projectServiceMemento;
    const appDataProjectCachce = {
      projectPath: projectServiceMemento.projectPath,
    };

    ensureDirExists(appDataCacheProjectPath);
    fs.writeFileSync(
      appDataCacheProjectPath,
      JSON.stringify(appDataProjectCachce, null, 2)
    );
    const projectDataPath = path.join(projectPath, 'project.json');
    const projectData = {
      langs: projectServiceMemento.langs,
    };
    ensureDirExists(projectDataPath);
    fs.writeFileSync(projectDataPath, JSON.stringify(projectData, null, 2));

    const fileServiceMemento = serviceMemento.fileServiceMemento;
    const fileDataPath = path.join(projectPath, 'files.json');
    ensureDirExists(fileDataPath);
    fs.writeFileSync(fileDataPath, JSON.stringify(fileServiceMemento, null, 2));

    // save static data
    const staticDataNeedSaveFileData =
      serviceMemento.staticDataServiceMemento.needSaveFileData;
    staticDataNeedSaveFileData.forEach((saveData: any) => {
      const targetPath =
        path.join(projectPath, ...saveData.filePathChain) + '.json';
      ensureDirExists(targetPath);
      fs.writeFileSync(targetPath, JSON.stringify(saveData.data, null, 2));
    });
    const staticDataNeedSaveFileTranslations =
      serviceMemento.staticDataServiceMemento.trasnlationMemento.translations;
    const staticTranslationPath = path.join(
      projectPath,
      'static-data',
      'translations.csv'
    );
    ensureDirExists(staticTranslationPath);
    const staticDataTranslationsData: any[] = [];
    Object.keys(staticDataNeedSaveFileTranslations).forEach((key) => {
      staticDataTranslationsData.push({
        keys: key,
        ...serviceMemento.projectServiceMemento.langs.reduce((res, lang) => {
          res[lang] = '';
          return res;
        }, {}),
        ...staticDataNeedSaveFileTranslations[key],
      });
    });
    if (staticDataTranslationsData.length > 0) {
      const staticDataTranslations = new CsvParser().parse(
        staticDataTranslationsData
      );
      fs.writeFileSync(staticTranslationPath, staticDataTranslations);
    }

    // save story
    const storyPath = path.join(projectPath, 'story');
    const storyFilePath = path.join(storyPath, 'story.json');
    ensureDirExists(storyFilePath);
    fs.writeFileSync(
      storyFilePath,
      JSON.stringify(serviceMemento.storyServiceMemento.story, null, 2)
    );
    const storyTranslationsFilePath = path.join(storyPath, 'translations.csv');
    const storyTranslationsData: any[] = [];
    const storyNeedSaveFileTranslations =
      serviceMemento.storyServiceMemento.trasnlationMemento.translations;
    Object.keys(storyNeedSaveFileTranslations).forEach((key) => {
      storyTranslationsData.push({
        keys: key,
        ...serviceMemento.projectServiceMemento.langs.reduce((res, lang) => {
          res[lang] = '';
          return res;
        }, {}),
        ...storyNeedSaveFileTranslations[key],
      });
    });
    if (storyTranslationsData.length > 0) {
      const storyTranslations = new CsvParser().parse(storyTranslationsData);
      fs.writeFileSync(storyTranslationsFilePath, storyTranslations);
    }
  });

  route(IPC_API.OPEN_PROJECT, (projectPath: string) => {
    logger.cacheLog('open project');

    if (fs.existsSync(appDataCacheProjectPath)) {
      fs.rmSync(appDataCacheProjectPath);
    }
    const appDataProjectCachce = {
      projectPath,
    };

    ensureDirExists(appDataCacheProjectPath);
    fs.writeFileSync(
      appDataCacheProjectPath,
      JSON.stringify(appDataProjectCachce, null, 2)
    );
  });

  route(IPC_API.RETRIEVE_SERVICE_CACHE, () => {
    logger.cacheLog('retrive cache');
    const cacheServiceMemento: any = {};
    if (fs.existsSync(appDataCacheProjectPath)) {
      const appDataProjectCache = JSON.parse(
        fs.readFileSync(appDataCacheProjectPath, 'utf8')
      );
      let projectMemento: any = { ...appDataProjectCache };
      if (appDataProjectCache?.projectPath) {
        const projectDataPath = fs.readFileSync(
          path.join(appDataProjectCache?.projectPath, 'project.json')
        );
        if (fs.existsSync(projectDataPath)) {
          const projectData = fs.readFileSync(projectDataPath);
          projectMemento = { ...projectMemento, ...projectData };
        }

        const fileCachePath = path.join(
          appDataProjectCache.projectPath,
          'files.json'
        );
        if (fs.existsSync(fileCachePath)) {
          const fileCache = JSON.parse(
            fs.readFileSync(
              path.join(appDataProjectCache.projectPath, 'files.json'),
              'utf8'
            )
          );
          cacheServiceMemento.fileServiceMemento = fileCache;
        }
      }
      cacheServiceMemento.projectServiceMemento = projectMemento;
    }
    return cacheServiceMemento;
  });

  route(
    IPC_API.SAVE_EXTERNAL_RESOURCE,
    (projectPath: string, resourcePath: string, type: 'mv' | 'cp' = 'mv') => {
      const extName = path.extname(resourcePath);
      const resourceStorePath = path.join(projectPath, 'resources');

      const hashBuffer = crypto
        .createHash('sha256')
        .update(fs.readFileSync(resourcePath));
      const hash = hashBuffer.digest('hex');
      const targetFileName = hash + extName;

      const targetPath = path.join(resourceStorePath, targetFileName);
      ensureDirExists(targetPath);
      if (type === 'cp') {
        fs.cpSync(resourcePath, targetPath);
      } else {
        fs.renameSync(resourcePath, targetPath);
      }

      return targetFileName;
    }
  );

  routeAsync(
    IPC_API.FETCH_DATA_FILES,
    async (projectPath: string, filePathChainArr: string[][]) => {
      const dataList: any[] = [];

      for (const filePathChain of filePathChainArr) {
        const targetPath = path.join(projectPath, ...filePathChain);
        if (fs.existsSync(targetPath)) {
          if (targetPath.endsWith('json')) {
            dataList.push(JSON.parse(fs.readFileSync(targetPath, 'utf8')));
          } else if (targetPath.endsWith('csv')) {
            const rawData = fs.readFileSync(targetPath, { encoding: 'utf8' });
            if (rawData) {
              const translationRawData = await csv({
                output: 'csv',
              }).fromString(rawData);
              dataList.push(translationRawData);
            } else {
              dataList.push(null);
            }
          } else {
            dataList.push(null);
          }
        }
      }
      return dataList;
    }
  );
};

export default {
  init,
  sendToRenderer,
};
