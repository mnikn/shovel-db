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
      {schema instanceof SchemaFieldObject && (
        <Grid
          item
          xs={schema.config.colSpan}
          className='border border-gray-300 rounded-md p-2'
          key={schema.config.fieldId}
        >
          <FormControl
            sx={{
              maxHeight: '500px',
              width: '100%',
              border: '1px solid rgb(192, 192, 192)',
              ...borderRadius.normal,
              p: 1,
            }}
          >
            {obj && (
              <FormLabel id={schema.config.fieldId}>
                {obj?.name || obj?.id}
              </FormLabel>
            )}
            <FieldContainer
              translations={translations}
              currentLang={currentLang}
              key={schema.config.fieldId}
              aria-labelledby={schema.config.fieldId}
              schema={schema}
              value={val}
              onValueChange={(v) => handleValueChange(v, obj)}
              isRoot={false}
            />
          </FormControl>
        </Grid>
      )}
    </>
  );
  if (schema instanceof SchemaFieldObject) {
    return (
      <Grid
        container
        spacing={2}
        sx={{
          p: isRoot ? 0 : 2,
        }}
      >
        {schema.fields.map((item, i) => {
          if (item.data.config.enableWhen) {
            const fn = eval(item.data.config.enableWhen);
            if (!fn(value)) {
              return null;
            }
          }
          //   if (item.data.type === SchemaFieldType.Number) {
          //     return (
          //       <div
          //         style={{
          //           gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
          //         }}
          //         key={item.id}
          //       >
          //         <FieldNumber
          //           label={item.name || item.id}
          //           schema={item.data as SchemaFieldNumber}
          //           value={value[item.id]}
          //           onValueChange={(v) => objectValueChange(v, item.id)}
          //         />
          //       </div>
          //     );
          //   }

          //   if (item.data.type === SchemaFieldType.Select) {
          //     return (
          //       <div
          //         style={{
          //           gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
          //         }}
          //         key={item.id}
          //       >
          //         <FieldSelect
          //           label={item.name || item.id}
          //           schema={item.data as SchemaFieldSelect}
          //           value={value[item.id]}
          //           onValueChange={(v) => objectValueChange(v, item.id)}
          //         />
          //       </div>
          //     );
          //   }

          //   if (item.data.type === SchemaFieldType.ActorSelect) {
          //     return (
          //       <div
          //         style={{
          //           gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
          //         }}
          //         key={item.id}
          //       >
          //         <FieldActorSelect
          //           label={item.name || item.id}
          //           schema={item.data as SchemaFieldActorSelect}
          //           value={value[item.id]}
          //           onValueChange={(v) => objectValueChange(v, item.id)}
          //         />
          //       </div>
          //     );
          //   }

          //   if (item.data.type === SchemaFieldType.File) {
          //     return (
          //       <div
          //         style={{
          //           gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
          //         }}
          //         key={item.id}
          //       >
          //         <FieldFile
          //           label={item.name || item.id}
          //           schema={item.data as SchemaFieldFile}
          //           value={value[item.id]}
          //           onValueChange={(v) => objectValueChange(v, item.id)}
          //         />
          //       </div>
          //     );
          //   }

          //   if (item.data.type === SchemaFieldType.Boolean) {
          //     return (
          //       <div
          //         style={{
          //           gridColumn: `span ${item.data.config.colSpan} / span ${item.data.config.colSpan}`,
          //         }}
          //         key={item.id}
          //       >
          //         <FieldBoolean
          //           label={item.name || item.id}
          //           schema={item.data as SchemaFieldBoolean}
          //           value={value[item.id]}
          //           onValueChange={(v) => objectValueChange(v, item.id)}
          //         />
          //       </div>
          //     );
          //   }

          //   if (item.data.type === SchemaFieldType.Object) {
          //     return (
          //       <Grid
          //         item
          //         xs={item.data.config.colSpan}
          //         className='border border-gray-300 rounded-md p-2'
          //         key={item.data.config.fieldId}
          //       >
          //         <FormControl
          //           sx={{
          //             maxHeight: '500px',
          //             width: '100%',
          //             border: '1px solid rgb(192, 192, 192)',
          //             ...borderRadius.normal,
          //             p: 1,
          //           }}
          //         >
          //           <FormLabel id={item.data.config.fieldId}>
          //             {item.name}
          //           </FormLabel>
          //           <FieldContainer
          //             key={item.data.config.fieldId}
          //             aria-labelledby={item.data.config.fieldId}
          //             schema={item.data}
          //             value={get(value, item.id)}
          //             onValueChange={(v) => objectValueChange(v, item.id)}
          //           />
          //         </FormControl>
          //       </Grid>
          //     );
          //   }

          if (item.data.type === SchemaFieldType.Array) {
            return (
              <FieldArray
                key={item.id}
                label={item.name || item.id}
                schema={item.data as SchemaFieldArray}
                translations={translations}
                currentLang={currentLang}
                value={get(value, item.id)}
                onValueChange={(v) => objectValueChange(v, item.id)}
              />
            );
          }

          return renderContent(item.data, get(value, item.id), item);
        })}
      </Grid>
    );
  }
  return renderContent(schema, value);
  //   else if (schema.type === SchemaFieldType.Number) {
  //     return (
  //       <div
  //         className={className}
  //         style={{
  //           gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
  //         }}
  //       >
  //         <FieldNumber
  //           schema={schema as SchemaFieldNumber}
  //           value={value}
  //           onValueChange={(v) => {
  //             if (onValueChange) {
  //               onValueChange(v);
  //             }
  //           }}
  //         />
  //       </div>
  //     );
  //   } else if (schema.type === SchemaFieldType.Select) {
  //     return (
  //       <div
  //         className={className}
  //         style={{
  //           gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
  //         }}
  //       >
  //         <FieldSelect
  //           schema={schema as SchemaFieldSelect}
  //           value={value}
  //           onValueChange={(v) => {
  //             if (onValueChange) {
  //               onValueChange(v);
  //             }
  //           }}
  //         />
  //       </div>
  //     );
  //   }
  //   else if (schema.type === SchemaFieldType.ActorSelect) {
  //     return (
  //       <div
  //         className={className}
  //         style={{
  //           gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
  //         }}
  //       >
  //         <FieldActorSelect
  //           schema={schema as SchemaFieldActorSelect}
  //           value={value}
  //           onValueChange={(v) => {
  //             if (onValueChange) {
  //               onValueChange(v);
  //             }
  //           }}
  //         />
  //       </div>
  //     );
  //   } else if (schema.type === SchemaFieldType.File) {
  //     return (
  //       <div
  //         className={className}
  //         style={{
  //           gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
  //         }}
  //       >
  //         <FieldFile
  //           schema={schema as SchemaFieldFile}
  //           value={value}
  //           onValueChange={(v) => {
  //             if (onValueChange) {
  //               onValueChange(v);
  //             }
  //           }}
  //         />
  //       </div>
  //     );
  //   } else if (schema.type === SchemaFieldType.Boolean) {
  //     return (
  //       <div
  //         className={className}
  //         style={{
  //           gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
  //         }}
  //       >
  //         <FieldBoolean
  //           schema={schema as SchemaFieldBoolean}
  //           value={value}
  //           onValueChange={(v) => {
  //             if (onValueChange) {
  //               onValueChange(v);
  //             }
  //           }}
  //         />
  //       </div>
  //     );
  //   }
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
  translations: Translation;
  currentLang: LANG;
  onValueChange?: (value: any) => void;
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
    <div
      className='border border-gray-300 rounded-md p-2 flex flex-col'
      style={{
        gridColumn: `span ${schema.config.colSpan} / span ${schema.config.colSpan}`,
      }}
    >
      <div className='font-bold self-center mb-2'>{label}</div>
      <div className='flex flex-col w-full'>
        <div
          className='flex flex-col w-full overflow-auto'
          style={{
            height: '200px',
          }}
        >
          {list.map((item, i) => {
            return (
              <div key={item.id} className='flex w-full items-center'>
                <div className='flex flex-grow w-full mb-2 items-center'>
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
                </div>
              </div>
            );
          })}
        </div>
        <button
          className='w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center'
          onClick={addItem}
        >
          {/* <CgMathPlus className='mr-2' />  */}
          Add Item
        </button>
      </div>
    </div>
  );
}
