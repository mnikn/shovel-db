import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { appDataLogPath } from './constants';
import { ensureDirExists } from './utils/file';

export const createLogger = (moduleName: string) => {
  const debugLog = (...args: any[]) => {
    const currentFormatTime = dayjs().format('HH:mm:ss');
    const msgPrefix = `${currentFormatTime} [main:${moduleName}]`;
    console.log(msgPrefix, ...args);
  };
  const cacheLog = (...args: any[]) => {
    const currentFormatTime = dayjs().format('HH:mm:ss');
    const msgPrefix = `${currentFormatTime} [main:${moduleName}]`;
    console.log(msgPrefix, ...args);
    const formatDay = dayjs().format('YYYY-MM-DD');
    const logFilePath = path.join(appDataLogPath, `${formatDay}.log`);
    ensureDirExists(logFilePath);
    const logMsg =
      msgPrefix +
      ' ' +
      JSON.stringify(Array.isArray(args) ? args.join('\n') : args);
    fs.appendFileSync(logFilePath, logMsg + '\n');
  };
  return {
    debugLog,
    cacheLog,
  };
};
