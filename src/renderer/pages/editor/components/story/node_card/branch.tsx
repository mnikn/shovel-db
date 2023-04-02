import React from 'react';
import { StoryletBranchNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';

export default function BranchNodeCard({
  node,
  pos,
}: {
  node: StoryletBranchNode;
  pos: { x: number; y: number };
}) {
  const { currentStorylet, tr } = useStoryStore();
  if (!currentStorylet) {
    return null;
  }

  return (
    <BaseNodeCard
      pos={pos}
      node={node}
      color={{ hover: 'rgb(191 219 254)', normal: 'rgb(96 165 250)' }}
    >
      {tr(node.data.content)}
    </BaseNodeCard>
  );
}
