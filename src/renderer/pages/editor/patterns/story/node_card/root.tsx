import React, { useLayoutEffect } from 'react';
import { StoryletRootNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';

export default function RootNodeCard({
  node,
  pos,
}: {
  node: StoryletRootNode;
  pos: { x: number; y: number };
}) {
  const { currentStorylet, selectNode } = useStoryStore();
  if (!currentStorylet) {
    return null;
  }

  useLayoutEffect(() => {
    selectNode(node.id);
  }, []);

  return (
    <BaseNodeCard
      pos={pos}
      node={node}
      color={{ hover: 'rgb(253 230 138)', normal: 'rgb(251 191 36)' }}
    >
      {currentStorylet.name}
    </BaseNodeCard>
  );
}
