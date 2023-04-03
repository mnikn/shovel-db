import { createGlobalStore } from 'hox';
import { useState } from 'react';

export enum Mode {
  Normal = 'normal',
  Popup = 'popup',
}

export const [useEditorStore, getEditorStore] = createGlobalStore(() => {
  const [mode, setMode] = useState<Mode>(Mode.Normal);

  return {
    mode,
    setMode,
  };
});
