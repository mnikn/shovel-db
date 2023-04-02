import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { RawJson } from '../../../../../type';
import { SchemaFieldObject, validateValue } from '../../../../models/schema';
import { FieldContainer } from './field';

export default function SchemaForm({
  formData,
  schema,
  onValueChange,
}: {
  formData: RawJson;
  schema: SchemaFieldObject;
  onValueChange: (val: RawJson) => void;
}) {
  const [form, setForm] = useState<any>(formData);

  useEffect(() => {
    onValueChange(form);
  }, [form]);
  //   const [schema, setSchema] = useState<SchemaFieldObject>(
  //     new SchemaFieldObject()
  //   );
  //   const projectSettings = useEventState<any>({
  //     property: 'projectSettings',
  //     event: StoryProvider.event,
  //     initialVal: StoryProvider.projectSettings,
  //   });

  //   useEffect(() => {
  //     if (sourceNode instanceof StoryletSentenceNode) {
  //       const s = buildSchema(
  //         projectSettings.extraDataConfig.sentence
  //       ) as SchemaFieldObject;
  //       setSchema(s);
  //     }
  //     if (sourceNode instanceof StoryletRootNode) {
  //       const s = buildSchema(
  //         projectSettings.extraDataConfig.root
  //       ) as SchemaFieldObject;
  //       setSchema(s);
  //     }
  //     if (sourceNode instanceof StoryletBranchNode) {
  //       const s = buildSchema(
  //         projectSettings.extraDataConfig.branch
  //       ) as SchemaFieldObject;
  //       setSchema(s);
  //     }
  //     if (sourceNode instanceof StoryletCustomNode) {
  //       const schemaItem = StoryProvider.projectSettings.customNodeConfig
  //         .map((item: any) => {
  //           return {
  //             type: item.type,
  //             schema: buildSchema(item.schema),
  //             schemaConfig: item.schema,
  //           };
  //         })
  //         .find((item) => item.type === customType);

  //       const s = schemaItem?.schema || new SchemaFieldObject();
  //       setSchema(s as SchemaFieldObject);
  //       setForm((prev: any) => {
  //         return validateValue(prev, prev, s, schemaItem);
  //       });
  //     }
  //   }, [projectSettings, customType]);

  return (
    <Box
      sx={{
        pt: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <FieldContainer
        schema={schema}
        value={form}
        onValueChange={(val) => {
          setForm(validateValue(val, val, schema, {}));
        }}
      />
    </Box>
  );
}
