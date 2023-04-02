import React, { useState } from 'react';
import { Box, Tabs, Tab, Modal, Stack, Button, Container } from '@mui/material';
import { borderRadius } from '../../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../../models/schema';
import SchemaForm from '../../../components/schema_form';

enum TAB {
  BASIC = 'Base',
  EXTRA = 'Extra',
}

const schemaObj = new SchemaFieldObject();
const subObj = new SchemaFieldObject();
subObj.fields.push({
  id: 'name444',
  name: 'name444',
  data: new SchemaFieldString(),
});
const subObj2 = new SchemaFieldObject();
subObj2.fields.push({
  id: 'name444',
  name: 'name444',
  data: new SchemaFieldString(),
});
const subObj3 = new SchemaFieldObject();
subObj3.fields.push({
  id: 'name444',
  name: 'name444',
  data: new SchemaFieldString(),
});
schemaObj.fields.push(
  {
    id: 'name',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'name2',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'name3',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'name4',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'name5',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'name6',
    name: 'name',
    data: new SchemaFieldString(),
  },
  {
    id: 'obj',
    name: 'obj',
    data: subObj,
  },
  {
    id: 'obj2',
    name: 'obj2',
    data: subObj2,
  },
  {
    id: 'obj3',
    name: 'obj3',
    data: subObj3,
  }
);

export default function EditDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const [currentTab, setCurrentTab] = useState<TAB>(TAB.BASIC);
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
            ...borderRadius.normal,
            marginTop: '0!important',
          }}
        >
          {Object.values(TAB).map((item) => {
            return <Tab key={item} label={item} value={item} />;
          })}
        </Tabs>
        {currentTab === TAB.BASIC && <div>asdsda</div>}
        {currentTab === TAB.EXTRA && (
          <Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Container sx={{ flexGrow: 1, overflow: 'auto' }}>
              <SchemaForm
                schema={schemaObj}
                formData={{}}
                onValueChange={(val) => {
                  console.log('cc: ', val);
                }}
              />
            </Container>
            <Stack
              direction='row'
              spacing={2}
              sx={{
                mt: 'auto!important',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button variant='contained'>Confirm</Button>
              <Button variant='outlined'>Cancel</Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
