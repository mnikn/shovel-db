import { computed } from '@vue/reactivity';
import ProjectService, { ProjectServiceType } from './project';
import FileService, { FileServiceType } from './file';
import StaticDataService, {
  StaticDataServiceType,
  StaticFileData,
} from './static_data';
import { createLogger } from '../logger';
import shortcut from './shortcut';
import ipc from '../electron/ipc';

const logger = createLogger('service');

type ServiceMementoType = typeof serviceMemento.value;

let staticDataService: StaticDataServiceType;
const initServices = async () => {
  logger.cacheLog('init services');

  staticDataService = StaticDataService(FileService, ProjectService);
  const serviceCache = await ipc.retrieveServiceCache();
  if (serviceCache.projectServiceMemento !== undefined) {
    ProjectService.restoreMemento(serviceCache.projectServiceMemento);
  }
  if (serviceCache.fileServiceMemento !== undefined) {
    FileService.restoreMemento(serviceCache.fileServiceMemento);
  }

  shortcut.init();
};
const serviceMemento = computed(() => {
  return {
    projectServiceMemento: ProjectService.memento.value,
    fileServiceMemento: FileService.memento.value,
    staticDataServiceMemento: staticDataService.memento.value,
  };
});

const getStaticDataService = () => {
  return staticDataService;
};

export {
  ServiceMementoType,
  serviceMemento,
  initServices,
  ProjectService,
  ProjectServiceType,
  FileService,
  FileServiceType,
  getStaticDataService,
  StaticFileData,
};
