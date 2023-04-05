import { Box, Container } from '@mui/material';
import * as d3 from 'd3';
import React, { useCallback, useRef, useLayoutEffect, useState } from 'react';
import {
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
  StoryletActionNode,
} from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import { Mode, useEditorStore } from '../../../../../store/editor';
import { trackState } from '../../../../../store/track';
import { animation, borderRadius } from '../../../../../theme';
import EditDialog from '../edit_dialog';

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
    updateTranslateKeyAll,
    getTranslationsForKey,
    trackCurrentState,
  } = useStoryStore();
  const viewRef = useRef<HTMLElement>();
  const [editOpen, setEditOpen] = useState(false);
  const { setMode } = useEditorStore();
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

  const onKeyDown = useCallback(
    (e) => {
      if (!isSelecting || editOpen) {
        return;
      }

      e.preventDefault();

      const duplicateNode = () => {
        const newNode = node.clone();
        if (
          (newNode instanceof StoryletSentenceNode ||
            newNode instanceof StoryletBranchNode) &&
          (node instanceof StoryletSentenceNode ||
            node instanceof StoryletBranchNode)
        ) {
          updateTranslateKeyAll(
            newNode.data.content,
            getTranslationsForKey(node.data.content)
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
        const newNode = duplicateNode();
        insertNodeFn(newNode, node);
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
        setMode(Mode.Popup);
        return;
      }

      moveSelection(e.key);
    },
    [
      editOpen,
      isSelecting,
      insertChildNode,
      insertSiblingNode,
      moveSelection,
      deleteNode,
      updateTranslateKeyAll,
      getTranslationsForKey,
      setMode,
      trackCurrentState,
    ]
  );

  return (
    <Box
      id={node.id}
      ref={(dom) => {
        if (!dom) {
          return;
        }

        viewRef.current = dom as HTMLElement;
        const dragListener = d3
          .drag()
          .on('drag', (d) => {
            if (onDrag) {
              onDrag(d);
            }
          })
          .on('end', (d) => {
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
        backgroundColor: !isSelecting
          ? color.normal
          : color.active || color.hover,
        ...animation.autoFade,
        ...borderRadius.larger,
        fontSize: '2rem',
        transform: `translate(${pos.y}px,${pos.x}px)`,
        height: '200px',
        width: '400px',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        outline: 'none',
        '&:hover': {
          backgroundColor: color.hover,
        },
        zIndex: isSelecting ? 2 : 1,
      }}
      onClick={onSelect}
      onKeyDown={onKeyDown}
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
      <EditDialog
        node={node}
        open={editOpen}
        close={() => {
          setEditOpen(false);
          setMode(Mode.Normal);
          setTimeout(() => {
            selectNode(node.id);
          }, 0);
        }}
      />
    </Box>
  );
}
