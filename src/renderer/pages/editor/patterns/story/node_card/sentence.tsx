import React from 'react';
import { StoryletSentenceNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';
import BaseEditDialog from '../edit_dialog';

export default function SentenceNodeCard({
  node,
  pos,
  onDrag,
  onDragEnd,
}: {
  node: StoryletSentenceNode;
  pos: { x: number; y: number };
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
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
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      {tr(node.data.content)}
    </BaseNodeCard>
  );
}
