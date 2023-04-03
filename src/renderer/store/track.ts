import { createGlobalStore } from 'hox';
import { useCallback, useRef, useState } from 'react';
import { set, cloneDeep } from 'lodash';
import { RawJson } from '../../type';

export function trackState(prop: string, val: any) {
  const store = getTrackStore();
  if (!store) {
    return;
  }

  store.trackState(prop, val);
}

export const [useTrackStore, getTrackStore] = createGlobalStore(() => {
  const [stateStack, setStateStack] = useState<RawJson[]>([
    {
      story: { currentStorylet: null, translations: {}, currentLang: 'en' },
      explorer: { files: [] },
      project: {},
    },
  ]);

  const storeSetterRef = useRef<{ [key: string]: Function }>({});

  const registerStoreSetter = useCallback((store: string, setter: Function) => {
    storeSetterRef.current[store] = setter;
  }, []);
  const currentStateIndexRef = useRef(0);

  const trackState = useCallback((state: string, val: any) => {
    setStateStack((prev) => {
      const prevItem = prev[currentStateIndexRef.current];
      let newItem = cloneDeep(prevItem);
      set(newItem, state, val);
      currentStateIndexRef.current += 1;
      return prev.concat(newItem);
    });
  }, []);

  const undo = useCallback(() => {
    if (currentStateIndexRef.current <= 1) {
      return;
    }
    currentStateIndexRef.current -= 1;
    const prevState = stateStack[currentStateIndexRef.current];
    Object.keys(prevState).forEach((store) => {
      if (store in storeSetterRef.current) {
        storeSetterRef.current[store](prevState[store]);
      }
    });
  }, [stateStack]);

  const redo = useCallback(() => {
    if (currentStateIndexRef.current >= stateStack.length - 1) {
      return;
    }
    currentStateIndexRef.current = currentStateIndexRef.current + 1;
    const nextState = stateStack[currentStateIndexRef.current];
    Object.keys(nextState).forEach((store) => {
      if (store in storeSetterRef.current) {
        storeSetterRef.current[store](nextState[store]);
      }
    });
  }, [stateStack]);

  return { trackState, registerStoreSetter, undo, redo };
});
