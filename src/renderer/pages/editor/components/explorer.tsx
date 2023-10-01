import * as remote from '@electron/remote';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Box, Container, Stack, TextField } from '@mui/material';
import * as d3 from 'd3';
import { uniq } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FILE_GROUP } from '../../../../common/constants';
import {
  File,
  Folder,
  getChildren,
  getPathParents,
  getRootParent,
} from '../../../models/explorer';
import { Mode, useEditorStore, useExplorerStore } from '../../../store';
import { useFileStore } from '../../../stores';
import { animation, borderRadius } from '../../../theme';

type FileContextMenuItem = {
  label: string;
  order: number;
  click: (file: File) => void;
};

let cacheDragingData: File | Folder | null = null;
export default function Explorer(context: {
  extraFileContextMenuItems?: FileContextMenuItem[];
}) {
  const [uncollapsedFolders, setUncollapsedFolders] = useState<string[]>([]);

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const {
    files,
    currentOpenFile,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    openFile,
  } = useFileStore();

  const { moveFile } = useExplorerStore();

  const { setMode } = useEditorStore();

  useEffect(() => {
    if (!currentOpenFile) {
      return;
    }

    const parents = getPathParents(currentOpenFile, files);
    setUncollapsedFolders((prev) => {
      return uniq([...prev, ...parents]);
    });
  }, [currentOpenFile, files]);

  useEffect(() => {
    setMode(editingItem ? Mode.Popup : Mode.Normal);
  }, [editingItem, setMode]);

  const fileContextMenu: FileContextMenuItem[] = useMemo(() => {
    return [
      {
        label: 'New File',
        order: 1,
        click: (file: File) => {
          const newFile = createFile(file.id);
          setEditingItem(newFile.id);
          openFile(newFile.id);
        },
      },
      {
        label: 'Rename',
        order: 5,
        click: (file: File) => {
          setEditingName(file.name);
          setEditingItem(file.id);
        },
      },
      {
        label: 'Copy',
        order: 10,
        click: () => {
          console.log('Copy');
        },
      },
      {
        label: 'Delete',
        order: 15,
        click: (file: File) => {
          deleteFile(file.id);
        },
      },
      ...(context?.extraFileContextMenuItems || []),
    ].sort((a, b) => {
      return a.order - b.order;
    });
  }, [context?.extraFileContextMenuItems, createFile, deleteFile]);

  const onDragStart = (event, data) => {
    const dragData = {
      ...data,
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    cacheDragingData = dragData;
  };

  const onDragOver = (event, data) => {
    const dragingData = cacheDragingData;
    if (!dragingData) {
      return;
    }
    if (
      data.id === dragingData.id ||
      (!data.parentId && getRootParent(dragingData.id, files).id !== data.id)
    ) {
      return;
    }
    event.preventDefault();
  };

  const onDragDrop = (event, data) => {
    event.preventDefault();
    const dragingData = JSON.parse(
      event.dataTransfer.getData('application/json')
    );
    const targetData = data;
    moveFile(dragingData.id, targetData.id);
    cacheDragingData = null;
  };

  const TreeItem = ({ data }: { data: File | Folder }) => {
    const children = getChildren(data.id, files);
    if (data.type === 'folder') {
      const isCollapsed = !uncollapsedFolders.find((item) => item === data.id);
      return (
        <>
          <Stack
            key={data.id}
            direction='row'
            spacing={0.5}
            draggable={!editingItem}
            sx={{
              p: 0.5,
              position: 'relative',
              ...borderRadius.large,
              ...animation.autoFade,
              '&:hover': !editingItem
                ? {
                    cursor: 'pointer',
                    backgroundColor: 'rgb(107 114 128)',
                    color: 'common.white',
                  }
                : undefined,
              backgroundColor:
                editingItem === data.id ? 'rgb(107 114 128)' : 'inherit',
              color: editingItem === data.id ? 'common.white' : 'common.black',
              userSelect: 'none',
              /* backgroundColor: !isOver && canDrop ? grey[500] : "inherit", */
            }}
            onDragStart={(event) => {
              onDragStart(event, data);
            }}
            onDrop={(event) => {
              onDragDrop(event, data);
            }}
            onDragOver={(event) => {
              onDragOver(event, data);
            }}
            onClick={() => {
              if (editingItem) {
                return;
              }
              if (uncollapsedFolders.find((item) => item === data.id)) {
                setUncollapsedFolders(
                  uncollapsedFolders.filter((f) => f !== data.id)
                );
              } else {
                setUncollapsedFolders([...uncollapsedFolders, data.id]);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const menu = new remote.Menu();

              const folderContextMenu = [
                {
                  label: 'New File',
                  click: () => {
                    const newFile = createFile(data.id);
                    setEditingItem(newFile.id);
                    openFile(newFile.id);
                  },
                },
                {
                  label: 'New Folder',
                  click: () => {
                    const newFolder = createFolder(data.id);
                    setEditingItem(newFolder.id);
                  },
                },
              ];

              if (
                ![FILE_GROUP.STATIC_DATA, FILE_GROUP.STORY].includes(
                  data.id as any
                )
              ) {
                folderContextMenu.push(
                  {
                    label: 'Rename',
                    click: () => {
                      setEditingItem(data.id);
                      setEditingName(data.name);
                    },
                  },
                  {
                    label: 'Delete',
                    click: () => {
                      deleteFile(data.id);
                    },
                  }
                );
              }
              folderContextMenu.forEach((item) => {
                menu.append(
                  new remote.MenuItem({
                    label: item.label,
                    click: () => item.click(),
                  })
                );
              });
              menu.popup({ window: remote.getCurrentWindow() });
            }}
          >
            <Stack direction='row' spacing={0}>
              {!isCollapsed ? (
                <>
                  <ExpandMoreIcon />
                  <FolderOpenIcon />
                </>
              ) : (
                <>
                  <ExpandLessIcon />
                  <FolderIcon />
                </>
              )}
            </Stack>
            {editingItem === data.id && (
              <TextField
                variant='standard'
                color='secondary'
                inputProps={{
                  style: {
                    color: '#fff',
                  },
                }}
                value={editingName}
                autoFocus
                onChange={(e) => {
                  setEditingName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameFile(data.id, editingName);
                    setEditingItem(null);
                    setEditingName('');
                  }

                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingItem(null);
                    setEditingName('');
                  }
                }}
              />
            )}
            {editingItem !== data.id && <div>{data.name}</div>}
          </Stack>
          {!isCollapsed && (
            <Stack sx={{ pl: 4 }} spacing={1}>
              {children
                .sort((a, b) => a.order - b.order)
                .map((item, i) => {
                  return <TreeItem key={item.id} data={item} />;
                })}
            </Stack>
          )}
        </>
      );
    }

    return (
      <Stack
        key={data.id}
        direction='row'
        spacing={0.5}
        sx={{
          p: 0.5,
          position: 'relative',
          backgroundColor:
            currentOpenFile === data.id || editingItem === data.id
              ? 'rgb(107 114 128)'
              : 'inherit',
          color:
            currentOpenFile === data.id || editingItem === data.id
              ? 'common.white'
              : 'common.black',
          '&:hover': !editingItem
            ? {
                cursor: 'pointer',
                backgroundColor: 'rgb(107 114 128)',
                color: 'common.white',
              }
            : undefined,
          ...borderRadius.large,
          ...animation.autoFade,
          userSelect: 'none',
        }}
        onClick={() => {
          if (editingItem) {
            return;
          }
          openFile(data.id);
        }}
        draggable={!editingItem}
        onDoubleClick={() => {
          setEditingName(data.name);
          setEditingItem(data.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          const menu = new remote.Menu();
          fileContextMenu.forEach((item) => {
            menu.append(
              new remote.MenuItem({
                label: item.label,
                click: () => item.click(data),
              })
            );
          });
          menu.popup({ window: remote.getCurrentWindow() });
        }}
        onDragStart={(event) => {
          onDragStart(event, data);
        }}
        onDrop={(event) => {
          onDragDrop(event, data);
        }}
        onDragOver={(event) => {
          onDragOver(event, data);
        }}
      >
        <ArticleIcon />
        {editingItem === data.id && (
          <TextField
            variant='standard'
            color='secondary'
            inputProps={{
              style: {
                color: '#fff',
              },
            }}
            value={editingName}
            autoFocus
            onChange={(e) => {
              setEditingName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                renameFile(data.id, editingName);
                setEditingItem(null);
                setEditingName('');
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditingItem(null);
                setEditingName('');
              }
            }}
          />
        )}
        {editingItem !== data.id && <div>{data.name}</div>}
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '300px',
        backgroundColor: 'rgb(249 250 251)',
        color: 'common.black',
        overflowY: 'overlay',
        flexShrink: 0,
        p: 2,
      }}
    >
      <Stack spacing={1}>
        {files
          .filter((item) => !item.parentId)
          .sort((a, b) => a.order - b.order)
          .map((file, i) => {
            return <TreeItem key={file.id} data={file} />;
          })}
      </Stack>
    </Box>
  );
}
