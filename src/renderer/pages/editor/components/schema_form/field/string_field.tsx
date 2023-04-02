import React, { useEffect, useState } from 'react';
import { SchemaFieldString } from '../../../../../models/schema';
// import MonacoEditor from 'react-monaco-editor';
import { get, uniq } from 'lodash';
import { Box, Container, TextField } from '@mui/material';
import { LANG } from '../../../../../../constants/i18n';
import { Translation } from '../../../../../store/story/translation';
import MonacoEditor from 'react-monaco-editor/lib/editor';

// import classNames from 'classnames';

const CodeFieldSchema = new SchemaFieldString();

const Editor = ({
  schema,
  contentValue,
  onValueChange,
}: {
  schema: SchemaFieldString;
  contentValue: any;
  onValueChange?: (value: any) => void;
}) => {
  const fields = uniq(
    (schema.config.template || '')
      .match(/(\{{2}\w*\}{2})/g)
      ?.map((item) => item.substring(2, item.length - 2)) || []
  );

  let finalValue = !schema.config.template
    ? contentValue?.value
    : schema.config.template || '';
  if (schema.config.template) {
    fields.forEach((f) => {
      finalValue = finalValue.replaceAll(
        `{{${f}}}`,
        contentValue.fields[f] || `{{${f}}}`
      );
    });
  }

  return null;

  //   return (
  //     <div className='flex w-full'>
  //       <MonacoEditor
  //         width='100%'
  //         height={schema.config.height}
  //         language={schema.config.codeLang}
  //         theme='vs-dark'
  //         value={finalValue}
  //         options={{
  //           readOnly: !!schema.config.template,
  //           insertSpaces: true,
  //         }}
  //         onChange={(v) => {
  //           if (onValueChange) {
  //             onValueChange({
  //               fields: [],
  //               value: v,
  //             });
  //           }
  //         }}
  //       />
  //       {fields.length > 0 && (
  //         <div className='flex flex-col ml-2'>
  //           {fields.map((f) => {
  //             return (
  //               <FieldString
  //                 label={f}
  //                 schema={CodeFieldSchema}
  //                 value={contentValue.fields[f] || ''}
  //                 onValueChange={(v) => {
  //                   if (onValueChange) {
  //                     onValueChange({
  //                       fields: { ...contentValue.fields, [f]: v },
  //                       value: (schema.config.template || '').replaceAll(
  //                         `{{${f}}}`,
  //                         v
  //                       ),
  //                     });
  //                   }
  //                 }}
  //               />
  //             );
  //           })}
  //         </div>
  //       )}
  //     </div>
  //   );
};

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
    schema.config.needI18n ? translations[value]?.[currentLang] || '' : value
  );

  useEffect(() => {
    setContentValue(
      schema.config.needI18n ? translations[value]?.[currentLang] || '' : value
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
      translations[termKey][currentLang] = textValue;
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
        <Container
          sx={{
            width: '100%',
            height: schema.config.height || '300px',
            position: 'relative',
            p: 4,
            px: '0!important',
          }}
        >
          {label && (
            <Box
              sx={{
                position: 'absolute',
                top: '0px',
              }}
            >
              {label}
            </Box>
          )}
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
        </Container>
      )}
    </Box>
  );
}

export default FieldString;
