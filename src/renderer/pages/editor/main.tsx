import { Box } from '@mui/material';
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import {
  useExplorerStore,
  useStaticDataStore,
  useStoryStore,
} from '../../store';
import StaticData from './patterns/static_data';
import Story from './patterns/story';
import { ipcRenderer } from 'electron';
import {
  SHOW_PROJET_SETTINGS,
  SHOW_ARTICLE_SUMMARY,
  REMOVE_UESLESS_TRANSLATIONS,
} from '../../../constants/events';
import ProjectSettings from './components/project_settings';
import { Mode, useEditorStore } from '../../store/editor';
import { getRootParent } from '../../models/explorer';
import { Event, eventEmitter } from '../../events';
import { processValueWithSchema, SchemaFieldString } from '../../models/schema';
import ArticelPanel from './components/article_panel';
import { EditorContext } from './context';

export default function Main({ children }: { children?: any }) {
  const {
    translations: storyTranslations,
    story,
    getNodeSchema,
    setTranslations: setStoryTranslations,
  } = useStoryStore();
  const { currentOpenFile, files } = useContext(EditorContext);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [articleSummaryOpen, setArticleSummaryOpen] = useState(false);
  const { setMode } = useEditorStore();

  const storyStoreDataRef = useRef({
    translations: storyTranslations,
    story,
  });
  storyStoreDataRef.current = {
    translations: storyTranslations,
    story,
  };
  /* const {
   *   translations: staticDataTranslations,
   *   setTranslations: setStaticDataTranslations,
   * } = useStaticDataStore();
   * const staticDataStoreDataRef = useRef({
   *   translations: storyTranslations,
   * });
   * staticDataStoreDataRef.current = {
   *   translations: storyTranslations,
   * }; */

  useLayoutEffect(() => {
    const showProjectSettings = () => {
      setProjectSettingsOpen(true);
      setMode(Mode.Popup);
    };
    const showArticleSummary = () => {
      setArticleSummaryOpen(true);
      setMode(Mode.Popup);
    };
    const removeUselessTranslations = () => {
      const newStoryTranslations: any = {};
      Object.values(storyStoreDataRef.current.story).forEach((storylet) => {
        Object.values(storylet.nodes).forEach((node) => {
          const schema = getNodeSchema(node);
          processValueWithSchema(
            schema.basicDataSchema,
            node.data,
            (propSchema, propVal) => {
              if (
                propSchema instanceof SchemaFieldString &&
                propSchema.config.needI18n
              ) {
                newStoryTranslations[propVal] =
                  storyStoreDataRef.current.translations[propVal];
              }
            }
          );
        });
      });
      setStoryTranslations(newStoryTranslations);
    };
    ipcRenderer.on(SHOW_PROJET_SETTINGS, showProjectSettings);
    ipcRenderer.on(SHOW_ARTICLE_SUMMARY, showArticleSummary);
    ipcRenderer.on(REMOVE_UESLESS_TRANSLATIONS, removeUselessTranslations);
    eventEmitter.on(Event.OpenProjectSettings, showProjectSettings);

    return () => {
      ipcRenderer.off(REMOVE_UESLESS_TRANSLATIONS, removeUselessTranslations);
      ipcRenderer.off(SHOW_ARTICLE_SUMMARY, showArticleSummary);
      ipcRenderer.off(SHOW_PROJET_SETTINGS, showProjectSettings);
      eventEmitter.off(Event.OpenProjectSettings, showProjectSettings);
    };
  }, [setMode, setStoryTranslations]);

  return (
    <Box
      sx={{ flexGrow: 1, background: 'rgb(75 85 99)', position: 'relative' }}
    >
      {getRootParent(currentOpenFile?.id || '', files)?.id ===
        'static-data' && <StaticData />}
      {getRootParent(currentOpenFile?.id || '', files)?.id === 'story' && (
        <Story />
      )}
      {projectSettingsOpen && (
        <ProjectSettings
          open={projectSettingsOpen}
          close={() => {
            setProjectSettingsOpen(false);
            setMode(Mode.Normal);
          }}
        />
      )}
      {articleSummaryOpen && (
        <ArticelPanel
          open={articleSummaryOpen}
          close={() => {
            setArticleSummaryOpen(false);
            setMode(Mode.Normal);
          }}
        />
      )}
      {children}
    </Box>
  );
}
