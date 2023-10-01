import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import CommandPanel from './components/command_panel';
import SearchPanel from './components/search_panel';
import Main from './main';

export default function Editor() {
  /* const { undo, redo } = useTrackStore();
   * const { mode, setMode } = useEditorStore(); */
  /* const {
   *   story,
   *   nodeSettings,
   *   actorSettings,
   *   translations: storyTranslations,
   *   storyActors,
   * } = useStoryStore(); */
  /* const { files, recentOpenFiles } = useExplorerStore(); */
  /* const { fileData: staticDataFileData, translations: staticDataTranslations } =
   *   useStaticDataStore(); */
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchPanelOpenRef = useRef(searchPanelOpen);
  searchPanelOpenRef.current = searchPanelOpen;

  const [commandPanelOpen, setCommandPanelOpen] = useState(false);
  const commandPanelOpenRef = useRef(commandPanelOpen);
  commandPanelOpenRef.current = commandPanelOpen;

  /* useEffect(() => {
     *   const handle = async (e) => {
     *     return;
     *     if (e.code === 'KeyP' && (e.ctrlKey || e.metaKey)) {
     *       if (
     *         mode === Mode.Popup &&
     *         !(searchPanelOpenRef.current || commandPanelOpenRef.current)
     *       ) {
     *         return;
     *       }
     *       if (e.shiftKey) {
     *         if (!searchPanelOpenRef.current) {
     *           e.preventDefault();
     *           setMode(commandPanelOpenRef.current ? Mode.Normal : Mode.Popup);
     *           setCommandPanelOpen((prev) => !prev);
     *         }
     *       } else {
     *         if (!commandPanelOpenRef.current) {
     *           e.preventDefault();
     *           setMode(searchPanelOpenRef.current ? Mode.Normal : Mode.Popup);
     *           setSearchPanelOpen((prev) => !prev);
     *         }
     *       }
     *     }

     *     if (mode !== Mode.Normal) {
     *       return;
     *     }
     *     if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
     *       if (e.shiftKey) {
     *         redo();
     *       } else {
     *         undo();
     *       }
     *     }
     *   };
     *   window.addEventListener('keydown', handle);
     *   return () => {
     *     window.removeEventListener('keydown', handle);
     *   };
     * }, [
     *   undo,
     *   redo,
     *   mode,
     *   save,
     *   recentOpenFiles,
     *   story,
     *   storyActors,
     *   nodeSettings,
     *   actorSettings,
     *   storyTranslations,
     *   files,
     *   staticDataFileData,
     *   staticDataTranslations,
     * ]); */

  return (
    <Box>
      <Main />
      {searchPanelOpen && (
        <SearchPanel
          close={() => {
            setSearchPanelOpen(false);
            {
              /* setMode(Mode.Normal); */
            }
          }}
        />
      )}
      {commandPanelOpen && (
        <CommandPanel
          close={() => {
            setCommandPanelOpen(false);
            {
              /* setMode(Mode.Normal); */
            }
          }}
        />
      )}
    </Box>
  );
}
