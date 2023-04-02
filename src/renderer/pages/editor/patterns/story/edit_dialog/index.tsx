import React, { useEffect, useMemo, useState } from 'react';
import { Box, Tabs, Tab, Modal, Stack, Button, Container } from '@mui/material';
import { borderRadius } from '../../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../../models/schema';
import SchemaForm from '../../../components/schema_form';
import {
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import { RawJson } from '../../../../../../type';
import { useStoryStore } from '../../../../../store';
import { cloneDeep } from 'lodash';

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

function generateSchema(node: StoryletNode<StoryletNodeData>) {
  const schema = new SchemaFieldObject();
  switch (node.idPrefix) {
    case 'sentence': {
      schema.fields.push(
        {
          name: 'Custom node id',
          id: 'customNodeId',
          data: new SchemaFieldString({
            colSpan: 4,
          }),
        },
        {
          name: 'Content',
          id: 'content',
          data: new SchemaFieldString({
            type: 'multiline',
            colSpan: 12,
            autoFocus: true,
            needI18n: true,
          }),
        }
      );
    }
  }
  return schema;
}

export default function EditDialog({
  node,
  open,
  close,
}: {
  node: StoryletNode<StoryletNodeData>;
  open: boolean;
  close: () => void;
}) {
  const [currentTab, setCurrentTab] = useState<TAB>(TAB.BASIC);
  const { translations, currentLang, updateTranslations, updateNode } =
    useStoryStore();
  const [formNodeData, setFormNodeData] = useState(cloneDeep(node.data));

  const formTranslations = useMemo(() => {
    return cloneDeep(translations);
  }, [translations, currentTab]);

  useEffect(() => {
    setFormNodeData(cloneDeep(node.data));
  }, [node.data, currentTab]);

  const basicDataSchema = useMemo(() => {
    return generateSchema(node);
  }, [node]);

  const renderSchemaForm = (schemaObj: SchemaFieldObject, value: RawJson) => (
    <Stack
      key={schemaObj.config.fieldId}
      spacing={2}
      sx={{ flexGrow: 1, overflow: 'auto' }}
    >
      <Container sx={{ flexGrow: 1, overflow: 'auto' }}>
        <SchemaForm
          translations={formTranslations}
          currentLang={currentLang}
          schema={schemaObj}
          formData={value}
          onValueChange={(val) => {
            setFormNodeData(val);
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
        <Button
          variant='contained'
          onClick={() => {
            updateTranslations(formTranslations);
            node.data = formNodeData;
            updateNode(node);
            close();
          }}
        >
          Confirm
        </Button>
        <Button variant='outlined' onClick={close}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
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
        {currentTab === TAB.BASIC &&
          renderSchemaForm(basicDataSchema, formNodeData)}
        {currentTab === TAB.EXTRA && renderSchemaForm(schemaObj, {})}
      </Stack>
    </Modal>
  );
}
