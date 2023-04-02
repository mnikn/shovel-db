import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
import Editor from '../pages/editor';
import { ExplorerStoreProvider, StoryStoreProvider } from '../store';
import { ProjectStoreProvider } from '../store/project';

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
