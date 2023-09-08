import { watch } from '@vue-reactivity/watch';
import { ComputedRef } from '@vue/reactivity';
import type { ServiceMementoType } from '.';

const serviceMementoStack: ServiceMementoType[] = [];

const init = (serviceMemento: ComputedRef<ServiceMementoType>) => {
  watch(
    () => serviceMemento.value,
    (memento) => {
      serviceMementoStack.push(memento);
    }
  );
};

const undo = () => {};

const redo = () => {};

export default {
  init,
  undo,
  redo,
};
