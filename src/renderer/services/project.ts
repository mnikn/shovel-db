import { computed, ref, toValue } from '@vue/reactivity';

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

const init = () => {};

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
