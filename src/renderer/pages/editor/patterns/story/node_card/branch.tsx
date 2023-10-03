import React from 'react';
import { StoryletBranchNode } from '../../../../../models/story/storylet';
import { useStoryStore } from '../../../../../stores';
import BaseNodeCard from './base';
import { Stack, Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { borderRadius } from '../../../../../theme';
import { getProjectService } from '../../../../../services';
import path from 'path';

export default function BranchNodeCard({
  node,
  pos,
  onDrag,
  onDragEnd,
}: {
  node: StoryletBranchNode;
  pos: { x: number; y: number };
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
}) {
  const { currentStorylet, tr, actors } = useStoryStore();
  if (!currentStorylet) {
    return null;
  }

  const projectPath = getProjectService().projectPath.value;
  const actorPortraitPic = node?.data?.actor?.portrait
    ? (
        actors.find((item: any) => item.id === node.data.actor?.id)
          ?.portraits || []
      ).find((p: any) => p.id === node.data.actor?.portrait)?.pic
    : null;
  const actorPortraitFilePath =
    actorPortraitPic && projectPath
      ? path.join(path.join(projectPath, 'resources'), actorPortraitPic)
      : null;
  return (
    <BaseNodeCard
      pos={pos}
      node={node}
      color={{ hover: 'rgb(191 219 254)', normal: 'rgb(96 165 250)' }}
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
          <>
            {node.data.actor.portrait && (
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
                src={actorPortraitFilePath || ''}
                alt=''
              />
            )}
            {!node.data.actor.portrait && (
              <Box
                sx={{
                  backgroundColor: grey[800],
                  width: '150px',
                  height: '100px',
                  p: 1,
                  flexGrow: 0,
                  flexShrink: 0,
                  alignSelf: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'common.white',
                  fontSize: '1.3rem',
                  ...borderRadius.large,
                }}
              >
                {node.data.actor.id}
              </Box>
            )}
          </>
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
