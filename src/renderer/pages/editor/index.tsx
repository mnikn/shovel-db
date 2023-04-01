import { Box, Container, Stack } from '@mui/material';
import React from 'react';
import { UUID } from '../../../utils/uuid';
import { buildFileTree } from '../../models/explorer';
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
