import React from 'react';
import {
  StoryletActionNode,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import RootNodeCard from './root';
import SentenceNodeCard from './sentence';
import BranchNodeCard from './branch';
import ActionNodeCard from './action';

export default function NodeCard({
  pos,
  node,
  onDrag,
  onDragEnd,
}: {
  pos: { x: number; y: number };
  node: StoryletNode<StoryletNodeData>;
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
}) {
  return (
    <>
      {node instanceof StoryletRootNode && (
        <RootNodeCard
          pos={pos}
          node={node}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        />
      )}
      {node instanceof StoryletSentenceNode && (
        <SentenceNodeCard
          pos={pos}
          node={node}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        />
      )}
      {node instanceof StoryletBranchNode && (
        <BranchNodeCard
          pos={pos}
          node={node}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        />
      )}
      {node instanceof StoryletActionNode && (
        <ActionNodeCard
          pos={pos}
          node={node}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        />
      )}
    </>
  );
}
