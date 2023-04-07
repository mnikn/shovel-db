import {
  useEffect,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import { createGlobalStore } from 'hox';
import { dialog } from '@electron/remote';
import { LANG } from '../../constants/i18n';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcRenderer } from 'electron';
import { READ_FILE, SAVE_FILE } from '../../constants/events';
import { join } from 'path';
import { ipcSend } from '../electron/ipc';
import csv from 'csvtojson';
import { parse as jsonParseCsv } from 'json2csv';
import { Event, eventEmitter } from '.';

interface ProjectSettings {
  i18n: LANG[];
}

export const [useProjectStore, getProjectStore] = createGlobalStore(() => {
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
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

  useLayoutEffect(() => {
    const cacheProjectPath = localStorage.getItem(PROJECT_ROOT_PATH);
    if (!cacheProjectPath) {
      return;
    }

    const load = async () => {
      const projectFilePath = join(cacheProjectPath, 'project.json');
      const res = await ipcSend(READ_FILE, { filePath: projectFilePath });
      // console.log('rr: ', res);
      const settingsData = JSON.parse(res);
      setProjectSettings({ i18n: settingsData.i18n });
      eventEmitter.emit(Event.UpdateExplorer, settingsData.files);

      const storyPath = join(cacheProjectPath, 'story');
      const storyFilePath = join(storyPath, 'story.json');
      const storyRes = JSON.parse(
        await ipcSend(READ_FILE, { filePath: storyFilePath })
      );
      // console.log('ewds: ', storyRes);
      eventEmitter.emit(Event.UpdateStory, storyRes.story);
      eventEmitter.emit(Event.UpdateStoryActors, storyRes.actors);
      eventEmitter.emit(Event.UpdateStoryNodeSettings, storyRes.nodeSettings);

      const storyTranslationsPath = join(storyPath, 'translations.csv');
      const storyTranslationsRes = await ipcSend(READ_FILE, {
        filePath: storyTranslationsPath,
      });
      const translations: any = {};
      if (storyTranslationsRes) {
        const str = await csv({
          output: 'csv',
        }).fromString(storyTranslationsRes);
        str.forEach((s, i) => {
          s.forEach((s2, j) => {
            if (j === 0) {
              translations[s2] = {};
            } else {
              translations[s[0]][settingsData.i18n[j - 1]] = s2;
            }
          });
        });
      }
      // console.log('dsc: ', translations);
      eventEmitter.emit(Event.UpdateStoryTranslations, translations);
    };

    load();
  }, []);

  const save = useCallback(
    async ({
      story,
      storyActors,
      storyTranslations,
      storyNodeSettings,
      files,
      staticData,
    }: any) => {
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
      }

      if (!rootPath) {
        return;
      }

      const storyPath = join(rootPath, 'story');
      const projectFilePath = join(rootPath, 'project.json');

      await ipcSend(SAVE_FILE, {
        filePath: projectFilePath,
        data: JSON.stringify({ files, ...projectSettings }, null, 2),
      });

      const storyFilePath = join(storyPath, 'story.json');
      const storeStory = {};
      Object.keys(story).forEach((key) => {
        storeStory[key] = story[key].toJson();
      });
      await ipcSend(SAVE_FILE, {
        filePath: storyFilePath,
        data: JSON.stringify(
          {
            story: storeStory,
            actors: storyActors,
            nodeSettings: storyNodeSettings,
          },
          null,
          2
        ),
      });

      const translateOptions = { fields: ['keys', ...projectSettings.i18n] };
      const translationRawData: any[] = [];
      Object.keys(storyTranslations).forEach((key) => {
        translationRawData.push({
          keys: key,
          ...storyTranslations[key],
        });
      });
      const translationData = jsonParseCsv(
        translationRawData,
        translateOptions
      );
      const storyTranslationsFilePath = join(storyPath, 'translations.csv');
      await ipcSend(SAVE_FILE, {
        filePath: storyTranslationsFilePath,
        data: translationData,
      });
    },
    [projectPath, projectSettings]
  );

  return {
    projectSettings,
    save,
  };
});
