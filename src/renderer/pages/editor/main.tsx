import { Box } from '@mui/material';
import React from 'react';
import { useExplorerStore } from '../../store';
import StaticData from './patterns/static_data';
import Story from './patterns/story';

export default function Main() {
  const { currentOpenFile } = useExplorerStore();
  return (
    <Box sx={{ flexGrow: 1, background: 'rgb(75 85 99)' }}>
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'Static Data' && (
        <StaticData />
      )}
      {currentOpenFile?.fullpath?.split('.')?.[0] === 'Story' && <Story />}
    </Box>
  );
}
