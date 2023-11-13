import { DEFAULT_CONFIG_JSON } from '../models/schema';

export function injectSchemaSnippets(_, monaco: any) {
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
    ];
    return snippets;
  };

  /* monaco.languages.unregisterCompletionItemProvider('schema-json-config'); */
  monaco.languages.registerCompletionItemProvider('json', {
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
}
