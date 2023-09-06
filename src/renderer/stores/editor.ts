import { useEffect, useState } from 'react';
import { EVENT, eventEmitter } from '../events';

const useEditor = () => {
  const [saving, setSaving] = useState(false);

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
    saving,
  };
};

export default useEditor;
