import React from 'react';

export const EditorContext = React.createContext<{
  projectPath: string | null;
}>({
  projectPath: null,
});
