import React, { useEffect, useMemo, useState } from 'react';
import { Box, Tabs, Tab, Modal, Stack, Button, Container } from '@mui/material';
import { borderRadius } from '../../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from '../../../../../models/schema';
import SchemaForm from '../../../components/schema_form';
import {
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import { RawJson } from '../../../../../../type';
import { useStoryStore } from '../../../../../store';
import { cloneDeep } from 'lodash';
import { grey } from '@mui/material/colors';

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
        },
        {
          name: 'Enable check',
          id: 'enableCheck',
          data: new SchemaFieldString({
            type: 'code',
            colSpan: 12,
            codeLang: 'python',
          }),
        }
      );
      break;
    }
    case 'branch': {
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
        },
        {
          name: 'Enable check',
          id: 'enableCheck',
          data: new SchemaFieldString({
            type: 'code',
            colSpan: 12,
            codeLang: 'python',
          }),
        }
      );
      break;
    }
  }
  return schema;
}

const optionSchema = new SchemaFieldObject();
optionSchema.fields.push(
  {
    name: 'name',
    id: 'name',
    data: new SchemaFieldString({
      colSpan: 8,
      needI18n: true,
    }),
  },
  {
    name: 'Control type',
    id: 'controlType',
    data: new SchemaFieldSelect({
      colSpan: 4,
      options: [
        {
          label: 'disable',
          value: 'disable',
        },
        {
          label: 'visible',
          value: 'visible',
        },
      ],
    }),
  },
  {
    name: 'Control check',
    id: 'controlCheck',
    data: new SchemaFieldString({
      type: 'code',
      colSpan: 12,
      codeLang: 'python',
    }),
  }
);

export default function EditDialog({
  node,
  open,
  close,
}: {
  node: StoryletNode<StoryletNodeData>;
  open: boolean;
  close: () => void;
}) {
  const {
    translations,
    currentLang,
    updateTranslations,
    updateNode,
    trackCurrentState,
    currentStorylet,
  } = useStoryStore();
  const [formNodeData, setFormNodeData] = useState(cloneDeep(node.data));

  useEffect(() => {
    if (open) {
      setCurrentTab('basic');
      setFormNodeData(cloneDeep(node.data));
    }
  }, [open, node.data]);

  const parent = useMemo(() => {
    if (!currentStorylet) {
      return null;
    }
    return currentStorylet.getNodeSingleParent(node.id);
  }, [currentStorylet, node]);

  const tabs = useMemo(() => {
    const res = [
      {
        id: 'basic',
        name: 'Basic',
      },
      {
        id: 'extra',
        name: 'Extra',
      },
    ];

    if (parent instanceof StoryletBranchNode) {
      res.splice(1, 0, {
        id: 'option',
        name: 'Option',
      });
    }
    return res;
  }, [parent]);

  const [currentTab, setCurrentTab] = useState<string>(tabs[0]?.id || '');

  useEffect(() => {
    setCurrentTab(tabs[0]?.id || '');
  }, [tabs]);

  const formTranslations = useMemo(() => {
    return cloneDeep(translations);
  }, [translations, currentTab]);

  useEffect(() => {
    setFormNodeData(cloneDeep(node.data));
  }, [node.data, currentTab]);

  const basicDataSchema = useMemo(() => {
    return generateSchema(node);
  }, [node]);

  const renderSchemaForm = (
    schemaObj: SchemaFieldObject,
    formValue: RawJson,
    onFormValueChanged: (val: RawJson) => void
  ) => (
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
          formData={formValue}
          onValueChange={(val) => {
            onFormValueChanged(val);
          }}
        />
      </Container>
      <br />
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
            trackCurrentState();
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
            borderBottom: `1px solid ${grey[300]}`,
          }}
        >
          {tabs.map((item) => {
            return <Tab key={item.id} label={item.name} value={item.id} />;
          })}
        </Tabs>
        {currentTab === 'basic' &&
          renderSchemaForm(basicDataSchema, formNodeData, (val) => {
            setFormNodeData(val);
          })}
        {currentTab === 'option' &&
          renderSchemaForm(optionSchema, formNodeData.option || {}, (val) => {
            setFormNodeData((prev: RawJson) => {
              return { ...prev, option: val };
            });
          })}
        {currentTab === 'extra' && <></>}
      </Stack>
    </Modal>
  );
}
