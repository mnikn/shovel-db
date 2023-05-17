import { Box, Stack, CircularProgress, FormLabel } from '@mui/material';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  useExplorerStore,
  useStaticDataStore,
  useStoryStore,
} from '../../store';
import { Mode, useEditorStore } from '../../store/editor';
import { useProjectStore } from '../../store/project';
import { useTrackStore } from '../../store/track';
import { grey } from '@mui/material/colors';
import { borderRadius } from '../../theme';
import Explorer from './components/explorer';
import Main from './main';
import SearchPanel from './components/search_panel';
import CommandPanel from './components/command_panel';

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
  const { files, recentOpenFiles } = useExplorerStore();
  const { fileData: staticDataFileData, translations: staticDataTranslations } =
    useStaticDataStore();
  const { save } = useProjectStore();
  const [saving, setSaving] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchPanelOpenRef = useRef(searchPanelOpen);
  searchPanelOpenRef.current = searchPanelOpen;

  const [commandPanelOpen, setCommandPanelOpen] = useState(false);
  const commandPanelOpenRef = useRef(commandPanelOpen);
  commandPanelOpenRef.current = commandPanelOpen;

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

      if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        setSaving(true);
        await save({
          story,
          storyActors,
          storyTranslations,
          storyNodeSettings: nodeSettings,
          storyActorSettings: actorSettings,
          files,
          recentOpenFiles,
          staticDataFileData,
          staticDataTranslations,
        });
        setTimeout(() => {
          setSaving(false);
        }, 500);
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, [
    undo,
    redo,
    mode,
    save,
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
  );
}
