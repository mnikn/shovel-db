import { Box } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react';
import { useExplorerStore } from '../../store';
import StaticData from './patterns/static_data';
import Story from './patterns/story';
import { ipcRenderer } from 'electron';
import { SHOW_PROJET_SETTINGS } from '../../../constants/events';
import ProjectSettings from './components/project_settings';
import { Mode, useEditorStore } from '../../store/editor';

export default function Main() {
  const { currentOpenFile } = useExplorerStore();
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
    <Box sx={{ flexGrow: 1, background: 'rgb(75 85 99)' }}>
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'static-data' && (
        <StaticData />
      )}
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'story' && <Story />}
      <ProjectSettings
        open={projectSettingsOpen}
        close={() => {
          setProjectSettingsOpen(false);
          setMode(Mode.Normal);
        }}
      />
    </Box>
  );
}
