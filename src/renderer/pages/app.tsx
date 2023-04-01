import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
import Editor from '../pages/editor';
import { ExplorerStoreProvider, StoryStoreProvider } from '../store';

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExplorerStoreProvider>
        <StoryStoreProvider>
          <Box
            sx={{
              height: '100%',
            }}
          >
            <Editor />
          </Box>
        </StoryStoreProvider>
      </ExplorerStoreProvider>
    </ThemeProvider>
  );
}
