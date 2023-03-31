import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import theme from "../theme";
import Editor from "../pages/editor";
import { ExplorerStoreProvider } from "../store";

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExplorerStoreProvider>
        <Box
          sx={{
            height: "100%",
          }}
        >
          <Editor />
        </Box>
      </ExplorerStoreProvider>
    </ThemeProvider>
  );
}
