import { watch } from '@vue-reactivity/watch';
import { Ref } from '@vue/reactivity';
import { createGlobalStore } from 'hox';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { Storylet } from '../models/story/storylet';
import { getStoryService } from '../services';
import { Translation } from '../services/parts/translation';

export const [useStoryStore, getStoryStore] = createGlobalStore(() => {
  const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);
  const [actors, setActors] = useState<any[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [nodeSchemaSettings, setNodeSchemaSettings] = useState<
    typeof storyService.nodeSchemaSettings.value
  >({
    root: {
      basicDataSchema: '',
      extraDataSchema: '',
    },
    sentence: {
      basicDataSchema: '',
      extraDataSchema: '',
    },
    branch: {
      basicDataSchema: '',
      extraDataSchema: '',
    },
    action: {
      basicDataSchema: '',
      extraDataSchema: '',
    },
  });
  const [actorSchemaSettings, setActorSchemaSettings] =
    useState<typeof storyService.actorSchemaSettings.value>('');

  const [currentLang, setCurrentLang] = useState<string>('zh-cn');
  const [translations, setTranslations] = useState<Translation>({});
  const storyService = getStoryService();

  useEffect(() => {
    const watchRef = (ref: Ref, setFn: (val: any) => void) => {
      return watch(
        () => ref.value,
        (data) => {
          setFn(cloneDeep(data));
        },
        {
          immediate: true,
        }
      );
    };

    const stopWatchFileData = watchRef(
      storyService.currentStorylet,
      setCurrentStorylet
    );
    const stopWatchSelection = watchRef(storyService.selection, setSelection);
    const stopWatchActors = watchRef(storyService.actors, setActors);
    const stopWatchNodeSchemaSettings = watchRef(
      storyService.nodeSchemaSettings,
      setNodeSchemaSettings
    );
    const stopWatchActorSchemaSettings = watchRef(
      storyService.actorSchemaSettings,
      setActorSchemaSettings
    );
    const stopWatchCurrentLang = watchRef(
      storyService.currentLang,
      setCurrentLang
    );
    const stopWatchTranslations = watchRef(
      storyService.translations,
      setTranslations
    );
    return () => {
      stopWatchFileData();
      stopWatchActors();
      stopWatchSelection();
      stopWatchNodeSchemaSettings();
      stopWatchActorSchemaSettings();
      stopWatchCurrentLang();
      stopWatchTranslations();
    };
  }, []);

  const selectNode = storyService.selectNode;
  const insertChildNode = storyService.insertChildNode;
  const batchInsertChildNode = storyService.batchInsertChildNode;
  const insertSiblingNode = storyService.insertSiblingNode;
  const updateNode = storyService.updateNode;
  const deleteNode = storyService.deleteNode;
  const moveSelection = storyService.moveSelection;
  const moveStoryletNode = storyService.moveStoryletNode;

  const tr = storyService.tr;
  const switchLang = storyService.switchLang;
  const updateTranslations = storyService.updateTranslations;
  const updateActors = storyService.updateActors;

  const updateNodeSchemaSettings = storyService.updateNodeSchemaSettings;
  const updateActorSchemaSettings = storyService.updateActorSchemaSettings;

  const updateTranslateKey = storyService.updateTranslateKey;
  const updateTranslateKeyAll = storyService.updateTranslateKeyAll;
  const getTranslationsForKey = storyService.getTranslationsForKey;

  return {
    currentStorylet,
    selection,
    actors,
    nodeSchemaSettings,
    updateNodeSchemaSettings,
    updateActorSchemaSettings,
    actorSchemaSettings,
    updateActors,

    selectNode,
    insertChildNode,
    batchInsertChildNode,
    insertSiblingNode,
    updateNode,
    deleteNode,
    moveSelection,
    moveStoryletNode,
    tr,
    currentLang,
    switchLang,
    translations,
    updateTranslations,
    updateTranslateKey,
    updateTranslateKeyAll,
    getTranslationsForKey,
  };
});
export type StoryStoreType = ReturnType<typeof getStoryStore>;
