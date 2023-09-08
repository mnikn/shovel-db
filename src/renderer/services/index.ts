import { computed } from '@vue/reactivity';
import FileService from './file';
import StaticDataService, { StaticFileData } from './static_data';
import { createLogger } from '../logger';
import shortcut from './shortcut';
import ipc from '../electron/ipc';

const logger = createLogger('service');

const serviceMemento = computed(() => {
  return {
    fileServiceMemento: FileService.memento.value,
    staticDataServiceMemento: StaticDataService.memento.value,
  };
});

type ServiceMementoType = typeof serviceMemento.value;

const initServices = async () => {
  logger.cacheLog('init services');
  const serviceCache = await ipc.retrieveServiceCache();
  if (serviceCache.fileServiceMemento !== undefined) {
    FileService.restoreMemento(serviceCache.fileServiceMemento);
  }

  shortcut.init();
  StaticDataService.init(FileService);
};

export {
  ServiceMementoType,
  serviceMemento,
  initServices,
  FileService,
  StaticDataService,
  StaticFileData,
};
