import { createGlobalStore } from 'hox';
import { useEffect, useMemo, useState } from 'react';
import { EDITOR_PATTERN, FILE_GROUP } from '../../common/constants';
import { EVENT, eventEmitter } from '../events';
import { useFileStore } from './file';

export const [useEditorStore, getEditorStore] = createGlobalStore(() => {
  const [saving, setSaving] = useState(false);

  const [hasModal, setHasModal] = useState(false);

  const { currentOpenFile, getFileRootParent } = useFileStore();

  const editorPattern = useMemo(() => {
    if (!currentOpenFile) {
      return EDITOR_PATTERN.STATIC_DATA;
    }
    const rootParent = getFileRootParent(currentOpenFile);
    if (rootParent?.id === FILE_GROUP.STATIC_DATA) {
      return EDITOR_PATTERN.STATIC_DATA;
    }
    if (rootParent?.id === FILE_GROUP.STORY) {
      return EDITOR_PATTERN.STORY;
    }
    return EDITOR_PATTERN.STATIC_DATA;
  }, [currentOpenFile, getFileRootParent]);

  useEffect(() => {
    const onSaveStart = () => {
      setSaving(true);
    };
    const onSaveFinished = () => {
      setTimeout(() => {
        setSaving(false);
      }, 500);
    };
    eventEmitter.on(EVENT.ON_SAVE_PROJECT_START, onSaveStart);
    eventEmitter.on(EVENT.ON_SAVE_PROJECT_FINISHED, onSaveFinished);
    return () => {
      eventEmitter.off(EVENT.ON_SAVE_PROJECT_START, onSaveStart);
      eventEmitter.off(EVENT.ON_SAVE_PROJECT_FINISHED, onSaveFinished);
    };
  }, []);

  return {
    editorPattern,
    saving,
    hasModal,
    setHasModal,
  };
});
export type EditorStoreType = ReturnType<typeof getEditorStore>;
