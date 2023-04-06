import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import React, { useState } from 'react';
import { borderRadius } from '../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import ActorSettings from './actor_settings';
import { grey } from '@mui/material/colors';

enum TAB {
  StaticData = 'Static Data',
  Story = 'Story',
}

export default function ProjectSettings({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const [currentTab, setCurrentTab] = useState(TAB.StaticData);
  const [actorSettingsOpen, setActorSettingsOpen] = useState(false);
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
        {currentTab === TAB.StaticData && <div>fdfd</div>}
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
              <Button
                variant='outlined'
                aria-labelledby='actor-edit'
                onClick={() => {
                  setActorSettingsOpen(true);
                }}
              >
                Edit
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
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
