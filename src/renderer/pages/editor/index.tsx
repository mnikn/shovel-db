import { Box, Stack } from '@mui/material';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useStoryStore } from '../../store';
import { Mode, useEditorStore } from '../../store/editor';
import { useProjectStore } from '../../store/project';
import { useTrackStore } from '../../store/track';
import Explorer from './components/explorer';
import Main from './main';

export default function Editor() {
  const { undo, redo } = useTrackStore();
  const { mode } = useEditorStore();

  const { story, translations: storyTranslations } = useStoryStore();
  const { save } = useProjectStore();

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

      if (e.code === 'KeyS' && e.ctrlKey) {
        save({ story, storyTranslations }, {});
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, [undo, redo, mode, save, story, storyTranslations]);

  return (
    <Box>
      <Stack direction={'row'} sx={{ height: '100%', width: '100%' }}>
        <Explorer />
        <Main />
      </Stack>
    </Box>
  );
}
