import { computed } from '@vue/reactivity';
import FileService, { FileServiceMemento } from './file';
import BackTrackService from './backtrack';

export type ServiceMemento = {
  fileServiceMemento: FileServiceMemento;
};

const serviceMemento = computed((): ServiceMemento => {
  return {
    fileServiceMemento: FileService.memento.value,
  };
});

const restoreServiceMemento = (memento: Partial<ServiceMemento>) => {
  if (memento.fileServiceMemento) {
    FileService.restoreMemento(memento.fileServiceMemento);
  }
};

const initServices = () => {
  BackTrackService.init(serviceMemento);
};

export { initServices, serviceMemento, restoreServiceMemento, FileService };
