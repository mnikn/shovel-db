import { computed, toValue } from '@vue/reactivity';
import ProjectService, { ProjectServiceType } from './project';
import FileService, { FileServiceType } from './file';
import StaticDataService, {
  StaticDataServiceType,
  StaticFileData,
} from './static_data';
// import { createLogger } from '../logger';
import { createLogger } from '../logger';
import shortcut from './shortcut';
import ipc from '../electron/ipc';
import { dialog } from '@electron/remote';
import { IPC_API } from '../../common/constants';
import { EVENT, eventEmitter } from '../events';

const logger = createLogger('service');

type ServiceMementoType = typeof serviceMemento.value;

let staticDataService: StaticDataServiceType;
let projectService: ProjectServiceType;
let fileService: FileServiceType;
const initServices = async () => {
  logger.cacheLog('init services');

  projectService = ProjectService;
  projectService.init();

  fileService = FileService;

  staticDataService = StaticDataService(fileService, projectService);
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

const getFileService = () => {
  return fileService;
};

const getProjectService = () => {
  return projectService;
};

const saveProject = async () => {
  if (!projectService.projectPath.value) {
    const targetPath = dialog.showOpenDialogSync({
      title: 'Select project path',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (!targetPath) {
      return;
    }
    projectService.updateProjectPath(targetPath[0]);
  }
  const startSaveProject = ipc.send(
    IPC_API.SAVE_CURRENT_PROJECT,
    toValue(projectService.projectPath),
    JSON.stringify(toValue(serviceMemento))
  );
  if (startSaveProject) {
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_START);
    await startSaveProject;
    eventEmitter.emit(EVENT.ON_SAVE_PROJECT_FINISHED);
  }
};

export {
  ServiceMementoType,
  serviceMemento,
  initServices,
  ProjectServiceType,
  FileServiceType,
  getStaticDataService,
  getFileService,
  getProjectService,
  StaticFileData,
  saveProject,
};
