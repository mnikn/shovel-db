import { Box, FormLabel, Stack, TextField } from '@mui/material';
import { get, set } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { LANG } from '../../../../../../constants/i18n';
import { eventEmitter, Event } from '../../../../../events';
import { SchemaFieldString } from '../../../../../models/schema';
import { Translation } from '../../../../../store/common/translation';

function FieldString({
  label,
  schema,
  value,
  onValueChange,
  translations,
  currentLang,
}: {
  label?: string;
  schema: SchemaFieldString;
  value: any;
  translations?: Translation;
  currentLang?: LANG;
  onValueChange?: (value: any) => void;
}) {
  const [contentValue, setContentValue] = useState(
    schema.config.needI18n
      ? get(translations, `${value}.${currentLang}`) || ''
      : value
  );
  const [isInjectSnippet, setIsInjectSnippet] = useState<boolean>(false);
  const langRegisteration = useRef<any>(null);

  useEffect(() => {
    setContentValue(
      schema.config.needI18n
        ? get(translations, `${value}.${currentLang}`) || ''
        : value
    );
  }, [currentLang, translations, value]);

  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const textValue = e.target.value;
    setContentValue(textValue);
    if (schema.config.required && !textValue) {
      setErrorText('Text cannot be empty');
      return;
    }
    if (textValue.length < schema.config.minLen) {
      setErrorText(`Text length must more than ${schema.config.minLen}`);
      return;
    }
    if (textValue.length > schema.config.maxLen) {
      setErrorText(`Text length must less than ${schema.config.maxLen}`);
      return;
    }
    if (schema.config.customValidate) {
      const fn = eval(schema.config.customValidate);
      if (fn) {
        const success = fn(textValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange) {
      if (!schema.config.needI18n) {
        onValueChange(textValue);
      }
    }

    const termKey = value;
    if (schema.config.needI18n) {
      set(translations, `${termKey}.${currentLang}`, textValue);
      if (onValueChange) {
        onValueChange(value);
      }
    }
  };

  useEffect(() => {
    const reset = () => {
      if (langRegisteration.current) {
        langRegisteration.current.dispose();
      }
    };
    eventEmitter.on(Event.CodeEditorResetLangRegisteration, reset);
    return () => {
      eventEmitter.off(Event.CodeEditorResetLangRegisteration, reset);
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
      }}
    >
      {schema.config.type !== 'code' && (
        <TextField
          sx={{
            width: '100%',
            height: '100%',
          }}
          required={schema.config.required}
          label={label}
          size='small'
          multiline={schema.config.type === 'multiline'}
          rows={schema.config.type === 'multiline' ? 4 : undefined}
          value={contentValue || schema.config.defaultValue}
          onChange={onTextChange}
          autoFocus={schema.config.autoFocus}
        />
      )}

      {schema.config.type === 'code' && (
        <Stack
          spacing={1}
          sx={{
            width: '100%',
            height: schema.config.height || '300px',
            flexGrow: schema.config.flexGrow || 0,
            position: 'relative',
          }}
        >
          {label && <FormLabel>{label}</FormLabel>}
          <MonacoEditor
            width='100%'
            height='100%'
            language={schema.config.codeLang}
            theme='vs-dark'
            value={contentValue}
            options={{
              insertSpaces: true,
              autoIndent: 'full',
              automaticLayout: true,
              minimap: {
                enabled: false,
              },
              tabSize: 2,
              scrollbar: {
                horizontal: 'auto',
                vertical: 'auto',
              },
            }}
            onChange={(v) => {
              if (onValueChange) {
                onValueChange(v);
              }
            }}
            editorDidMount={(editor, monaco: any) => {
              editor.onDidFocusEditorWidget(() => {
                if (isInjectSnippet) {
                  return;
                }
                if (schema.config.codeSnippets) {
                  eventEmitter.emit(Event.CodeEditorResetLangRegisteration);
                  const createDependencyProposals = (range) => {
                    return schema.config.codeSnippets.map((item) => {
                      return {
                        label: item.label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: item.code,
                        insertTextRules:
                          monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                        range: range,
                      };
                    });
                  };
                  langRegisteration.current =
                    monaco.languages.registerCompletionItemProvider(
                      schema.config.codeLang,
                      {
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
                      }
                    );
                  setIsInjectSnippet(true);
                }
              });
              if (schema.config.submitForm) {
                editor.addAction({
                  id: 'submit-form',
                  label: 'Submit form',
                  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                  precondition: undefined,
                  keybindingContext: undefined,
                  contextMenuGroupId: 'navigation',
                  contextMenuOrder: 1.5,
                  run: function () {
                    schema.config.submitForm();
                  },
                });
              }
              if (schema.config.cancelSubmitForm) {
                editor.addAction({
                  id: 'cancel-submit-form',
                  label: 'Cancel submit form',
                  keybindings: [
                    monaco.KeyMod.CtrlCmd |
                      monaco.KeyMod.Shift |
                      monaco.KeyCode.Enter,
                  ],
                  precondition: undefined,
                  keybindingContext: undefined,
                  contextMenuGroupId: 'navigation',
                  contextMenuOrder: 1.5,
                  run: function (ed) {
                    schema.config.cancelSubmitForm();
                  },
                });
              }

              if (schema.config?.editorMounted) {
                return schema.config?.editorMounted(editor, monaco);
              }
            }}
          />
        </Stack>
      )}
    </Box>
  );
}

export default FieldString;
