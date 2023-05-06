import { UUID } from '../../../utils/uuid';
import { RawJson } from '../../../type';
import { isObject } from 'util';
import { isArray } from 'util';

export function findChildSchema(
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
    let propArr = prop.split('.');
    if (propArr[0].match(/\[(0-9)+\]/)) {
      propArr = propArr.splice(0, 1);
    }
    return findChildSchema(schema.fieldSchema, propArr.join('.'));
  } else {
    return schema;
  }
}

export function processValueWithSchema(
  rootSchema: SchemaField | null,
  val: any,
  fn: (propSchema: SchemaField, propVal: any) => any
): any {
  if (val == null || rootSchema === null) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((v) =>
      processValueWithSchema(
        (rootSchema as SchemaFieldArray).fieldSchema,
        v,
        fn
      )
    );
  }

  if (val !== null && typeof val === 'object') {
    return Object.keys(val).reduce((res, k) => {
      const fieldSchemaItem = (rootSchema as SchemaFieldObject).fields.find(
        (f) => f.id === k
      );
      res[k] = processValueWithSchema(
        fieldSchemaItem?.data || null,
        val[k],
        fn
      );
      return res;
    }, {});
  }
  return fn(rootSchema, val);
}

export function iterSchema(
  schema: SchemaField | null,
  fn: (item: SchemaField, path: string, label?: string) => void,
  path = '',
  label = ''
) {
  if (!schema) {
    return;
  }
  fn(schema, path, label);
  if (schema instanceof SchemaFieldArray) {
    iterSchema(schema.fieldSchema, fn, path, label);
  }
  if (schema instanceof SchemaFieldObject) {
    schema.fields.forEach((f) => {
      iterSchema(f.data, fn, path ? path + '.' + f.id : f.id, f.name);
    });
  }
}

