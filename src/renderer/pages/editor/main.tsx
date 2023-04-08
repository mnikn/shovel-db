import { Box } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react';
import { useExplorerStore } from '../../store';
import StaticData from './patterns/static_data';
import Story from './patterns/story';
import { ipcRenderer } from 'electron';
import { SHOW_PROJET_SETTINGS } from '../../../constants/events';
import ProjectSettings from './components/project_settings';
import { Mode, useEditorStore } from '../../store/editor';
import { getRootParent } from '../../models/explorer';

export default function Main({ children }: { children?: any }) {
  const { currentOpenFile, files } = useExplorerStore();
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const { setMode } = useEditorStore();

  useLayoutEffect(() => {
    const showProjectSettings = () => {
      setProjectSettingsOpen(true);
      setMode(Mode.Popup);
    };
    ipcRenderer.on(SHOW_PROJET_SETTINGS, showProjectSettings);

    return () => {
      ipcRenderer.off(SHOW_PROJET_SETTINGS, showProjectSettings);
    };
  }, [setMode]);

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
      {children}
    </Box>
  );
}
