import React from 'react';
import { StoryletActionNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';

export default function ActionNodeCard({
  node,
  pos,
}: {
  node: StoryletActionNode;
  pos: { x: number; y: number };
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
    >
      {node.data.actionType}
    </BaseNodeCard>
  );
}
