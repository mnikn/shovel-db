import { app } from 'electron';
import { join, dirname } from 'path';

const appPath = dirname(app.getPath('exe'));
console.log('ewe: ', appPath);

export const appDataPath = join(appPath, 'appdata');
export const appDataLogPath = join(appDataPath, 'logs');

export const appDataCachePath = join(appDataPath, 'cache');
export const appDataCacheFilePath = join(appDataCachePath, 'files.json');
export const appDataCacheProjectPath = join(appDataCachePath, 'project.json');
