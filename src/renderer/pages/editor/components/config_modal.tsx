import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { Button, DialogTitle, Modal, Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { SchemaFieldString } from '../../../models/schema';
import { borderRadius } from '../../../theme';
import FieldString from './schema_form/field/string_field';

const editorMounted = (_, monaco: any) => {
  /* if (isInject) {
   *   return;
   * } */
  const createDependencyProposals = (range) => {
    const fieldObj = {
      your_field: {
        name: 'your_field',
        config: {},
      },
    };
    console.log('ewc');
    const formatInnerField = (obj: any) => {
      const objStr = JSON.stringify(obj, null, 2);
      return objStr.substring(1, objStr.length - 1);
    };
    const snippets = [
      {
        label: 'object',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2), */
        insertText: '',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'array',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.ARR_JSON, null, 2), */
        insertText: '1',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'string',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.STR_JSON, null, 2), */
        insertText: '2',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'boolean',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.BOOLEAN_JSON, null, 2), */
        insertText: '3',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'number',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.NUM_JSON, null, 2), */
        insertText: '4',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'select',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.SELECT_JSON, null, 2), */
        insertText: '5',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'file',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: JSON.stringify(DEFAULT_CONFIG_JSON.FILE_JSON, null, 2), */
        insertText: '6',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'numberField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.NUM_JSON,
         *   },
         * }), */
        insertText: '7',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'stringField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.STR_JSON,
         *   },
         * }), */
        insertText: '8',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'booleanField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.BOOLEAN_JSON,
         *   },
         * }), */
        insertText: '9',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'selectField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.SELECT_JSON,
         *   },
         * }), */
        insertText: '10',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'arrayField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.ARR_JSON,
         *   },
         * }), */
        insertText: '11',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'objectField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.OBJECT_JSON,
         *   },
         * }), */
        insertText: '12',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      {
        label: 'fileField',
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: 'object field',
        /* insertText: formatInnerField({
         *   ...fieldObj,
         *   your_field: {
         *     ...fieldObj.your_field,
         *     ...DEFAULT_CONFIG_JSON.FILE_JSON,
         *   },
         * }), */
        insertText: '22',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      },
      /* {
       *   label: 'field',
       *   kind: monaco.languages.CompletionItemKind.Snippet,
       *   documentation: 'object field',
       *   insertText: formatInnerField(fieldObj),
       *   insertTextRules:
       *     monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
       *   range: range,
       * }, */
    ];
    return snippets;
  };

  /* monaco.languages.unregisterCompletionItemProvider('schema-json-config'); */
  monaco.languages.registerCompletionItemProvider('toml', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
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
  /* isInject = true; */
};

const ConfigModal = ({
  close,
  lang,
  value,
  onValueChange,
}: {
  close: () => void;
  lang: string;
  value: string;
  onValueChange: (val: string) => void;
}) => {
  const [formData, setFormData] = useState<string>(value);

  const schemaObj = useMemo(() => {
    return new SchemaFieldString({
      colSpan: 12,
      type: 'code',
      codeLang: lang,
      /* height: '500px', */
      flexGrow: 1,
      editorMounted,
    });
  }, [lang]);

  return (
    <Modal open>
      <Stack
        spacing={4}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px',
          height: '560px',
          bgcolor: 'background.paper',
          outline: 'none',
          boxShadow: 24,
          flexGrow: 1,
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
        <DialogTitle
          sx={{
            p: 0,
            m: 0,
            marginTop: '0!important',
          }}
        >
          Code Settings
        </DialogTitle>

        <FieldString
          schema={schemaObj}
          value={formData}
          onValueChange={(v) => {
            setFormData(v);
          }}
        />

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
              onValueChange(formData);
              close();
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ConfigModal;
