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
import { getFullPath, File } from '../../../models/explorer';
import { useExplorerStore } from '../../../store';
import { borderRadius, animation } from '../../../theme';

function countMatchSubstring(str: string, substr: string): number {
  const regex = new RegExp(substr, 'gi');
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

const activeStyle = { backgroundColor: grey[400], cursor: 'pointer' };
export default function SearchPanel({ close }: { close: () => void }) {
  const { recentOpenFiles, files, openFile, currentOpenFile } =
    useExplorerStore();
  const [query, setQuery] = useState<string>('');
  const [selectingItemIndex, setSelectingItemIndex] = useState<number>(0);
  const selectingItemIndexRef = useRef(selectingItemIndex);
  selectingItemIndexRef.current = selectingItemIndex;

  const searchResultRef = useRef<File[]>([]);
  const searchResult: File[] = useMemo((): File[] => {
    const allFiles = files.filter(
      (item) => item.type === 'file' && item.id !== currentOpenFile?.id
    ) as File[];
    if (!query) {
      return allFiles.sort((a, b) => {
        const recentBounsA = recentOpenFiles.lastIndexOf(a.id);
        const recentBounsB = recentOpenFiles.lastIndexOf(b.id);
        return recentBounsB - recentBounsA;
      });
    }
    const allFileInfo = allFiles.map((f) => {
      return { id: f.id, path: getFullPath(f, files)?.replaceAll('.', '/') };
    });

    const regex = new RegExp(
      query.replaceAll(' ', '').split('').join('.*'),
      'i'
    );
    const res = allFileInfo
      .filter((item) => regex.test(item.path || ''))
      .map((item) => item.id);
    return allFiles
      .filter((item) => res.includes(item.id))
      .sort((a, b) => {
        const queryArr = query.replaceAll(' ', '/').split('/');
        const recentBounsA = recentOpenFiles.lastIndexOf(a.id);
        const recentBounsB = recentOpenFiles.lastIndexOf(b.id);
        return (
          countMatchSubstring(b.name, queryArr[queryArr.length - 1]) +
          recentBounsB -
          (countMatchSubstring(a.name, queryArr[queryArr.length - 1]) +
            recentBounsA)
        );
      });
  }, [recentOpenFiles, files, query, currentOpenFile]);

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
        const file = searchResultRef.current[selectingItemIndexRef.current];
        if (!file) {
          return;
        }
        close();
        openFile(file);
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        close();
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
          value={query}
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <Stack sx={{ flexGrow: 1, overflow: 'auto' }}>
          {searchResult.map((item, i) => {
            const itemStyle = i === selectingItemIndex ? activeStyle : {};
            return (
              <Stack
                key={item.id}
                onClick={() => {
                  openFile(item);
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
                    {item.name}
                  </Box>
                  <FormLabel
                    sx={{
                      fontSize: '0.75rem',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {getFullPath(item, files)?.replaceAll('.', '/')}
                  </FormLabel>
                </Stack>
                <Divider flexItem />
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Modal>
  );
}
