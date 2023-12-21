import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
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
  ActionType,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import { RawJson } from '../../../../../../type';
import { useStoryStore } from '../../../../../stores';
import { cloneDeep } from 'lodash';
import { grey } from '@mui/material/colors';
import { buildSchema } from '../../../../../models/schema/factory';
import { getProjectService } from '../../../../../services';
import path from 'path';

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
    updateTranslateKey,
    updateNode,
    currentStorylet,
    actors,
    nodeSchemaSettings,
    tr,
  } = useStoryStore();
  const [formNodeData, setFormNodeData] = useState(cloneDeep(node.data));
  const formNodeDataRef = useRef(formNodeData);
  formNodeDataRef.current = formNodeData;

  const parent = useMemo(() => {
    if (!currentStorylet) {
      return null;
    }
    return currentStorylet.getNodeSingleParent(node.id);
  }, [currentStorylet, node]);

  const extraDataShcema = useMemo(() => {
    return buildSchema(
      JSON.parse(nodeSchemaSettings[node.data.type]?.extraDataSchema || '{}')
    ) as SchemaFieldObject;
  }, [nodeSchemaSettings]);

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

  const submitForm = useCallback(() => {
    node.data = { ...node.data, ...formNodeDataRef.current };
    if (
      (node instanceof StoryletSentenceNode ||
        node instanceof StoryletBranchNode) &&
      !node.data.actor?.id
    ) {
      node.data.actor = null;
    }
    updateNode(node);
    close();
  }, [node, updateNode, close]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Enter' && e.ctrlKey) {
        if (e.shiftKey) {
          close();
        } else {
          submitForm();
        }
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [close, submitForm]);

  const basicDataSchema = useMemo(() => {
    const basicsDataMap = {
      root: buildSchema(JSON.parse(nodeSchemaSettings.root.basicDataSchema)),
      sentence: buildSchema(
        JSON.parse(nodeSchemaSettings.sentence.basicDataSchema)
      ),
      branch: buildSchema(
        JSON.parse(nodeSchemaSettings.branch.basicDataSchema)
      ),
      action: buildSchema(
        JSON.parse(nodeSchemaSettings.action.basicDataSchema)
      ),
    };
    const res = basicsDataMap[node.data.type] as SchemaFieldObject;
    // handle actor options
    const actorField = res.fields.find((field) => {
      return field.id === 'actor';
    });
    if (actorField) {
      actorField.data.config.options = actors.map((actor) => {
        return {
          label: tr(actor.name),
          value: actor.id,
          children: [{ label: 'none', value: '' }].concat(
            actor.portraits.map((portrait) => {
              return {
                label: portrait.id,
                value: portrait.id,
              };
            })
          ),
        };
      });
      actorField.data.config.options.unshift({
        label: 'none',
        value: '',
      });
      actorField.data.config.groupConfig = {
        group: {
          valueKey: 'id',
          label: 'id',
          renderMenuItem: (v, item) => {
            return (
              <>
                {v
                  ? tr(actors.find((item) => item.id === v)?.name || '')
                  : item.label}
              </>
            );
          },
        },
        child: {
          valueKey: 'portrait',
          label: 'portrait',
          renderMenuItem: (p, c, item) => {
            const portraitItem = actors
              .find((item) => item.id === p)
              ?.portraits.find((z) => z.id === c);
            const projectPath = getProjectService().projectPath.value;
            const portraitPath: any =
              projectPath && portraitItem?.pic
                ? path.join(
                    path.join(projectPath, 'resources'),
                    portraitItem?.pic
                  )
                : null;
            return (
              <Stack direction='row' sx={{ alignItems: 'center', px: 2 }}>
                {p && c && (
                  <Box
                    sx={{
                      marginRight: '12px',
                      backgroundColor: grey[800],
                      ...borderRadius.normal,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.5,
                    }}
                  >
                    <img
                      style={{
                        width: '24px',
                        height: 'auto',
                      }}
                      src={portraitPath || ''}
                    />
                  </Box>
                )}
                {portraitItem?.id || item?.label}
              </Stack>
            );
          },
        },
      };
    }
    res.allChildFields.forEach((item) => {
      if (item instanceof SchemaFieldString && item.config.type === 'code') {
        item.config.submitForm = submitForm;
        item.config.cancelSubmitForm = close;
      }
    });
    return res;
  }, [node, actors, tr, submitForm, close, nodeSchemaSettings]);

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
          translations={translations}
          currentLang={currentLang}
          schema={schemaObj}
          formData={formValue}
          onValueChange={(val) => {
            onFormValueChanged(val);
          }}
          onTranslationsChange={(termKey, val) => {
            updateTranslateKey(termKey, val);
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
        <Button variant='outlined' onClick={close}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => {
            submitForm();
          }}
        >
          Confirm
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
        {currentTab === 'extra' &&
          renderSchemaForm(extraDataShcema, formNodeData.extraData, (val) => {
            setFormNodeData((prev: RawJson) => {
              return { ...prev, extraData: val };
            });
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
