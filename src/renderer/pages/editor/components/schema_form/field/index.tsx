import {
  Button,
  Box,
  Stack,
  IconButton,
  Card,
  CardHeader,
  Collapse,
  CardContent,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { LANG } from '../../../../../../constants/i18n';
import { RawJson } from '../../../../../../type';
import { UUID } from '../../../../../../utils/uuid';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldBoolean,
  SchemaFieldFile,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from '../../../../../models/schema';
import { borderRadius, animation } from '../../../../../theme';
import FieldFile from './file_field';
import FieldString from './string_field';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import FieldSelect from './select_field';
import FieldBoolean from './boolean_field';
import { Translation } from '../../../../../store/common/translation';
import FieldNumber from './number_field';

const getContainerLabelStyle = (label) => ({
  m: 1,
  pt: 4,
  border: `1px solid ${grey[400]}`,
  ...borderRadius.normal,
  position: 'relative',
  '&:before': {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: grey[500],
    content: `"${label}"`,
    /* width: '-webkit-fill-available', */
    width: '40%',
    zIndex: 'auto',
    background: 'inherit',
    overflow: 'hidden',
  },
});

export default function Field({
  schema,
  value,
  onValueChange,
  translations,
  currentLang,
  label,
}: {
  schema: SchemaField;
  value: any;
  translations?: Translation;
  currentLang?: LANG;
  onValueChange?: (value: any) => void;
  label?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const gridStyle = label ? getContainerLabelStyle(label) : {};

  return (
    <>
      {schema instanceof SchemaFieldObject && (
        <Grid
          xs={schema.config.colSpan}
          sx={{
            ...gridStyle,
            background: '#fff',
            width: '-webkit-fill-available',
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {schema.fields
              .filter((field) => {
                if (field.data.config.enableWhen) {
                  const fn = eval(field.data.config.enableWhen);
                  console.log('dd: ', fn(value));
                  if (!fn(value)) {
                    return false;
                  }
                }
                return true;
              })
              .map((field) => {
                return (
                  <Field
                    key={field.data.config.fieldId}
                    schema={field.data}
                    value={get(value, field.id)}
                    onValueChange={(v) => {
                      if (onValueChange) {
                        onValueChange({
                          ...value,
                          [field.id]: v,
                        });
                      }
                    }}
                    label={field.name}
                    translations={translations}
                    currentLang={currentLang}
                  />
                );
              })}
          </Grid>
        </Grid>
      )}
      {schema instanceof SchemaFieldArray && (
        <FieldArray
          schema={schema}
          value={value}
          onValueChange={onValueChange}
          translations={translations}
          currentLang={currentLang}
          label={label}
        />
      )}
      {schema instanceof SchemaFieldString && (
        <Grid xs={schema.config.colSpan}>
          <FieldString
            schema={schema}
            value={value}
            onValueChange={onValueChange}
            translations={translations}
            currentLang={currentLang}
            label={label}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldBoolean && (
        <Grid xs={schema.config.colSpan}>
          <FieldBoolean
            schema={schema}
            value={value}
            onValueChange={onValueChange}
            label={label}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldNumber && (
        <Grid xs={schema.config.colSpan}>
          <FieldNumber
            schema={schema}
            value={value}
            onValueChange={onValueChange}
            label={label}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldFile && (
        <Grid xs={schema.config.colSpan}>
          <FieldFile
            schema={schema}
            value={value}
            onValueChange={onValueChange}
            label={label}
          />
        </Grid>
      )}
      {schema instanceof SchemaFieldSelect && (
        <Grid xs={schema.config.colSpan}>
          <FieldSelect
            schema={schema}
            value={value}
            onValueChange={onValueChange}
            label={label}
          />
        </Grid>
      )}
    </>
  );
}

export function FieldArray({
  label,
  schema,
  value,
  translations,
  currentLang,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldArray;
  value: any[];
  translations?: Translation;
  currentLang?: LANG;
  onValueChange?: (value: any) => void;
}) {
  const [list, setList] = useState<RawJson[]>(
    (value || []).map((item) => {
      return {
        id: UUID(),
        expanded: false,
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
          : schema.fieldSchema instanceof SchemaFieldObject
          ? schema.fieldSchema.configDefaultValue
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
      return prev.map((item, j) => (j === i ? { ...item, value: v } : item));
    });
  };

  const gridStyle = label ? getContainerLabelStyle(label) : {};
  return (
    <Grid
      sx={{
        display: 'flex',
        flexGrow: label ? 0 : 1,
        flexDirection: 'column',
        overflow: 'auto',
      }}
      xs={schema.config.colSpan}
    >
      <Stack
        spacing={2}
        sx={{
          height: '100%',
          ...gridStyle,
          p: label ? 4 : 0,
        }}
      >
        <Stack
          spacing={2}
          sx={{
            overflow: 'auto',
            flexGrow: 1,
            maxHeight: label ? schema.config.height || '300px' : 'inherit',
            pt: label ? 3 : 0,
          }}
        >
          {list.map((item, i) => {
            return (
              <Card key={item.id}>
                <CardHeader
                  subheader={`#${i + 1}`}
                  action={
                    <>
                      <IconButton onClick={() => moveUpItem(i)}>
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton onClick={() => moveDownItem(i)}>
                        <ArrowDownwardIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteItem(i)}>
                        <RemoveIcon />
                      </IconButton>
                    </>
                  }
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: grey[100],
                      ...animation.autoFade,
                    },
                  }}
                  onClick={() => {
                    setList((prev) => {
                      return prev.map((item, j) =>
                        j === i ? { ...item, expanded: !item.expanded } : item
                      );
                    });
                  }}
                />
                <Collapse in={item.expanded} timeout='auto'>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Field
                      translations={translations}
                      currentLang={currentLang}
                      schema={schema.fieldSchema as SchemaField}
                      value={item.value}
                      onValueChange={(v) => onItemChange(v, i)}
                    />
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Stack>
        <Button
          variant='contained'
          sx={{
            marginTop: 'auto',
          }}
          onClick={addItem}
        >
          Add Item
        </Button>
      </Stack>
    </Grid>
  );
}
