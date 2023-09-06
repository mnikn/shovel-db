import { watch } from '@vue-reactivity/watch';
import fs from 'fs';
import {
  initServices,
  restoreServiceMemento,
  serviceMemento,
  ServiceMemento,
} from '../../common/services';
import { appDataCacheFilePath } from '../constants';
import { createLogger } from '../logger';
import { ensureDirExists } from '../utils/file';

const logger = createLogger('services');

const init = () => {
  logger.cacheLog('init services');
  initServices();
  retriveCache();

  watch(
    () => serviceMemento.value,
    (memento) => {
      logger.cacheLog('service memento changed');
      restoreServiceMemento(memento);
      // ipc.sendToRenderer(
      //   IPC_API.SYNC_SERVICE_MEMENTO,
      //   JSON.stringify(toValue(memento))
      // );
    }
  );
};

const retriveCache = () => {
  logger.cacheLog('retrive cache to service memento');
  const cacheServiceMemento: Partial<ServiceMemento> = {};
  if (ensureDirExists(appDataCacheFilePath)) {
    const fileCache = JSON.parse(fs.readFileSync(appDataCacheFilePath, 'utf8'));
    cacheServiceMemento.fileServiceMemento = fileCache;
  }
  restoreServiceMemento(cacheServiceMemento);
};

export default {
  init,
  retriveCache,
};
