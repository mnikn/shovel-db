import { RawJson } from '../../../type';
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
} from './';

export function buildSchema(
  json: RawJson,
  cacheSchemaMap: RawJson = {}
): SchemaField {
  switch (json.type) {
    case SchemaFieldType.Object: {
      const instance = new SchemaFieldObject();
      instance.setup(json.config);
      instance.fields = Object.keys(json.fields).map((key: string) => {
        const data: any = {
          type: json.fields[key].type,
          config: json.fields[key].config,
        };
        if (json.fields[key].type === SchemaFieldType.Array) {
          data.fieldSchema = json.fields[key].fieldSchema;
        } else if (json.fields[key].type === SchemaFieldType.Object) {
          data.fields = json.fields[key].fields;
        }
        const subfield = buildSchema(data, cacheSchemaMap);
        return {
          id: key,
          name: json.fields[key].name,
          data: subfield,
        };
      });
      (instance.config as any).defaultValue = instance.configDefaultValue;
      return instance;
    }
    case SchemaFieldType.Array: {
      const data: any = {
        type: json.fieldSchema.type,
        config: json.fieldSchema.config,
      };

      if (json.fieldSchema.type === SchemaFieldType.Array) {
        data.fieldSchema = json.fieldSchema.fieldSchema;
      } else if (json.fieldSchema.type === SchemaFieldType.Object) {
        data.fields = json.fieldSchema.fields;
      }
      const instance = new SchemaFieldArray(buildSchema(data, cacheSchemaMap));
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.String: {
      let instance = new SchemaFieldString();
      if (cacheSchemaMap[json.config.extends]) {
        instance = cacheSchemaMap[json.config.extends];
      }
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Number: {
      const instance = new SchemaFieldNumber();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Boolean: {
      const instance = new SchemaFieldBoolean();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Select: {
      const instance = new SchemaFieldSelect();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.ActorSelect: {
      const instance = new SchemaFieldActorSelect();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.File: {
      const instance = new SchemaFieldFile();
      instance.setup(json.config);
      return instance;
    }
  }
  return new SchemaFieldObject();
}
