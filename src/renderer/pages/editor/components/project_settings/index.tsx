import { Button, FormLabel, Modal, Stack, Tab, Tabs } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { borderRadius } from '../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import ActorSettings from './actor_settings';
import { grey } from '@mui/material/colors';
import CodeSettings from './code_settings';
import { useStoryStore } from '../../../../store';

enum TAB {
  Story = 'Story',
  StaticData = 'Static Data',
}

export default function ProjectSettings({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const [currentTab, setCurrentTab] = useState(TAB.Story);
  const [actorSettingsOpen, setActorSettingsOpen] = useState(false);
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
  const { nodeSettings, setNodeSettings, actorSettings, setActorSettings } =
    useStoryStore();

  const actorSettingsSchema = useMemo(() => {
    return actorSettings;
  }, [actorSettings]);

  const editorDidMount = () => {};

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
            value={nodeSettings[nodeKey].basicDataSchema}
            onValueChange={(val) => {
              setNodeSettings((prev) => {
                return {
                  ...prev,
                  [nodeKey]: {
                    ...nodeSettings[nodeKey],
                    basicDataSchema: val,
                  },
                };
              });
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
            value={nodeSettings[nodeKey].extraDataSchema}
            onValueChange={(val) => {
              setNodeSettings((prev) => {
                return {
                  ...prev,
                  [nodeKey]: { ...nodeSettings[nodeKey], extraDataSchema: val },
                };
              });
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
    <Modal open={open}>
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
        <Tabs
          value={currentTab}
          onChange={(_, v) => {
            setCurrentTab(v);
          }}
          sx={{
            marginTop: '0!important',
            borderBottom: `1px solid ${grey[300]}`,
          }}
        >
          {Object.values(TAB).map((item) => {
            return <Tab key={item} label={item} value={item} />;
          })}
        </Tabs>
        {currentTab === TAB.Story && (
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
                    setActorSettingsOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setActorSettingsSchemaOpen(true);
                  }}
                >
                  Schema config
                </Button>
              </Stack>
              {actorSettingsOpen && (
                <ActorSettings
                  open={actorSettingsOpen}
                  close={() => {
                    setActorSettingsOpen(false);
                  }}
                />
              )}
              {actorSettingsSchemaOpen && (
                <CodeSettings
                  lang='json'
                  open
                  value={actorSettingsSchema}
                  onValueChange={(val) => {
                    setActorSettings(val);
                  }}
                  onEditorMounted={editorDidMount}
                  close={() => {
                    setActorSettingsSchemaOpen(false);
                  }}
                />
              )}
            </Stack>
            {Object.keys(nodeSettings).map((nodeKey) => {
              return renderNodeSettingsComponent(nodeKey);
            })}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
