import { watch } from '@vue-reactivity/watch';
import { ComputedRef } from '@vue/reactivity';
import { ServiceMemento } from '.';

const serviceMementoStack: ServiceMemento[] = [];

const init = (serviceMemento: ComputedRef<ServiceMemento>) => {
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
