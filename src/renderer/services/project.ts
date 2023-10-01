// import { dialog } from '@electron/remote';
import { computed, ref, toValue } from '@vue/reactivity';
// import { IPC_API } from '../../common/constants';
// import ipc from '../electron/ipc';

let langs = ref<string[]>(['zh-cn', 'en-us']);
let projectPath = ref<string | null>(null);

const memento = computed(() => {
  return {
    langs: toValue(langs),
    projectPath: toValue(projectPath),
  };
});
type ProjectServiceMemento = typeof memento.value;

const restoreMemento = (newMemento: Partial<ProjectServiceMemento>) => {
  if (newMemento.langs !== undefined) {
    langs.value = newMemento.langs;
  }
  if (newMemento.projectPath !== undefined) {
    projectPath.value = newMemento.projectPath;
  }
};

const updateProjectPath = (path: string) => {
  projectPath.value = path;
};

const init = () => {
  //   ipc.route(IPC_API.OPEN_PROJECT, () => {
  //      return ipc.openProject()
  //   const result = dialog.showOpenDialogSync({
  //     title: 'Select project path',
  //     properties: ['openDirectory', 'createDirectory'],
  //   });
  //   console.log('ew: ', result);
  //   if (result) {
  //     updateProjectPath(result[0]);
  //     setTimeout(() => {
  //       window.location.reload();
  //     }, 500);
  //   }
  // });
};

const ProjectService = {
  init,
  memento,
  restoreMemento,
  langs,
  projectPath,
  updateProjectPath,
};
export type ProjectServiceType = typeof ProjectService;
export default ProjectService;
