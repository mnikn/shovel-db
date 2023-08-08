import { pluckFirst, useObservable, useSubscription } from 'observable-hooks';
import { useState } from 'react';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { PRESET_LANGS } from './common/translation';

export type Lang = string;

type ProjectSettings = {
  i18n: Lang[];
};

export default function useProject() {
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    i18n: PRESET_LANGS,
  });
  const [projectPath, setProjectPath] = useState<string | null>(
    localStorage.getItem(PROJECT_ROOT_PATH) || null
  );

  const $projectPathChange = useObservable(pluckFirst, [projectPath]);
  useSubscription($projectPathChange, (val) => {
    if (!val) {
      return;
    }
    localStorage.setItem(PROJECT_ROOT_PATH, val);
  });

  return {
    projectSettings,
    projectPath,
  };
}
