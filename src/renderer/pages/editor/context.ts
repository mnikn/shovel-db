import React from 'react';
import { ProjectSettings } from '../../data/project';
import { File, Folder } from '../../models/explorer';

export const EditorContext = React.createContext<{
  projectPath: string | null;
  projectSettings: ProjectSettings | null;
  files: Array<File | Folder>;
  currentOpenFile: File | null;
  setCurrentOpenFile: (val: File | null) => void;
}>({
  projectPath: null,
  projectSettings: null,
  files: [],
  currentOpenFile: null,
  setCurrentOpenFile: () => {},
});
