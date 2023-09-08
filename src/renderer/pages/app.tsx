import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { HoxRoot } from 'hox';
import Editor from '../pages/editor';
import theme from '../theme';

import 'monaco-editor/esm/vs/editor/editor.main.js';
/* import 'monaco-editor/esm/vs/language/json/monaco.contribution';
 * import 'monaco-editor/esm/vs/language/python/monaco.contribution';
 * import 'monaco-editor/esm/vs/language/javascript/monaco.contribution'; */

export default function App(): JSX.Element {
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
