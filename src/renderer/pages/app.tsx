import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import Editor from '../pages/editor';
import { ExplorerStoreProvider, StoryStoreProvider } from '../store';
import { ProjectStoreProvider } from '../store/project';
import theme from '../theme';

import 'monaco-editor/esm/vs/editor/editor.main.js';

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProjectStoreProvider>
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
      </ProjectStoreProvider>
    </ThemeProvider>
  );
}
