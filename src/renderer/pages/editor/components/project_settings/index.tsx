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
import React, { useMemo, useState } from 'react';
import { borderRadius } from '../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import ActorSettings from './actor_settings';
import { grey } from '@mui/material/colors';
import CodeSettings from './code_settings';
import {
  useExplorerStore,
  useProjectStore,
  useStaticDataStore,
  useStoryStore,
} from '../../../../store';
import { DEFAULT_CONFIG, DEFAULT_CONFIG_JSON } from '../../../../models/schema';
import { buildSchema } from '../../../../models/schema/factory';

enum TAB {
  Story = 'Story',
  StaticData = 'Static Data',
}

let isInject = false;
const editorDidMount = (_, monaco: any) => {
  if (isInject) {
    return;
  }
  const createDependencyProposals = (range) => {
    const fieldObj = {
      your_field: {
        name: 'your_field',
        config: {},
      },
    };
    const formatInnerField = (obj: any) => {
      const objStr = JSON.stringify(obj, null, 2);
      return objStr.substring(1, objStr.length - 1);
    };
    let snippets = [
      {
        label: 'object',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'array',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.ARR_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'string',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.STR_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'boolean',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.BOOLEAN_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'number',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.NUM_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'select',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.SELECT_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'file',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: JSON.stringify(DEFAULT_CONFIG_JSON.FILE_JSON, null, 2),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'numberField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.NUM_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'stringField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.STR_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'booleanField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.BOOLEAN_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'selectField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.SELECT_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'arrayField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.ARR_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'objectField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.OBJECT_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'fileField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField({
          ...fieldObj,
          your_field: {
            ...fieldObj.your_field,
            ...DEFAULT_CONFIG_JSON.FILE_JSON,
          },
        }),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'field',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        insertText: formatInnerField(fieldObj),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
    ];
    return snippets;
  };

  /* monaco.languages.unregisterCompletionItemProvider('schema-json-config'); */
  monaco.languages.registerCompletionItemProvider('json', {
    provideCompletionItems: (model, position) => {
      var word = model.getWordUntilPosition(position);
      var range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: createDependencyProposals(range),
      };
    },
  });
  isInject = true;
};

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
  const [
    staticDataCurrentFileSchemaSettingsOpen,
    setStaticDataCurrentFileSchemaSettingsOpen,
  ] = useState(false);
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

  const { fileData, updateSchema } = useStaticDataStore();
  const { currentOpenFile } = useExplorerStore();
  const currentFileSchema =
    fileData?.[currentOpenFile?.id || '']?.schema ||
    JSON.stringify(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON, null, 2);
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
        {currentTab === TAB.StaticData && (
          <Stack spacing={2}>
            <Stack
              direction='row'
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <FormLabel>Current file:</FormLabel>
              <Button
                variant='outlined'
                onClick={() => {
                  setStaticDataCurrentFileSchemaSettingsOpen(true);
                }}
              >
                Edit schema
              </Button>
            </Stack>
            {staticDataCurrentFileSchemaSettingsOpen && (
              <CodeSettings
                lang='json'
                open
                value={currentFileSchema}
                onValueChange={(val) => {
                  if (!currentOpenFile) {
                    return;
                  }
                  updateSchema(currentOpenFile.id, val);
                }}
                onEditorMounted={editorDidMount}
                close={() => {
                  setStaticDataCurrentFileSchemaSettingsOpen(false);
                }}
              />
            )}
          </Stack>
        )}
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
