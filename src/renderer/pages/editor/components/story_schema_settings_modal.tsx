import { Button, FormLabel, Modal, Stack, Tab, Tabs } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { borderRadius } from '../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { grey } from '@mui/material/colors';
import CodeSettings from './code_settings';
import { useStoryStore } from '../../../stores';
import { injectSchemaSnippets } from '../../../utils/monaco_editor';

export default function StorySchemaSettingsModal({
  close,
}: {
  close: () => void;
}) {
  const [actorSettingsSchemaOpen, setActorSettingsSchemaOpen] = useState(false);
  const [basicSchemaSettingsOpen, setBasicSchemaSettingsOpen] = useState<{
    [key: string]: boolean;
  }>({
    root: false,
    sentnce: false,
    branch: false,
    action: false,
  });

  const [extraDataSchemaSettingsOpen, setExtraDataSchemaSettingsOpen] =
    useState<{ [key: string]: boolean }>({
      root: false,
      sentnce: false,
      branch: false,
      action: false,
    });
  const {
    nodeSchemaSettings,
    actorSchemaSettings,
    updateNodeSchemaSettings,
    updateActorSchemaSettings,
  } = useStoryStore();

  const actorSettingsSchema = useMemo(() => {
    return actorSchemaSettings;
  }, [actorSchemaSettings]);

  const editorDidMount = injectSchemaSnippets;

  const renderNodeSettingsComponent = (nodeKey: string) => {
    return (
      <Stack
        direction='row'
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
        key={nodeKey}
      >
        <FormLabel id='actor-edit'>{nodeKey} node settings:</FormLabel>
        <Button
          variant='outlined'
          onClick={() => {
            setBasicSchemaSettingsOpen((prev) => {
              return { ...prev, [nodeKey]: true };
            });
          }}
        >
          Edit basic schema
        </Button>
        <Button
          variant='outlined'
          onClick={() => {
            setExtraDataSchemaSettingsOpen((prev) => {
              return { ...prev, [nodeKey]: true };
            });
          }}
        >
          Edit extra data schema
        </Button>
        {basicSchemaSettingsOpen[nodeKey] && (
          <CodeSettings
            open={basicSchemaSettingsOpen[nodeKey]}
            value={nodeSchemaSettings[nodeKey].basicDataSchema}
            onValueChange={(val: string) => {
              const v = {
                ...nodeSchemaSettings,
                [nodeKey]: {
                  ...nodeSchemaSettings[nodeKey],
                  basicDataSchema: val,
                },
              };
              updateNodeSchemaSettings(v);
            }}
            lang='json'
            onEditorMounted={editorDidMount}
            close={() => {
              setBasicSchemaSettingsOpen((prev) => {
                return { ...prev, [nodeKey]: false };
              });
            }}
          />
        )}
        {extraDataSchemaSettingsOpen[nodeKey] && (
          <CodeSettings
            lang='json'
            open={extraDataSchemaSettingsOpen[nodeKey]}
            value={nodeSchemaSettings[nodeKey].extraDataSchema}
            onValueChange={(val: string) => {
              const v = {
                ...nodeSchemaSettings,
                [nodeKey]: {
                  ...nodeSchemaSettings[nodeKey],
                  extraDataSchema: val,
                },
              };
              updateNodeSchemaSettings(v);
            }}
            onEditorMounted={editorDidMount}
            close={() => {
              setExtraDataSchemaSettingsOpen((prev) => {
                return { ...prev, [nodeKey]: false };
              });
            }}
          />
        )}
      </Stack>
    );
  };

  return (
    <Modal open>
      <Stack
        spacing={4}
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
        <Stack spacing={2}>
          <Stack
            direction='row'
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <FormLabel id='actor-edit'>Actor settings:</FormLabel>
            <Stack direction='row' spacing={2} aria-labelledby='actor-edit'>
              <Button
                variant='outlined'
                onClick={() => {
                  setActorSettingsSchemaOpen(true);
                }}
              >
                Schema config
              </Button>
              {actorSettingsSchemaOpen && (
                <CodeSettings
                  lang='json'
                  open
                  value={actorSettingsSchema}
                  onValueChange={(val: string) => {
                    updateActorSchemaSettings(val);
                  }}
                  onEditorMounted={editorDidMount}
                  close={() => {
                    setActorSettingsSchemaOpen(false);
                  }}
                />
              )}
            </Stack>
          </Stack>
          {Object.keys(nodeSchemaSettings).map((nodeKey) => {
            return renderNodeSettingsComponent(nodeKey);
          })}
        </Stack>
      </Stack>
    </Modal>
  );
}
