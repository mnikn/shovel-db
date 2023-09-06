import { app } from 'electron';
import { join } from 'path';

export const appDataPath = join(app.getAppPath(), 'appdata');
export const appDataLogPath = join(appDataPath, 'logs');

export const appDataCachePath = join(appDataPath, 'cache');
export const appDataCacheFilePath = join(appDataCachePath, 'files.json');
