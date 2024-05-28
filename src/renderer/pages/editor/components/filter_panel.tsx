import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import {
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Stack,
} from '@mui/material';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from '../../../models/schema';
import FieldNumber from './schema_form/field/number_field';
import FieldSelect from './schema_form/field/select_field';
import FieldString from './schema_form/field/string_field';

function findChildSchema(
  schema: SchemaField | null,
  prop: string
): SchemaField | null {
  if (schema instanceof SchemaFieldObject) {
    const propArr = prop.split('.');

    const directChild = schema.fields.find((f) => {
      return f.id === propArr[0];
    });
    if (directChild) {
      return findChildSchema(directChild.data, prop);
    } else {
      return null;
    }
  } else if (schema instanceof SchemaFieldArray) {
    return findChildSchema(schema.fieldSchema, prop);
  } else {
    return schema;
  }
}

const FilterPanel = ({
  schema,
  filterSettings,
  onFilterChange,
}: {
  schema: SchemaField;
  filterSettings: any;
  onFilterChange?: (val: any) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const [filterValue, setFilterValues] = useState<any>({});

  /* const { schemaConfig, schema } = useContext(Context); */

  const [filterConfig, setFilterConfig] = useState<any[]>([]);

  useLayoutEffect(() => {
    setFilterConfig(
      (filterSettings || []).map((item: any) => {
        const originSchema = findChildSchema(schema, item.prop);
        console.log('cvcv: ', originSchema);
        let fieldSchema: any = null;
        let filterSchema: any = null;
        if (originSchema) {
          if (originSchema.type === 'string') {
            fieldSchema = new SchemaFieldString();
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Include',
                  value: 'include',
                },
                {
                  label: 'Exclude',
                  value: 'exclude',
                },
                {
                  label: 'Equal',
                  value: 'equal',
                },
              ],
            });
          } else if (originSchema.type === 'number') {
            fieldSchema = new SchemaFieldNumber();
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Less',
                  value: 'less',
                },
                {
                  label: 'Less equal',
                  value: 'less_equal',
                },
                {
                  label: 'Bigger',
                  value: 'bigger',
                },
                {
                  label: 'Bigger equal',
                  value: 'bigger_equal',
                },
                {
                  label: 'Equal',
                  value: 'equal',
                },
              ],
            });
          } else if (originSchema.type === 'select') {
            fieldSchema = new SchemaFieldSelect();
            fieldSchema.setup({
              clearable: true,
              options: (originSchema as SchemaFieldSelect).config.options,
            });
            filterSchema = new SchemaFieldSelect();
            filterSchema.setup({
              options: [
                {
                  label: 'Exists',
                  value: 'exists',
                },
                {
                  label: 'Not exists',
                  value: 'not_exists',
                },
              ],
            });
          }
        }
        return {
          ...item,
          schema: fieldSchema,
          filterSchema: filterSchema,
        };
      })
    );
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  }, [filterValue]);

  const filterExpandBtn = (
    <Container
      sx={{
        position: 'absolute',
        width: '100%',
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconButton
        sx={{
          background: '#fff',
          '&:hover': {
            background: '#fff',
          },
        }}
        onClick={() => {
          setExpanded((prev) => !prev);
        }}
      >
        {!expanded && <ArrowDownward />}
        {expanded && <ArrowUpward />}
      </IconButton>
    </Container>
  );
  return (
    <Container>
      {filterExpandBtn}
      {expanded && (
        <Card
          sx={{
            marginTop: '64px',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid container spacing={4} direction='row'>
              {(filterConfig || [])
                .filter((item: any) => !!item.schema)
                .map((item: any, i: number) => {
                  return (
                    <Grid item xs={4} key={i}>
                      {item.schema instanceof SchemaFieldString && (
                        <Stack
                          spacing={1}
                          direction='row'
                          sx={{
                            '*:last-child': {
                              flexGrow: 1,
                            },
                          }}
                        >
                          <FieldSelect
                            schema={item.filterSchema}
                            value={
                              filterValue?.[item.prop]?.filterType ||
                              item.filterSchema.config.options[0]?.value
                            }
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    ...prev[item.prop],
                                    filterType: v,
                                  },
                                };
                              });
                            }}
                          />
                          <FieldString
                            schema={item.schema}
                            value={filterValue?.[item.prop]?.value}
                            label={item.label}
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    value: v,
                                    filterType:
                                      prev[item.prop]?.filterType ||
                                      item.filterSchema.config.options[0]
                                        ?.value,
                                    schema: item.schema,
                                  },
                                };
                              });
                            }}
                          />
                        </Stack>
                      )}
                      {item.schema instanceof SchemaFieldNumber && (
                        <Stack
                          spacing={1}
                          direction='row'
                          sx={{
                            '*:last-child': {
                              flexGrow: 1,
                            },
                          }}
                        >
                          <FieldSelect
                            schema={item.filterSchema}
                            value={
                              filterValue?.[item.prop]?.filterType ||
                              item.filterSchema.config.options[0]?.value
                            }
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    ...prev[item.prop],
                                    filterType: v,
                                  },
                                };
                              });
                            }}
                          />
                          <FieldNumber
                            schema={item.schema}
                            value={filterValue?.[item.prop]?.value}
                            label={item.label}
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    value: v,
                                    filterType:
                                      prev[item.prop]?.filterType ||
                                      item.filterSchema.config.options[0]
                                        ?.value,
                                    schema: item.schema,
                                  },
                                };
                              });
                            }}
                          />
                        </Stack>
                      )}
                      {item.schema instanceof SchemaFieldSelect && (
                        <Stack
                          spacing={1}
                          direction='row'
                          sx={{
                            '*:last-child': {
                              flexGrow: 1,
                            },
                          }}
                        >
                          <FieldSelect
                            schema={item.filterSchema}
                            value={
                              typeof filterValue[item.prop]?.filterType !==
                              'undefined'
                                ? filterValue[item.prop]?.filterType
                                : item.filterSchema.config.options[0]?.value
                            }
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    ...prev[item.prop],
                                    filterType: v,
                                  },
                                };
                              });
                            }}
                          />
                          <FieldSelect
                            schema={item.schema}
                            value={filterValue?.[item.prop]?.value}
                            label={item.label}
                            onValueChange={(v) => {
                              setFilterValues((prev: any) => {
                                return {
                                  ...prev,
                                  [item.prop]: {
                                    value: v,
                                    filterType:
                                      prev[item.prop]?.filterType ||
                                      item.filterSchema.config.options[0]
                                        ?.value,
                                    schema: item.schema,
                                  },
                                };
                              });
                            }}
                          />
                        </Stack>
                      )}
                    </Grid>
                  );
                })}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default FilterPanel;
