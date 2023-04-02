import { Box, Stack } from '@mui/material';
import React from 'react';
import Explorer from './components/explorer';
import Main from './main';

export default function Editor() {
  return (
    <Box>
      <Stack direction={'row'} sx={{ height: '100%', width: '100%' }}>
        <Explorer />
        <Main />
      </Stack>
    </Box>
  );
}
