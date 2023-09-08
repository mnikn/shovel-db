import { computed } from '@vue/reactivity';
import ProjectService, { ProjectServiceType } from './project';
import FileService, { FileServiceType } from './file';
import StaticDataService, { StaticFileData } from './static_data';
import { createLogger } from '../logger';
import shortcut from './shortcut';
import ipc from '../electron/ipc';

const logger = createLogger('service');

const serviceMemento = computed(() => {
  return {
    projectServiceMemento: ProjectService.memento.value,
    fileServiceMemento: FileService.memento.value,
    staticDataServiceMemento: StaticDataService.memento.value,
  };
});

type ServiceMementoType = typeof serviceMemento.value;

const initServices = async () => {
  logger.cacheLog('init services');
  const serviceCache = await ipc.retrieveServiceCache();
  if (serviceCache.projectServiceMemento !== undefined) {
    ProjectService.restoreMemento(serviceCache.projectServiceMemento);
  }
  if (serviceCache.fileServiceMemento !== undefined) {
    FileService.restoreMemento(serviceCache.fileServiceMemento);
  }

  shortcut.init();
  StaticDataService.init(FileService, ProjectService);
};

export {
  ServiceMementoType,
  serviceMemento,
  initServices,
  ProjectService,
  ProjectServiceType,
  FileService,
  FileServiceType,
  StaticDataService,
  StaticFileData,
};
