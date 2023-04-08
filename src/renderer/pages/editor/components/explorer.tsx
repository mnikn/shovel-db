import * as remote from '@electron/remote';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Box, Container, Stack, TextField } from '@mui/material';
import * as d3 from 'd3';
import React, { useRef, useState } from 'react';
import { File, Folder, getChildren } from '../../../models/explorer';
import { useExplorerStore } from '../../../store';
import { animation, borderRadius } from '../../../theme';

export default function Explorer() {
  const [uncollapsedFolders, setUncollapsedFolders] = useState<string[]>([]);

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  const {
    currentOpenFile,
    openFile,
    files,
    updateItem,
    deleteItem,
    newFile,
    newFolder,
    moveFile,
  } = useExplorerStore();

  const fileContextMenu = [
    {
      label: 'Rename',
      click: (file: File) => {
        setEditingName(file.name);
        setEditingItem(file.id);
      },
    },
    {
      label: 'Copy',
      click: () => {
        console.log('Copy');
      },
    },
    {
      label: 'Delete',
      click: (file: File) => {
        deleteItem(file.id);
      },
    },
  ];

  const dragListen = (dom, data) => {
    const onDragStart = (event) => {
      console.log('dsw: ', event, data);
      const dragData = {
        ...data,
        parent: data.parent?.id || null,
      };
      event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    };

    const onDragOver = (event) => {
      event.preventDefault();
      /* event.dataTransfer.setData('application/json', data); */
    };

    const onDragDrop = (event) => {
      event.preventDefault();
      const dragData = JSON.parse(
        event.dataTransfer.getData('application/json')
      );
      const targetData = data;
      moveFile(dragData.id, targetData.id);
    };

    dom.addEventListener('dragstart', onDragStart);

    dom.addEventListener('dragover', onDragOver);

    dom.addEventListener('drop', onDragDrop);
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
            ref={(dom) => {
              if (!dom) {
                return;
              }

              {
                /* const dragListener = d3
                    .drag()
                    .on('drag', (d) => {
                    onDrag(d, data);
                    })
                    .on('end', onDragEnd);
                    dragListener(d3.select(dom as any)); */
              }
              dragListen(dom as any, data);
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
                    newFile(data.id);
                  },
                },
                {
                  label: 'New Folder',
                  click: () => {
                    newFolder(data.id);
                  },
                },
                {
                  label: 'Rename',
                  click: (folder: Folder) => {
                    setEditingName(folder.name);
                    setEditingItem(folder.id);
                  },
                },
                {
                  label: 'Delete',
                  click: (folder: Folder) => {
                    deleteItem(folder.id);
                  },
                },
              ];
              folderContextMenu.forEach((item) => {
                menu.append(
                  new remote.MenuItem({
                    label: item.label,
                    click: () => item.click(data),
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
                    data.name = editingName || '';
                    updateItem(data.id, data);
                    setEditingItem(null);
                    setEditingName(null);
                  }

                  if (e.key === 'Escape') {
                    setEditingItem(null);
                    setEditingName(null);
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
            currentOpenFile?.id === data.id || editingItem === data.id
              ? 'rgb(107 114 128)'
              : 'inherit',
          color:
            currentOpenFile?.id === data.id || editingItem === data.id
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
          openFile(data);
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
        ref={(dom) => {
          if (!dom) {
            return;
          }

          /* const dragListener = d3
           *   .drag()
           *   .on('drag', (d) => {
           *     onDrag(d, data);
           *   })
           *   .on('end', onDragEnd);
           *   dragListener(d3.select(dom as any)); */
          dragListen(dom as any, data);
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
                data.name = editingName || '';
                updateItem(data.id, data);
                setEditingItem(null);
                setEditingName(null);
              }
              if (e.key === 'Escape') {
                setEditingItem(null);
                setEditingName(null);
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
