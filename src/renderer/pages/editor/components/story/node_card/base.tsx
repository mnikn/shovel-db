import { Box } from '@mui/material';
import React, { useCallback, useRef, useLayoutEffect } from 'react';
import {
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import { animation, borderRadius } from '../../../../../theme';

export default function BaseNodeCard({
  pos,
  node,
  color,
  children,
}: {
  node: StoryletNode<StoryletNodeData>;
  pos: { x: number; y: number };
  color: { normal: string; hover: string; active?: string };
  children: React.ReactNode;
}) {
  const {
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    insertSiblingNode,
    moveSelection,
    deleteNode,
  } = useStoryStore();
  const viewRef = useRef<HTMLElement>();
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
    selectNode(node.id);
  }, [node.id]);

  const onKeyDown = useCallback(
    (e) => {
      if (!isSelecting) {
        return;
      }

      e.preventDefault();

      // Tab
      if (e.keyCode === 9) {
        if (e.shiftKey && !(node instanceof StoryletRootNode)) {
          const newNode = node.clone();
          insertChildNode(newNode, node);
        } else {
          const sentenceNode = new StoryletSentenceNode();
          insertChildNode(sentenceNode, node);
        }
      }

      // Enter
      if (e.keyCode === 13) {
        const sentenceNode = new StoryletSentenceNode();
        insertSiblingNode(sentenceNode, node);
      }

      // Esc
      if (e.keyCode === 8 && !(node instanceof StoryletRootNode)) {
        deleteNode(node.id);
      }

      moveSelection(e.key);
    },
    [isSelecting, insertChildNode, insertSiblingNode, moveSelection, deleteNode]
  );

  return (
    <Box
      id={node.id}
      ref={viewRef}
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
      //   onBlur={onBlur}
    >
      {children}
    </Box>
  );
}
