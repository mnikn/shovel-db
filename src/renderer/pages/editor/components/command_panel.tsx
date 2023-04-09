import {
  Stack,
  TextField,
  Box,
  FormLabel,
  Divider,
  Modal,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Event, eventEmitter } from '../../../events';
import { useExplorerStore } from '../../../store';
import { borderRadius, animation } from '../../../theme';

function countMatchSubstring(str: string, substr: string): number {
  const regex = new RegExp(substr, 'gi');
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

interface Command {
  id: string;
  label: string;
  enabled: () => boolean;
  needInputText: boolean;
  fn: (inputText?: string) => void;
}

const activeStyle = { backgroundColor: grey[400], cursor: 'pointer' };
export default function CommandPanel({ close }: { close: () => void }) {
  const [query, setQuery] = useState<string>('');
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);
  const [commandInputText, setCommandInputText] = useState<string>('');
  const { newFile, currentOpenFile, openFile } = useExplorerStore();
  const [selectingItemIndex, setSelectingItemIndex] = useState<number>(0);
  const selectingItemIndexRef = useRef(selectingItemIndex);
  selectingItemIndexRef.current = selectingItemIndex;
  const currentCommandRef = useRef(currentCommand);
  currentCommandRef.current = currentCommand;
  const commandInputTextRef = useRef(commandInputText);
  commandInputTextRef.current = commandInputText;

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'new file',
        label: 'New file',
        enabled: () => {
          return true;
        },
        needInputText: true,
        fn: (fileName?: string) => {
          if (!currentOpenFile) {
            return;
          }
          const file = newFile(currentOpenFile.parentId || '', fileName);
          if (file) {
            setTimeout(() => {
              openFile(file);
            }, 0);
          }
        },
      },
      {
        id: 'open-project-settings',
        label: 'Open project settings',
        enabled: () => {
          return true;
        },
        needInputText: false,
        fn: () => {
          eventEmitter.emit(Event.OpenProjectSettings);
        },
      },
    ],
    [newFile, currentOpenFile, openFile]
  );

  const searchResultRef = useRef<Command[]>([]);
  const searchResult: Command[] = useMemo((): Command[] => {
    if (!query) {
      return commands;
    }
    const regex = new RegExp(
      query.replaceAll(' ', '').split('').join('.*'),
      'i'
    );
    const res = commands
      .filter((item) => regex.test(item.label || ''))
      .map((item) => item.id);
    return commands
      .filter((item) => res.includes(item.id))
      .sort((a, b) => {
        const queryArr = query.replaceAll(' ', '/').split('/');
        return (
          countMatchSubstring(b.label, queryArr[queryArr.length - 1]) -
          countMatchSubstring(a.label, queryArr[queryArr.length - 1])
        );
      });
  }, [query]);

  searchResultRef.current = searchResult;

  useEffect(() => {
    setSelectingItemIndex(0);
  }, [query]);

  useLayoutEffect(() => {
    const onKeyDown = (e) => {
      /* e.preventDefault(); */
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSelectingItemIndex((prev) => {
          if (prev >= searchResultRef.current.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSelectingItemIndex((prev) => {
          if (prev <= 0) {
            return searchResultRef.current.length - 1 || 0;
          }
          return prev - 1;
        });
      }

      if (e.code === 'Enter') {
        e.preventDefault();
        const item = searchResultRef.current[selectingItemIndexRef.current];
        if (!item) {
          return;
        }
        if (item.needInputText && !currentCommandRef.current) {
          setCurrentCommand(item);
          setCommandInputText('');
          return;
        }

        if (item.needInputText && currentCommandRef.current) {
          item.fn(commandInputTextRef.current);
          close();
          return;
        }

        item.fn();
        close();
        /* close(); */
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setCurrentCommand(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [close]);

  return (
    <Modal open>
      <Stack
        sx={{
          p: 2,
          position: 'absolute',
          top: '42px',
          left: '55%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '600px',
          background: 'white',
          outline: 'none',
          ...borderRadius.larger,
        }}
        spacing={2}
      >
        <TextField
          size='small'
          value={currentCommand ? commandInputText : query}
          autoFocus
          onChange={(e) => {
            if (currentCommand) {
              setCommandInputText(e.target.value);
            } else {
              setQuery(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
            }
          }}
        />
        {!currentCommand && (
          <Stack sx={{ flexGrow: 1, overflow: 'auto' }}>
            {searchResult
              .filter((c) => c.enabled())
              .map((item, i) => {
                const itemStyle = i === selectingItemIndex ? activeStyle : {};
                return (
                  <Stack
                    key={item.id}
                    onClick={() => {
                      if (item.needInputText && !currentCommand) {
                        setCurrentCommand(item);
                        setCommandInputText('');
                        return;
                      }

                      item.fn(commandInputText);
                      close();
                    }}
                  >
                    <Stack
                      direction='row'
                      spacing={2}
                      sx={{
                        alignItems: 'center',
                        p: 1,
                        outline: 'none',
                        '&:hover': activeStyle,
                        '&:focus': activeStyle,
                        ...itemStyle,
                        ...borderRadius.normal,
                        ...animation.autoFade,
                      }}
                    >
                      <Box
                        sx={{
                          pointerEvents: 'none',
                          userSelect: 'none',
                          fontWeight: 'bold',
                          fontSize: '1.05rem',
                        }}
                      >
                        {item.label}
                      </Box>
                    </Stack>
                    <Divider flexItem />
                  </Stack>
                );
              })}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
