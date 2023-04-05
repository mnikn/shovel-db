import { Box, Container, TextField, Stack, FormLabel } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { get, set } from 'lodash';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { LANG } from '../../../../../../constants/i18n';
import { SchemaFieldString } from '../../../../../models/schema';
import { Translation } from '../../../../../store/story/translation';

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
  translations: Translation;
  currentLang: LANG;
  onValueChange?: (value: any) => void;
}) {
  //   const { updateTranslateKey, translations, currentLang } = useStoryStore();

  const [contentValue, setContentValue] = useState(
    schema.config.needI18n
      ? get(translations, `${value}.${currentLang}`) || ''
      : value
  );

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
          />
        </Stack>
      )}
    </Box>
  );
}

export default FieldString;
