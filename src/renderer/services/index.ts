import { isEqual, cloneDeep } from 'lodash';
import { watch } from '@vue-reactivity/watch';
import {
  FileService,
  serviceMemento,
  initServices,
} from '../../common/services';
import ipc from '../electron/ipc';
import { createLogger } from '../logger';
import shortcut from './shortcut';
import { toValue } from '@vue/reactivity';

const logger = createLogger('service');

const init = () => {
  initServices();
  shortcut.init();

  watch(
    () => serviceMemento.value,
    (memento) => {
      logger.debugLog('service memento changed', memento);
      if (!isEqual(FileService.memento.value, memento.fileServiceMemento)) {
        FileService.restoreMemento(memento.fileServiceMemento);
      }
      ipc.syncServiceMemento(toValue(memento));
    }
  );
};

export default {
  init,
};
