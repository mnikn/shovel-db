// import classNames from 'classnames';
import get from 'lodash/get';
import React, { useEffect, useState, useCallback } from 'react';
// import { CgArrowDown, CgArrowUp, CgMathPlus, CgRemove } from 'react-icons/cg';
import {
  SchemaField,
  SchemaFieldActorSelect,
  SchemaFieldArray,
  SchemaFieldBoolean,
  SchemaFieldFile,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
  SchemaFieldType,
} from '../../../../../models/schema';
import { UUID } from '../../../../../../utils/uuid';
// import FieldActorSelect from './actor_select_field';
// import FieldBoolean from './boolean_field';
// import FieldFile from './file_field';
// import FieldNumber from './number_field';
// import FieldSelect from './select_field';
import FieldString from './string_field';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Stack,
} from '@mui/material';
import { RawJson } from '../../../../../../type';
import { borderRadius } from '../../../../../theme';
import { Translation } from '../../../../../store/story/translation';
import { LANG } from '../../../../../../constants/i18n';
import { grey } from '@mui/material/colors';
import FieldFile from './file_field';

export function FieldContainer({
  schema,
  value,
  onValueChange,
  translations,
  currentLang,
  isRoot,
}: {
  schema: SchemaField;
  value: any;
  translations: Translation;
  currentLang: LANG;
  onValueChange?: (value: any) => void;
  isRoot: boolean;
}) {
  const objectValueChange = useCallback(
    (v: any, id: string) => {
      if (onValueChange) {
        onValueChange({
          ...value,
          [id]: v,
        });
      }
    },
    [value, onValueChange]
  );

  const handleValueChange = useCallback(
    (v: any, obj?: any) => {
      if (obj) {
        objectValueChange(v, obj.id);
      } else {
        if (onValueChange) {
          onValueChange(v);
        }
      }
    },
    [objectValueChange, onValueChange]
  );

  const renderContent = (
    schema: SchemaField,
    val: any,
    obj?: { name: string; id: string; data: SchemaField }
  ) => (
    <>
      {schema instanceof SchemaFieldString && (
        <Grid item xs={schema.config.colSpan} key={schema.config.fieldId}>
          <FieldString
            label={obj?.name || obj?.id}
            schema={schema}
            value={val}
            translations={translations}
            currentLang={currentLang}
            onValueChange={(v) => handleValueChange(v, obj)}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldFile && (
        <Grid item xs={schema.config.colSpan} key={schema.config.fieldId}>
          <FieldFile
            label={obj?.name || obj?.id}
            schema={schema}
            value={val}
            onValueChange={(v) => handleValueChange(v, obj)}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldObject && (
        <Grid
          item
          xs={schema.config.colSpan}
          key={schema.config.fieldId}
          sx={{
            border: `1px solid ${grey[400]}`,
            ...borderRadius.normal,
            alignItems: 'center',
            m: 2,
            pr: 2,
            pb: 2,
          }}
        >
          <Container
            sx={{
              maxHeight: '500px',
              width: '100%',
              //   p: 1,
            }}
          >
            {obj && (
              <FormLabel id={schema.config.fieldId}>
                {obj?.name || obj?.id}
              </FormLabel>
            )}

            {schema.fields.map((item, i) => {
              if (item.data.config.enableWhen) {
                const fn = eval(item.data.config.enableWhen);
                if (!fn(value)) {
                  return null;
                }
              }
              return renderContent(item.data, get(value, item.id), item);
            })}
          </Container>
        </Grid>
      )}
      {schema instanceof SchemaFieldArray && (
        <FieldArray
          label={obj?.name || obj?.id}
          schema={schema}
          translations={translations}
          currentLang={currentLang}
          value={val}
          onValueChange={(v) => handleValueChange(v, obj)}
          isRoot={isRoot}
        />
      )}
    </>
  );
  if (schema instanceof SchemaFieldObject) {
    return (
      <Grid
        container
        spacing={2}
        rowGap={2}
        sx={{
          //   p: isRoot ? 0 : 1,
          // m: isRoot ? 0 : 1,
          alignItems: 'center',
          border: isRoot ? undefined : `1px solid ${grey[400]}`,
          ...borderRadius.normal,
        }}
      >
        {schema.fields.map((item, i) => {
          if (item.data.config.enableWhen) {
            const fn = eval(item.data.config.enableWhen);
            if (!fn(value)) {
              return null;
            }
          }
          return renderContent(item.data, get(value, item.id), item);
        })}
      </Grid>
    );
  }
  return renderContent(schema, value);
}

export function FieldArray({
  label,
  schema,
  value,
  translations,
  currentLang,
  onValueChange,
  isRoot,
}: {
  label?: string;
  schema: SchemaFieldArray;
  value: any[];
  translations: Translation;
  currentLang: LANG;
  onValueChange?: (value: any) => void;
  isRoot: boolean;
}) {
  const [list, setList] = useState<RawJson[]>(
    (value || []).map((item) => {
      return {
        id: UUID(),
        value: item,
      };
    })
  );
  const addItem = () => {
    setList((prev) => {
      return prev.concat({
        id: UUID(),
        value: schema.fieldSchema.config.needI18n
          ? UUID()
          : schema.fieldSchema.config.defaultValue,
      });
    });
  };

  const moveUpItem = (sourceIndex: number) => {
    setList((prev) => {
      const targetIndex = Math.max(sourceIndex - 1, 0);
      return prev.map((item, j) => {
        if (j === sourceIndex) {
          return prev[targetIndex];
        }
        if (j === targetIndex) {
          return prev[sourceIndex];
        }
        return item;
      }, []);
    });
  };
  const moveDownItem = (sourceIndex: number) => {
    setList((prev) => {
      const targetIndex = Math.min(sourceIndex + 1, prev.length - 1);
      return prev.map((item, j) => {
        if (j === sourceIndex) {
          return prev[targetIndex];
        }
        if (j === targetIndex) {
          return prev[sourceIndex];
        }
        return item;
      }, []);
    });
  };
  const deleteItem = (i: number) => {
    setList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(list.map((item) => item.value));
    }
  }, [list]);

  const onItemChange = (v: any, i: number) => {
    setList((prev) => {
      return prev.map((item, j) =>
        j === i ? { id: item.id, value: v } : item
      );
    });
  };

  return (
    <Grid
      item
      xs={schema.config.colSpan}
      spacing={2}
      rowGap={2}
      sx={{
        p: 2,
        m: 2,
        ml: 3,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: schema.config.fitRestHeight ? 1 : 0,
        overflow: 'auto',
        border: isRoot ? undefined : `1px solid ${grey[400]}`,
        ...borderRadius.normal,
      }}
    >
      <Stack
        spacing={1}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        {label && <FormLabel>{label}</FormLabel>}
        <Stack
          sx={{
            width: '100%',
            flexGrow: 1,
            overflow: 'auto',
            maxHeight: schema.config.height,
          }}
          spacing={1}
        >
          <Stack
            sx={{
              flexGrow: 1,
              width: '100%',
              overflow: 'auto',
            }}
            spacing={1}
          >
            {list.map((item, i) => {
              return (
                <Stack
                  key={item.id}
                  direction={'row'}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    direction='row'
                    sx={{
                      flexGrow: 1,
                      alignItems: 'center',
                    }}
                    spacing={4}
                  >
                    <FieldContainer
                      translations={translations}
                      currentLang={currentLang}
                      schema={schema.fieldSchema as SchemaField}
                      value={item.value}
                      onValueChange={(v) => onItemChange(v, i)}
                      isRoot={false}
                    />
                    {/* <CgArrowUp
                    className='cursor-pointer ml-2 mr-2 text-gray-800 hover:text-gray-500 transition-all flex-shrink-0'
                    onClick={() => moveUpItem(i)}
                  />
                  <CgArrowDown
                    className='cursor-pointer mr-2 text-gray-800 hover:text-gray-500 transition-all flex-shrink-0'
                    onClick={() => moveDownItem(i)}
                  />
                  <CgRemove
                    className='cursor-pointer mr-2 text-gray-800 hover:text-gray-500 transition-all flex-shrink-0'
                    onClick={() => deleteItem(i)}
                  /> */}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
          <Button
            variant='outlined'
            sx={{
              width: '100%',
              marginTop: 'auto',
            }}
            // className='w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center'
            onClick={addItem}
          >
            {/* <CgMathPlus className='mr-2' />  */}
            Add Item
          </Button>
        </Stack>
      </Stack>
    </Grid>
  );
}
