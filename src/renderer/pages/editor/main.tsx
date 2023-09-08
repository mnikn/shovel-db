import { Box, CircularProgress, FormLabel, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ipcRenderer } from 'electron';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EDITOR_PATTERN, FILE_GROUP } from '../../../common/constants';
import {
  REMOVE_UESLESS_TRANSLATIONS,
  SHOW_ARTICLE_SUMMARY,
  SHOW_PROJET_SETTINGS,
} from '../../../constants/events';
import { Event, eventEmitter } from '../../events';
import { processValueWithSchema, SchemaFieldString } from '../../models/schema';
import { useStoryStore } from '../../store';
import { useEditorStore, useFileStore, useStaticDataStore } from '../../stores';
import { File } from '../../models/file';
import { borderRadius } from '../../theme';
import ArticelPanel from './components/article_panel';
import Explorer from './components/explorer';
import ProjectSettings from './components/project_settings';
import StaticData from './patterns/static_data';
import Story from './patterns/story';
import ConfigModal from './components/config_modal';

export default function Main() {
  const {
    translations: storyTranslations,
    story,
    getNodeSchema,
    setTranslations: setStoryTranslations,
  } = useStoryStore();

  const { saving, setHasModal, editorPattern } = useEditorStore();
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [articleSummaryOpen, setArticleSummaryOpen] = useState(false);
  /* const [
   *   staticDataFileSchemaConfigModalVisible,
   * ] = useState(false); */
  const [staticDataEditSchema, setStaticDataEditSchema] = useState<
    string | null
  >(null);
  const [staticDataEditSchemaFile, setStaticDataEditSchemaFile] = useState<
    string | null
  >(null);

  const { getStaticFileData, updateFileSchema } = useStaticDataStore();

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
      setHasModal(true);
    };
    const showArticleSummary = () => {
      setArticleSummaryOpen(true);
      setHasModal(true);
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
  }, [setHasModal, setStoryTranslations]);

  const extraFileContextMenuItems = useMemo(() => {
    if (editorPattern === EDITOR_PATTERN.STATIC_DATA) {
      return [
        {
          label: 'Edit Schema',
          order: 6,
          click: async (file: File) => {
            const data = await getStaticFileData(file.id);
            console.log('we: ', data);
            setStaticDataEditSchema(data?.schema);
            setStaticDataEditSchemaFile(file.id);
          },
        },
      ];
    }
    if (editorPattern === EDITOR_PATTERN.STORY) {
      return [];
    }
    return [];
  }, [editorPattern]);

  return (
    <Stack direction={'row'} sx={{ height: '100%', width: '100%' }}>
      <Explorer extraFileContextMenuItems={extraFileContextMenuItems} />
      <Box
        sx={{
          flexGrow: 1,
          background: 'rgb(75 85 99)',
          position: 'relative',
        }}
      >
        {editorPattern === EDITOR_PATTERN.STATIC_DATA && <StaticData />}
        {editorPattern === EDITOR_PATTERN.STORY && <Story />}
        {projectSettingsOpen && (
          <ProjectSettings
            open={projectSettingsOpen}
            close={() => {
              setProjectSettingsOpen(false);
              setHasModal(false);
            }}
          />
        )}
        {articleSummaryOpen && (
          <ArticelPanel
            open={articleSummaryOpen}
            close={() => {
              setArticleSummaryOpen(false);
              setHasModal(false);
            }}
          />
        )}
        {saving ? (
          <Stack
            direction='row'
            spacing={2}
            sx={{
              backgroundColor: grey[50],
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '50px',
              alignItems: 'center',
              justifyContent: 'center',
              ...borderRadius.larger,
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
            }}
          >
            <CircularProgress
              sx={{ height: '24px!important', width: '24px!important' }}
            />
            <FormLabel>Saving...</FormLabel>
          </Stack>
        ) : null}
        {staticDataEditSchemaFile && (
          <ConfigModal
            value={staticDataEditSchema || ''}
            onValueChange={(val) =>
              updateFileSchema(staticDataEditSchemaFile, val)
            }
            lang='toml'
            close={() => {
              setStaticDataEditSchema(null);
              setStaticDataEditSchemaFile(null);
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
