import React from 'react';
import { StoryletSentenceNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../store';
import BaseNodeCard from './base';
import BaseEditDialog from '../edit_dialog';
import { Stack, Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { borderRadius } from '../../../../../theme';

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
  const { currentStorylet, tr, storyActors } = useStoryStore();
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
      <Stack
        spacing={2}
        direction='row'
        sx={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
      >
        {node.data.actor && (
          <img
            style={{
              objectFit: 'contain',
              backgroundColor: grey[800],
              width: '100px',
              height: '100px',
              padding: '12px',
              alignSelf: 'center',
              ...borderRadius.large,
            }}
            src={
              (
                storyActors.find((item: any) => item.id === node.data.actor?.id)
                  ?.portraits || []
              ).find((p: any) => p.id === node.data.actor?.portrait)?.pic || ''
            }
            alt=''
          />
        )}
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            lineClamp: 3,
            display: '-webkit-box',
            boxOrient: 'vertical',
          }}
        >
          {tr(node.data.content)}
        </Box>
      </Stack>
    </BaseNodeCard>
  );
}
