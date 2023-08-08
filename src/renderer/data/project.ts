import { pluckFirst, useObservable, useSubscription } from 'observable-hooks';
import { join } from 'path';
import { useCallback, useEffect, useState } from 'react';
import { map, take } from 'rxjs';
import {
  HAS_FILE,
  READ_FILE,
  SAVE_FILE,
  WRITE_FILE,
} from '../../constants/events';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcSend } from '../electron/ipc';
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
  const $projectPathReady = useObservable(
    ($inputs) => {
      return $inputs.pipe(
        take(1),
        map(([val]) => {
          return val;
        })
      );
    },
    [projectPath]
  );

  const $projectPathChange = useObservable(pluckFirst, [projectPath]);
  useSubscription($projectPathChange, (val) => {
    if (!val) {
      return;
    }
    localStorage.setItem(PROJECT_ROOT_PATH, val);
  });

  useSubscription($projectPathReady, async (_projectPath) => {
    const projectConfigPath = join(_projectPath || '', 'project.json');
    if (
      !_projectPath ||
      !(await ipcSend(HAS_FILE, {
        filePath: projectConfigPath,
      }))
    ) {
      return;
    }

    const res = await ipcSend(READ_FILE, {
      filePath: projectConfigPath,
      json: true,
    });
    setProjectSettings({
      i18n: res.i18n,
    });
  });

  const save = async () => {
    if (!projectPath) {
      return;
    }
    const projectConfigPath = join(projectPath, 'project.json');
    console.log('crr: ', projectConfigPath);
    await ipcSend(WRITE_FILE, {
      filePath: projectConfigPath,
      data: projectSettings,
    });
  };

  return {
    projectSettings,
    projectPath,
    save,
  };
}
