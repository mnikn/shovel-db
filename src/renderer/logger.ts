import dayjs from 'dayjs';
import ipc from './electron/ipc';

const createLogger = (moduleName: string) => {
  const debugLog = (...args: any[]) => {
    const currentFormatTime = dayjs().format('HH:mm:ss');
    const msgPrefix = `${currentFormatTime} [renderer:${moduleName}]`;
    console.log(msgPrefix, ...args);
  };

  const cacheLog = (...args: any[]) => {
    const currentFormatTime = dayjs().format('HH:mm:ss');
    const msgPrefix = `${currentFormatTime} [renderer:${moduleName}]`;
    console.log(msgPrefix, ...args);
    const logMsg =
      msgPrefix +
      ' ' +
      JSON.stringify(Array.isArray(args) ? args.join(' ') : args);
    ipc.storeLog(logMsg);
  };
  return {
    debugLog,
    cacheLog,
  };
};

export { createLogger };
