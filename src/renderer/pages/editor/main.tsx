import { Box } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react';
import { useExplorerStore } from '../../store';
import StaticData from './patterns/static_data';
import Story from './patterns/story';
import { ipcRenderer } from 'electron';
import { SHOW_PROJET_SETTINGS } from '../../../constants/events';
import ProjectSettings from './components/project_settings';

export default function Main() {
  const { currentOpenFile } = useExplorerStore();
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

  useLayoutEffect(() => {
    const showProjectSettings = () => {
      setProjectSettingsOpen(true);
    };
    ipcRenderer.on(SHOW_PROJET_SETTINGS, showProjectSettings);

    return () => {
      ipcRenderer.off(SHOW_PROJET_SETTINGS, showProjectSettings);
    };
  }, []);

  return (
    <Box sx={{ flexGrow: 1, background: 'rgb(75 85 99)' }}>
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'Static Data' && (
        <StaticData />
      )}
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'Story' && <Story />}
      <ProjectSettings
        open={projectSettingsOpen}
        close={() => {
          setProjectSettingsOpen(false);
        }}
      />
    </Box>
  );
}
