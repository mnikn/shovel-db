import React from 'react';
import { StoryletSentenceNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';

export default function SentenceNodeCard({
  node,
  pos,
}: {
  node: StoryletSentenceNode;
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
      color={{ hover: 'rgb(187 247 208)', normal: 'rgb(74 222 128)' }}
    >
      {tr(node.data.content)}
    </BaseNodeCard>
  );
}
