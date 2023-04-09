import { Box, Container, Divider, Stack } from '@mui/material';
import { clipboard } from 'electron';
import * as d3 from 'd3';
import React, {
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from 'react';
import { grey } from '@mui/material/colors';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
  StoryletActionNode,
  Storylet,
} from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import { Mode, useEditorStore } from '../../../../../store/editor';
import { trackState } from '../../../../../store/track';
import { animation, borderRadius } from '../../../../../theme';
import EditDialog from '../edit_dialog';
import Grid2 from '@mui/material/Unstable_Grid2';

export default function BaseNodeCard({
  pos,
  node,
  color,
  children,
  onDrag,
  onDragEnd,
}: {
  node: StoryletNode<StoryletNodeData>;
  pos: { x: number; y: number };
  color: { normal: string; hover: string; active?: string };
  children: React.ReactNode;
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
}) {
  const {
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    insertSiblingNode,
    moveSelection,
    deleteNode,
    translations,
    updateTranslateKeyAll,
    getTranslationsForKey,
    trackCurrentState,
    tr,
  } = useStoryStore();
  const viewRef = useRef<HTMLElement>();
  const [editOpen, setEditOpen] = useState(false);
  const { setMode, mode } = useEditorStore();
  const [isHover, setIsHover] = useState(false);
  const [isDraging, setIsDraging] = useState(false);
  if (!currentStorylet) {
    return null;
  }

  const isSelecting = selection?.nodeId === node.id;

  useLayoutEffect(() => {
    if (!viewRef.current) {
      return;
    }
    viewRef.current.tabIndex = isSelecting ? 1 : -1;
  }, [isSelecting]);

  const onSelect = useCallback(() => {
    if (editOpen) {
      return;
    }
    selectNode(node.id);
  }, [node.id, editOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSelecting || editOpen || mode === Mode.Popup) {
        return;
      }

      e.preventDefault();

      const duplicateNode = (targetNode: StoryletNode<StoryletNodeData>) => {
        const newNode = targetNode.clone();
        if (
          (newNode instanceof StoryletSentenceNode ||
            newNode instanceof StoryletBranchNode) &&
          (targetNode instanceof StoryletSentenceNode ||
            targetNode instanceof StoryletBranchNode)
        ) {
          updateTranslateKeyAll(
            newNode.data.content,
            getTranslationsForKey(targetNode.data.content)
          );
        }
        return newNode;
      };

      let insertFn: Function | null = null;
      // Enter
      if (e.keyCode === 13) {
        insertFn = insertSiblingNode;
      }
      // Tab
      if (e.keyCode === 9) {
        insertFn = insertChildNode;
      }
      if (insertFn) {
        let newNode: StoryletNode<StoryletNodeData> =
          new StoryletSentenceNode();
        if (e.ctrlKey) {
          newNode = new StoryletBranchNode();
          if (e.shiftKey) {
            newNode = new StoryletActionNode();
          }
        }
        insertFn(newNode, node);

        trackCurrentState();
        return;
      }

      if (e.code === 'KeyD' && e.ctrlKey) {
        const insertNodeFn = e.shiftKey ? insertSiblingNode : insertChildNode;
        const newNode = duplicateNode(node);
        insertNodeFn(newNode, node);
        return;
      }

      if (e.code === 'KeyC' && e.ctrlKey) {
        clipboard.writeText(JSON.stringify(node.toJson()));
        return;
      }

      if (e.code === 'KeyV' && e.ctrlKey) {
        const nodeJson = clipboard.readText();
        const originNode = Storylet.fromNodeJson({
          ...JSON.parse(nodeJson),
        });
        const newNode = duplicateNode(originNode);
        insertChildNode(newNode, node);
        return;
      }

      // Esc
      if (e.keyCode === 8 && !(node instanceof StoryletRootNode)) {
        deleteNode(node.id);
        trackCurrentState();
        return;
      }

      if (e.code === 'KeyE') {
        selectNode(null);

        setEditOpen(true);
        setIsHover(false);
        setIsDraging(false);
        setMode(Mode.Popup);
        return;
      }

      moveSelection(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    editOpen,
    isSelecting,
    insertChildNode,
    insertSiblingNode,
    moveSelection,
    deleteNode,
    translations,
    updateTranslateKeyAll,
    getTranslationsForKey,
    mode,
    setMode,
    trackCurrentState,
  ]);

  const renderCodePopupItem = (label, content) => {
    return (
      <>
        <Grid2 xs>
          <Stack
            sx={{ height: '100%', width: '100%', alignItems: 'center' }}
            spacing={1}
          >
            <Box sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}>{label}</Box>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <MonacoEditor
                width='100%'
                height='90%'
                language='python'
                theme='vs-dark'
                value={content}
                options={{
                  insertSpaces: true,
                  autoIndent: 'full',
                  readOnly: true,
                  tabSize: 2,
                  minimap: {
                    enabled: false,
                  },
                  fontSize: 28,
                  scrollbar: {
                    horizontal: 'auto',
                    vertical: 'auto',
                  },
                }}
              />
            </Box>
          </Stack>
        </Grid2>
      </>
    );
  };
  const hasPopupContent =
    !!node.data.enableCheck ||
    (node instanceof StoryletActionNode && node.data.process);
  return (
    <Box
      id={node.id}
      ref={(dom) => {
        if (!dom) {
          return;
        }

        viewRef.current = dom as HTMLElement;
        if (!currentStorylet.getNodeSingleParent(node.id)) {
          return;
        }
        const dragListener = d3
          .drag()
          .on('drag', (d) => {
            setIsDraging(true);
            setIsHover(false);
            if (onDrag) {
              onDrag(d);
            }
          })
          .on('end', (d) => {
            setIsDraging(false);
            if (onDragEnd) {
              onDragEnd(d);
            }
          });
        dragListener(d3.select(dom as any));
      }}
      sx={{
        position: 'absolute',
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor:
          !isSelecting && !isDraging
            ? color.normal
            : color.active || color.hover,
        ...animation.autoFade,
        ...borderRadius.larger,
        fontSize: '2rem',
        transform: `translate(${pos.y}px,${pos.x}px)`,
        height: '220px',
        width: '500px',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        outline: 'none',
        '&:hover': {
          backgroundColor: color.hover,
        },
        zIndex: isHover ? 10 : isSelecting ? 2 : 1,
      }}
      onClick={onSelect}
      onMouseEnter={() => {
        if (!isDraging) {
          setIsHover(true);
        }
      }}
      onMouseLeave={() => {
        if (!isDraging) {
          setIsHover(false);
        }
      }}
    >
      {children}
      {node.data.customNodeId && (
        <Container
          sx={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            fontSize: '2.5rem',
            textAlign: 'center',
            color: 'common.white',
            fontWeight: 'bold',
            transform: 'translateX(-50%)',
          }}
        >
          {node.data.customNodeId}
        </Container>
      )}
      {(isSelecting || isHover) && !editOpen && hasPopupContent && (
        <Stack
          sx={{
            p: 2,
            position: 'absolute',
            top: '-600px',
            height: '500px',
            background: 'white',
            width: '1000px',
            ...borderRadius.larger,
            left: '50%',
            transform: 'translateX(-50%)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Grid2 sx={{ height: '100%', width: '100%' }} container spacing={4}>
            {node.data.enableCheck &&
              renderCodePopupItem('Enable check', node.data.enableCheck)}
            {node instanceof StoryletActionNode &&
              node.data.process &&
              renderCodePopupItem('Process', node.data.process)}
          </Grid2>
        </Stack>
      )}

      {currentStorylet.getNodeSingleParent(node.id) instanceof
        StoryletBranchNode && (
        <Container
          sx={{
            position: 'absolute',
            top: '50%',
            left: '-170px',
            p: 1,
            ...borderRadius.larger,
            width: '160px',
            minHeight: '60px',
            maxHeight: '120px',
            overflow: 'hidden',
            textAlign: 'center',
            backgroundColor: grey[50],
            transform: 'translateY(-50%)',
          }}
        >
          {tr(node.data.option?.name || '')}
        </Container>
      )}
      {editOpen && (
        <EditDialog
          node={node}
          open={editOpen}
          close={() => {
            setEditOpen(false);
            setIsHover(false);
            setIsDraging(false);
            setMode(Mode.Normal);
            setTimeout(() => {
              selectNode(node.id);
            }, 0);
          }}
        />
      )}
    </Box>
  );
}
