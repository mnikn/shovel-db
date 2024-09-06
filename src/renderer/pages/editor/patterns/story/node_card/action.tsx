import React from 'react';
import { StoryletActionNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../stores';
import BaseNodeCard from './base';

export default function ActionNodeCard({
  node,
  pos,
  onDrag,
  onDragEnd,
}: {
  node: StoryletActionNode;
  pos: { x: number; y: number };
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
}) {
  const { currentStorylet } = useStoryStore();
  if (!currentStorylet) {
    return null;
  }

  return (
    <BaseNodeCard
      pos={pos}
      node={node}
      color={{ hover: '#fecdd3', normal: '#fb7185' }}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      {/* {node.data.actionType} */}
    </BaseNodeCard>
  );
}
