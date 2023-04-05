import { useEffect, useCallback, useState, useRef } from 'react';
import { createGlobalStore } from 'hox';
import { dialog } from '@electron/remote';
import { LANG } from '../../constants/i18n';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcRenderer } from 'electron';
import { SAVE_STORY_FILE } from '../../constants/events';
import { join } from 'path';

interface ProjectSettings {
  i18n: LANG[];
}

export const [useProjectStore, getProjectStore] = createGlobalStore(() => {
  const [projectSettings, setProjectSetttings] = useState<ProjectSettings>({
    i18n: [LANG.EN, LANG.ZH_CN],
  });
  const [projectPath, setProjectPath] = useState<string | null>(
    localStorage.getItem(PROJECT_ROOT_PATH) || null
  );

  useEffect(() => {
    if (projectPath) {
      localStorage.setItem(PROJECT_ROOT_PATH, projectPath);
    }
  }, [projectPath]);

  const save = useCallback(
    (story, staticData) => {
      let rootPath = projectPath;
      if (!projectPath) {
        // show a dialog box to choose the file location and name
        const result = dialog.showOpenDialogSync({
          title: 'Select project path',
          properties: ['openDirectory', 'createDirectory'],
        });

        if (result) {
          setProjectPath(result[0]);
          rootPath = result[0];
        }
        console.log('asdas: ', result);
      }

      console.log('story: ', story);

      if (!rootPath) {
        return;
      }

      const storyPath = join(rootPath, 'story');
      const filePath = join(storyPath, 'story.json');
      // const filePath = rootPath + '\\story\\story.json';
      ipcRenderer.send(SAVE_STORY_FILE, {
        filePath,
        data: JSON.stringify(story, null, 2),
      });
    },
    [projectPath]
  );

  return {
    projectSettings,
    save,
  };
});
