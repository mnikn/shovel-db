import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import ipc from '../electron/ipc';
import { HoxRoot } from 'hox';
import Editor from '../pages/editor';
import theme from '../theme';

import 'monaco-editor/esm/vs/editor/editor.main.js';
/* import 'monaco-editor/esm/vs/language/json/monaco.contribution';
 * import 'monaco-editor/esm/vs/language/python/monaco.contribution';
 * import 'monaco-editor/esm/vs/language/javascript/monaco.contribution'; */

export default function App(): JSX.Element {
  useEffect(() => {
    ipc.fetchServiceMemento();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <HoxRoot>
        <CssBaseline />
        <Box
          sx={{
            height: '100%',
          }}
        >
          <Editor />
        </Box>
      </HoxRoot>
    </ThemeProvider>
  );
}
