import React from 'react';
import {
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import RootNodeCard from './root';
import SentenceNodeCard from './sentence';

export default function NodeCard({
  pos,
  node,
}: {
  pos: { x: number; y: number };
  node: StoryletNode<StoryletNodeData>;
}) {
  return (
    <>
      {node instanceof StoryletRootNode && (
        <RootNodeCard pos={pos} node={node} />
      )}
      {node instanceof StoryletSentenceNode && (
        <SentenceNodeCard pos={pos} node={node} />
      )}
    </>
  );
}
