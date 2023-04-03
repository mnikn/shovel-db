import { Box, Stack } from '@mui/material';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Mode, useEditorStore } from '../../store/editor';
import { useTrackStore } from '../../store/track';
import Explorer from './components/explorer';
import Main from './main';

export default function Editor() {
  const { undo, redo } = useTrackStore();
  const { mode } = useEditorStore();

  useEffect(() => {
    const handle = (e) => {
      if (mode !== Mode.Normal) {
        return;
      }
      if (e.code === 'KeyZ' && e.ctrlKey) {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, [undo, redo, mode]);

  return (
    <Box>
      <Stack direction={'row'} sx={{ height: '100%', width: '100%' }}>
        <Explorer />
        <Main />
      </Stack>
    </Box>
  );
}