export function validateValue(
  totalObjValue: any,
  value: any,
  schema: SchemaField,
  schemaConfig: any
): any {
  if (schema.config.enableWhen) {
    const fn = eval(schema.config.enableWhen);
    if (!fn(totalObjValue)) {
      return undefined;
      // return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Array) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        return validateValue(
          item,
          item,
          (schema as SchemaFieldArray).fieldSchema,
          schemaConfig
        );
      });
    } else {
      return [...schema.config.defaultValue];
    }
  }
  if (schema.type === SchemaFieldType.Object) {
    if (typeof value === 'object' && value !== null) {
      const objFields = (schema as SchemaFieldObject).fields.map((t) => t.id);
      const r1 = Object.keys(value).reduce((res2: any, key) => {
        if (objFields.includes(key)) {
          res2[key] = validateValue(
            value,
            value[key],
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data as SchemaField,
            schemaConfig
          );
        }
        return res2;
      }, {});
      const r2 = objFields.reduce((res: any, key) => {
        if (!Object.keys(value).includes(key)) {
          res[key] = validateValue(
            value,
            null,
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data as SchemaField,
            schemaConfig
          );
        }
        return res;
      }, {});
      return { ...r1, ...r2 };
    } else {
      return (schema as SchemaFieldObject).configDefaultValue;
    }
  }

  if (schema.type === SchemaFieldType.String) {
    if (schema.config.needI18n && !value) {
      return 'string__field_' + UUID();
    }

    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Number) {
    if (typeof value === 'number') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Boolean) {
    if (typeof value === 'boolean') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Select) {
    if (value !== null && value !== undefined) {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.ActorSelect) {
    if (value !== null && value !== undefined) {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.File) {
    if (value !== null && value !== undefined) {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.StringSpeed) {
    if (typeof value === 'object') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  return value;
}

export enum SchemaFieldType {
  Array = 'array',
  Object = 'object',
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
  Select = 'select',
  File = 'file',
  ActorSelect = 'actor_select',
  StringSpeed = 'string_speed',
}
function getDefaultConfig(type: SchemaFieldType): RawJson {
  switch (type) {
    case SchemaFieldType.Object: {
      return {
        colSpan: 12,
        enableWhen: null,
        initialExpand: true,
        summary: '{{___key}}',
        fieldId: `field_object_${UUID()}`,
      };
    }
    case SchemaFieldType.String: {
      return {
        colSpan: 3,
        defaultValue: '',
        enableWhen: null,
        required: false,
        type: 'singleline', // singleline | multiline | code
        template: null, // only type=code work
        minLen: 0,
        maxLen: Number.MAX_SAFE_INTEGER,
        needI18n: false,
        autoFocus: false,
        codeLang: '',
        fieldId: `field_string_${UUID()}`,
      };
    }
    case SchemaFieldType.Select: {
      return {
        colSpan: 4,
        defaultValue: '',
        options: [],
        enableWhen: null,
        required: false,
        fieldId: `field_select_${UUID()}`,
      };
    }
    case SchemaFieldType.File: {
      return {
        colSpan: 3,
        defaultValue: '',
        type: 'img',
        enableWhen: null,
        required: false,
        fieldId: `field_file_${UUID()}`,
      };
    }
    case SchemaFieldType.Array: {
      return {
        colSpan: 12,
        defaultValue: [],
        enableWhen: null,
        required: false,
        fieldId: `field_array_${UUID()}`,
      };
    }
    case SchemaFieldType.StringSpeed: {
      return {
        colSpan: 1,
        defaultValue: '',
        enableWhen: null,
        required: false,
        targetProp: 'content',
        fieldId: `field_string_speed_${UUID()}`,
      };
    }
  }
  return {};
}

export const DEFAULT_CONFIG = {
  OBJECT_CONFIG_DEFAULT: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
  ARRAY: {
    colSpan: 12,
    defaultValue: [],
    enableWhen: null,
    initialExpand: false,
    summary: '{{___index}}',
    fieldId: `field_array_${UUID()}`,
  },
  ARRAY_CONFIG_DEFAULT: {
    colSpan: 12,
    initialExpand: false,
    summary: '{{___index}}',
  },
  STRING: {
    colSpan: 3,
    defaultValue: '',
    enableWhen: null,
    required: false,
    customValidate: null,
    customValidateErrorText: '',
    helperText: '',
    type: 'singleline', // singleline | multiline | code
    template: null, // only type=code work
    minLen: 0,
    maxLen: Number.MAX_SAFE_INTEGER,
    needI18n: false,
    codeLang: '',
    fieldId: `field_string_${UUID()}`,
  },
  STRING_CONFIG_DEFAULT: {
    colSpan: 3,
    defaultValue: '',
    type: 'singleline',
  },
  NUMBER: {
    colSpan: 4,
    enableWhen: null,
    required: false,
    customValidate: null,
    customValidateErrorText: '',
    defaultValue: 0,
    helperText: '',
    suffix: '',
    prefix: '',
    format: null,
    min: -Number.MAX_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    type: 'float', // int | float | percent
    fieldId: `field_number_${UUID()}`,
  },
  NUMBER_CONFIG_DEFAULT: {
    colSpan: 4,
    defaultValue: 0,
    type: 'float',
  },
  BOOLEAN: {
    enableWhen: null,
    colSpan: 2,
    defaultValue: false,
    fieldId: `field_boolean_${UUID()}`,
  },
  BOOLEAN_CONFIG_DEFAULT: {
    colSpan: 2,
    defaultValue: false,
  },
  SELECT: {
    enableWhen: null,
    colSpan: 4,
    defaultValue: null,
    required: false,
    clearable: false,
    fieldId: `field_select_${UUID()}`,
    options: [
      {
        label: 'None',
        value: 'none',
      },
    ],
  },
  SELECT_CONFIG_DEFAULT: {
    colSpan: 4,
    options: [
      {
        label: 'None',
        value: 'none',
      },
    ],
    defaultValue: '',
  },
  ACTOR_SELECT: {
    enableWhen: null,
    colSpan: 12,
    defaultValue: {
      id: null,
      portrait: null,
    },
    fieldId: `field_${UUID()}`,
  },
  ACTOR_SELECT_DEFAULT: {
    colSpan: 4,
    defaultValue: {
      id: null,
      portrait: null,
    },
  },
  FILE: {
    enableWhen: null,
    colSpan: 4,
    defaultValue: null,
    type: 'img',
    fieldId: `field_${UUID()}`,
  },
  FILE_CONFIG_DEFAULT: {
    colSpan: 4,
    defaultValue: '',
    type: 'img',
  },
  STRING_SPEED: {
    enableWhen: null,
    colSpan: 1,
    targetProp: 'content',
    defaultValue: {},
    fieldId: `field_string_field_${UUID()}`,
  },
  STRING_SPEED_DEFAULT: {
    colSpan: 1,
    defaultValue: {},
    targetprop: 'content',
  },
};

export const DEFAULT_CONFIG_JSON = {
  OBJECT_JSON: {
    type: 'object',
    fields: {},
    config: DEFAULT_CONFIG.OBJECT_CONFIG_DEFAULT,
  },
  STR_JSON: {
    type: 'string',
    config: DEFAULT_CONFIG.STRING_CONFIG_DEFAULT,
  },
  BOOLEAN_JSON: {
    type: 'boolean',
    config: DEFAULT_CONFIG.BOOLEAN_CONFIG_DEFAULT,
  },
  NUM_JSON: {
    type: 'number',
    config: DEFAULT_CONFIG.NUMBER_CONFIG_DEFAULT,
  },
  ARR_JSON: {
    type: 'array',
    fieldSchema: null,
    config: DEFAULT_CONFIG.ARRAY_CONFIG_DEFAULT,
  },
  ARR_OBJ_JSON: {
    type: 'array',
    fieldSchema: {
      type: 'object',
      fields: {},
      config: DEFAULT_CONFIG.OBJECT_CONFIG_DEFAULT,
    },
    config: DEFAULT_CONFIG.ARRAY_CONFIG_DEFAULT,
  },
  SELECT_JSON: {
    type: 'select',
    config: DEFAULT_CONFIG.SELECT_CONFIG_DEFAULT,
  },
  FILE_JSON: {
    type: 'file',
    config: DEFAULT_CONFIG.FILE_CONFIG_DEFAULT,
  },
  STRING_SPEED_JSON: {
    type: 'string_speed',
    config: DEFAULT_CONFIG.STRING_SPEED_DEFAULT,
  },
};

export abstract class SchemaField {
  public config: RawJson = {
    colSpan: 4,
    enableWhen: null,
  };

  constructor(extraConfig?: RawJson) {
    this.config = getDefaultConfig(this.type);
    this.config = { ...this.config, ...extraConfig };
  }

  setup(config: any) {
    this.config = { ...this.config, ...config };
  }

  get type(): SchemaFieldType {
    return SchemaFieldType.Object;
  }
}

export class SchemaFieldArray extends SchemaField {
  // public config = DEFAULT_CONFIG.ARRAY;

  public fieldSchema: SchemaField;

  constructor(fieldSchema: SchemaField, extraConfig?: RawJson) {
    super(extraConfig);
    this.fieldSchema = fieldSchema;
    this.fieldSchema.config.colSpan = 12;
  }
  get type(): SchemaFieldType {
    return SchemaFieldType.Array;
  }
}

export class SchemaFieldObject extends SchemaField {
  // public config = DEFAULT_CONFIG.OBJECT;
  public fields: { name: string; id: string; data: SchemaField }[] = [];
  get type(): SchemaFieldType {
    return SchemaFieldType.Object;
  }

  get allChildFields(): SchemaField[] {
    return this.fields
      .map((item) => {
        if (item.data instanceof SchemaFieldObject) {
          return item.data.allChildFields;
        }
        return item.data;
      })
      .flat();
  }

  get configDefaultValue() {
    return this._getConfigDefaultValue(this);
  }

  _getConfigDefaultValue(field: SchemaField) {
    switch (field.type) {
      case SchemaFieldType.Object: {
        const defaultVal: any = {};
        (field as SchemaFieldObject).fields.forEach((f) => {
          defaultVal[f.id] = this._getConfigDefaultValue(f.data);
        });
        return defaultVal;
      }
      case SchemaFieldType.Array: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.String: {
        return field.config.needI18n
          ? 'string_field_' + UUID()
          : field.config.defaultValue;
      }
      case SchemaFieldType.Number: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.Boolean: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.Select: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.ActorSelect: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.StringSpeed: {
        return field.config.defaultValue;
      }
    }
  }
}

export class SchemaFieldNumber extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.NUMBER };
  get type(): SchemaFieldType {
    return SchemaFieldType.Number;
  }
}

export class SchemaFieldString extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.STRING };

  get type(): SchemaFieldType {
    return SchemaFieldType.String;
  }
}

export class SchemaFieldBoolean extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.BOOLEAN };

  get type(): SchemaFieldType {
    return SchemaFieldType.Boolean;
  }
}

export class SchemaFieldFile extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.FILE };

  get type(): SchemaFieldType {
    return SchemaFieldType.File;
  }
}

export class SchemaFieldSelect extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.SELECT };

  get type(): SchemaFieldType {
    return SchemaFieldType.Select;
  }
}

export class SchemaFieldActorSelect extends SchemaField {
  // public config = { ...DEFAULT_CONFIG.ACTOR_SELECT };

  get type(): SchemaFieldType {
    return SchemaFieldType.ActorSelect;
  }
}

export class SchemaFieldStringSpeed extends SchemaField {
  get type(): SchemaFieldType {
    return SchemaFieldType.StringSpeed;
  }
}
