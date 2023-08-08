import React from 'react';
import { File, Folder } from '../../models/explorer';

export const EditorContext = React.createContext<{
  projectPath: string | null;
  files: Array<File | Folder>;
  currentOpenFile: File | null;
  setCurrentOpenFile: (val: File | null) => void;
}>({
  projectPath: null,
  files: [],
  currentOpenFile: null,
  setCurrentOpenFile: () => {},
});
