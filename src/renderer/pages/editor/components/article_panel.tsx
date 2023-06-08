import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {
  FormControlLabel,
  Modal,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useStoryStore } from '../../../store';
import { borderRadius } from '../../../theme';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../../models/story/storylet';

export default function ArticelPanel({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { currentStorylet, tr, storyActors, updateTranslateKey } =
    useStoryStore();
  const [isEdit, setIsEdit] = useState(false);

  const getArticleSummary = (storylet: Storylet): string => {
    if (!storylet.root) {
      return '';
    }
    const nodes = doGetArticleSummary(storylet.root, storylet);
    return nodes
      .map((node) => {
        let content = '';
        if (node.data.actor?.id) {
          content +=
            tr(
              storyActors.find((s) => s.id === node.data.actor?.id)?.name || ''
            ) + '：';
        }
        content += tr(node.data.content);
        return content;
      })
      .join('\n');
  };

  const doGetArticleSummary = (
    node: StoryletNode<StoryletNodeData>,
    storylet: Storylet
  ): any[] => {
    let res: any[] = [];

    if (
      node instanceof StoryletSentenceNode ||
      node instanceof StoryletBranchNode
    ) {
      res = [node];
    }

    const children = storylet.getNodeChildren(node.id);
    const childRes = children.map((childNode) => {
      return doGetArticleSummary(childNode, storylet);
    });

    res = [...res, ...childRes.flat()];
    return res;
  };

  /* useEffect(() => {
   *     window.addEventListener('keydown', (e) => {
   *     })
   * }, []); */

  if (!currentStorylet || !currentStorylet.root) {
    return null;
  }

  const summary = getArticleSummary(currentStorylet);
  return (
    <Modal open={open}>
      <Stack
        sx={{
          position: 'absolute',
          top: '50%',
          left: '60%',
          minHeight: '50%',
          maxHeight: '70%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          bgcolor: 'background.paper',
          outline: 'none',
          boxShadow: 24,
          p: 4,
          ...borderRadius.large,
        }}
      >
        <HighlightOffOutlinedIcon
          sx={{
            position: 'absolute',
            top: '-32px',
            right: '-32px',
            color: 'common.white',
            fontSize: '2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={close}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isEdit}
              onChange={(e) => {
                setIsEdit(e.target.checked);
              }}
            />
          }
          label='Edit mode:'
        />

        {isEdit && (
          <Stack
            spacing={2}
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
            }}
          >
            {doGetArticleSummary(currentStorylet.root, currentStorylet).map(
              (node) => {
                return (
                  <Stack
                    direction='row'
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                  >
                    {node.data.actor?.id && (
                      <div
                        style={{
                          fontSize: '14px',
                        }}
                      >
                        {tr(
                          storyActors.find((s) => s.id === node.data.actor?.id)
                            ?.name || ''
                        ) + '：'}
                      </div>
                    )}
                    <TextField
                      inputProps={{
                        style: {
                          fontSize: '14px',
                        },
                      }}
                      sx={{ flexGrow: 1 }}
                      value={tr(node.data.content)}
                      onChange={(e) => {
                        updateTranslateKey(node.data.content, e.target.value);
                      }}
                    />
                  </Stack>
                );
              }
            )}
          </Stack>
        )}
        {!isEdit && (
          <TextField
            inputProps={{
              style: {
                color: 'black!important',
                fontSize: '14px',
              },
            }}
            sx={{
              width: '100%',
              flexGrow: 1,
              overflow: 'auto',
              '&[disabled]': {
                color: 'black!important',
              },
            }}
            multiline
            disabled
            value={summary}
          />
        )}
      </Stack>
    </Modal>
  );
}
