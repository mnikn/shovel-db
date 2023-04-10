import { dialog } from '@electron/remote';
import csv from 'csvtojson';
import { ipcRenderer } from 'electron';
import { createGlobalStore } from 'hox';
import { parse as jsonParseCsv } from 'json2csv';
import { join } from 'path';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  OPEN_PROJECT,
  READ_FILE,
  RENAME_FILE,
  SAVE_FILE,
} from '../../constants/events';
import { LANG } from '../../constants/i18n';
import { PROJECT_ROOT_PATH } from '../../constants/storage';
import { ipcSend } from '../electron/ipc';
import { Event, eventEmitter } from '../events';
import { getRootParent } from '../models/explorer';

interface ProjectSettings {
  i18n: LANG[];
}

export const [useProjectStore, getProjectStore] = createGlobalStore(() => {
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    i18n: [LANG.ZH_CN, LANG.EN],
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
      const settingsData = JSON.parse(res);
      setProjectSettings({ i18n: settingsData.i18n });
      eventEmitter.emit(Event.UpdateExplorer, settingsData.files);
      eventEmitter.emit(
        Event.UpdateRecentOpenFiles,
        settingsData.recentOpenFiles
      );

      const storyPath = join(cacheProjectPath, 'story');
      const storyFilePath = join(storyPath, 'story.json');
      const storyRes = JSON.parse(
        await ipcSend(READ_FILE, { filePath: storyFilePath })
      );
      eventEmitter.emit(Event.UpdateStory, storyRes.story);
      eventEmitter.emit(Event.UpdateStoryFiles, storyRes.files);
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
      eventEmitter.emit(Event.UpdateStoryTranslations, translations);

      const staticDataPath = join(cacheProjectPath, 'static-data');
      const staticDataFilePath = join(staticDataPath, 'static-data.json');
      const staticRawData = JSON.parse(
        await ipcSend(READ_FILE, { filePath: staticDataFilePath })
      );
      eventEmitter.emit(
        Event.UpdateStaticDataAllSchema,
        staticRawData.schemaConfigs
      );
      const staticDataTranslationsPath = join(
        staticDataPath,
        'translations.csv'
      );
      const staticDataTranslationsRes = await ipcSend(READ_FILE, {
        filePath: staticDataTranslationsPath,
      });
      const staticDataTranslations: any = {};
      if (staticDataTranslationsRes) {
        const str = await csv({
          output: 'csv',
        }).fromString(staticDataTranslationsRes);
        str.forEach((s, i) => {
          s.forEach((s2, j) => {
            if (j === 0) {
              staticDataTranslations[s2] = {};
            } else {
              staticDataTranslations[s[0]][settingsData.i18n[j - 1]] = s2;
            }
          });
        });
      }
      eventEmitter.emit(
        Event.UpdateStaticDataTranslations,
        staticDataTranslations
      );

      setTimeout(() => {
        const lastRecentOpenFile =
          settingsData.recentOpenFiles[settingsData.recentOpenFiles.length - 1];
        if (lastRecentOpenFile) {
          eventEmitter.emit(Event.OpenFile, lastRecentOpenFile);
        }
      }, 0);
    };

    setTimeout(() => {
      load();
    }, 0);
  }, []);

  const save = useCallback(
    async ({
      story,
      storyActors,
      storyTranslations,
      storyNodeSettings,
      recentOpenFiles,
      files,
      staticDataSchemaConfigs,
      staticDataTranslations,
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
      const staticDataPath = join(rootPath, 'static-data');
      const projectFilePath = join(rootPath, 'project.json');

      await ipcSend(SAVE_FILE, {
        filePath: projectFilePath,
        data: JSON.stringify(
          { files, recentOpenFiles, ...projectSettings },
          null,
          2
        ),
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
            files: files.filter(
              (item) => getRootParent(item.id, files).id === 'story'
            ),
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

      const staticDataFilePath = join(staticDataPath, 'static-data.json');
      const storeStaticData = {
        schemaConfigs: staticDataSchemaConfigs,
      };
      await ipcSend(SAVE_FILE, {
        filePath: staticDataFilePath,
        data: JSON.stringify(storeStaticData, null, 2),
      });
      const staticDatatranslationRawData: any[] = [];
      Object.keys(staticDataTranslations).forEach((key) => {
        staticDatatranslationRawData.push({
          keys: key,
          ...staticDataTranslations[key],
        });
      });
      const staticDataTranslationData = jsonParseCsv(
        staticDatatranslationRawData,
        translateOptions
      );
      const staticDataTranslationsFilePath = join(
        staticDataPath,
        'translations.csv'
      );
      await ipcSend(SAVE_FILE, {
        filePath: staticDataTranslationsFilePath,
        data: staticDataTranslationData,
      });
    },
    [projectPath, projectSettings]
  );

  useEffect(() => {
    const openProject = () => {
      const result = dialog.showOpenDialogSync({
        title: 'Select project path',
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result) {
        setProjectPath(result[0]);
        localStorage.setItem(PROJECT_ROOT_PATH, result[0]);
        window.location.reload();
      }
    };
    ipcRenderer.on(OPEN_PROJECT, openProject);
    return () => {
      ipcRenderer.off(OPEN_PROJECT, openProject);
    };
  }, []);

  useEffect(() => {
    const updateStaticDataFile = async (filePath: string, data = []) => {
      if (!projectPath) {
        return;
      }
      const staticDataPath = join(projectPath, 'static-data');
      const fullPath = join(staticDataPath, filePath);
      await ipcSend(SAVE_FILE, {
        filePath: fullPath,
        data: JSON.stringify(data, null, 2),
      });
    };
    const renameFile = async (originFilePath: string, newFilePath: string) => {
      if (!projectPath) {
        return;
      }
      const staticDataPath = join(projectPath, 'static-data');
      const oldFullPath = join(staticDataPath, originFilePath);
      const newFullPath = join(staticDataPath, newFilePath);
      console.log('fddf:', oldFullPath, ' ', newFullPath);
      await ipcSend(RENAME_FILE, {
        oldFilePath: oldFullPath,
        newFilePath: newFullPath,
      });
    };
    eventEmitter.on(Event.UpdateStaticDataFile, updateStaticDataFile);
    eventEmitter.on(Event.RenameStaticDataFile, renameFile);
    return () => {
      eventEmitter.off(Event.UpdateStaticDataFile, updateStaticDataFile);
      eventEmitter.off(Event.RenameStaticDataFile, renameFile);
    };
  }, [projectPath]);

  return {
    projectSettings,
    save,
  };
});
