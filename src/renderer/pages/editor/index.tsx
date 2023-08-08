import { Box, CircularProgress, FormLabel, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useSubscription } from 'observable-hooks';
import React, { useEffect, useRef, useState } from 'react';
import { filter, fromEvent, tap } from 'rxjs';
import useExplorer from '../../data/explorer';
import useProject from '../../data/project';
import {
  useExplorerStore,
  useStaticDataStore,
  useStoryStore,
} from '../../store';
import { Mode, useEditorStore } from '../../store/editor';
import { useTrackStore } from '../../store/track';
import { borderRadius } from '../../theme';
import CommandPanel from './components/command_panel';
import Explorer from './components/explorer';
import SearchPanel from './components/search_panel';
import { EditorContext } from './context';
import Main from './main';

export default function Editor() {
  const { undo, redo } = useTrackStore();
  const { mode, setMode } = useEditorStore();

  const {
    story,
    nodeSettings,
    actorSettings,
    translations: storyTranslations,
    storyActors,
  } = useStoryStore();
  const { recentOpenFiles } = useExplorerStore();
  const { fileData: staticDataFileData, translations: staticDataTranslations } =
    useStaticDataStore();
  const { projectPath, save: saveProjectConfig } = useProject();
  const {
    files,
    currentOpenFile,
    setCurrentOpenFile,
    save: saveExplorer,
  } = useExplorer({
    projectPath,
  });
  const [saving, setSaving] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchPanelOpenRef = useRef(searchPanelOpen);
  searchPanelOpenRef.current = searchPanelOpen;

  const [commandPanelOpen, setCommandPanelOpen] = useState(false);
  const commandPanelOpenRef = useRef(commandPanelOpen);
  commandPanelOpenRef.current = commandPanelOpen;

  useSubscription(
    fromEvent(window, 'keydown').pipe(
      filter((e: any) => {
        return e.code === 'KeyS' && (e.ctrlKey || e.metaKey);
      }),
      tap(async () => {
        console.log('save');
        setSaving(true);
        await saveProjectConfig();
        await saveExplorer();
        setTimeout(() => {
          setSaving(false);
        }, 500);
      })
    )
  );

  useEffect(() => {
    const handle = async (e) => {
      if (e.code === 'KeyP' && (e.ctrlKey || e.metaKey)) {
        if (
          mode === Mode.Popup &&
          !(searchPanelOpenRef.current || commandPanelOpenRef.current)
        ) {
          return;
        }
        if (e.shiftKey) {
          if (!searchPanelOpenRef.current) {
            e.preventDefault();
            setMode(commandPanelOpenRef.current ? Mode.Normal : Mode.Popup);
            setCommandPanelOpen((prev) => !prev);
          }
        } else {
          if (!commandPanelOpenRef.current) {
            e.preventDefault();
            setMode(searchPanelOpenRef.current ? Mode.Normal : Mode.Popup);
            setSearchPanelOpen((prev) => !prev);
          }
        }
      }

      if (mode !== Mode.Normal) {
        return;
      }
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      /* if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
       *   setSaving(true);
       *   await save({
       *     story,
       *     storyActors,
       *     storyTranslations,
       *     storyNodeSettings: nodeSettings,
       *     storyActorSettings: actorSettings,
       *     files,
       *     recentOpenFiles,
       *     staticDataFileData,
       *     staticDataTranslations,
       *   });
       *   setTimeout(() => {
       *     setSaving(false);
       *   }, 500);
       * } */
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, [
    undo,
    redo,
    mode,
    recentOpenFiles,
    story,
    storyActors,
    nodeSettings,
    actorSettings,
    storyTranslations,
    files,
    staticDataFileData,
    staticDataTranslations,
  ]);

  return (
    <EditorContext.Provider
      value={{
        projectPath,
        files,
        currentOpenFile,
        setCurrentOpenFile,
      }}
    >
      <Box>
        <Stack direction={'row'} sx={{ height: '100%', width: '100%' }}>
          <Explorer />
          <Main>
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
          </Main>
          {searchPanelOpen && (
            <SearchPanel
              close={() => {
                setSearchPanelOpen(false);
                setMode(Mode.Normal);
              }}
            />
          )}
          {commandPanelOpen && (
            <CommandPanel
              close={() => {
                setCommandPanelOpen(false);
                setMode(Mode.Normal);
              }}
            />
          )}
        </Stack>
      </Box>
    </EditorContext.Provider>
  );
}
