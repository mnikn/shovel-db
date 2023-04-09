import {
  Button,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { borderRadius } from '../../../../theme';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {
  SchemaFieldArray,
  SchemaFieldFile,
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../models/schema';
import { StoryActor, useStoryStore } from '../../../../store';
import { cloneDeep } from 'lodash';
import { RawJson } from '../../../../../type';
import SchemaForm from '../schema_form';

const itemSchema = new SchemaFieldObject();
const portraitSchemaItem = new SchemaFieldObject();
portraitSchemaItem.fields.push(
  {
    id: 'pic',
    name: 'pic',
    data: new SchemaFieldFile({
      colSpan: 3,
      type: 'img',
    }),
  },
  {
    id: 'id',
    name: 'id',
    data: new SchemaFieldString({
      colSpan: 9,
    }),
  }
);
const portraitSchema = new SchemaFieldArray(portraitSchemaItem, {
  height: '200px',
  colSpan: 12,
});
itemSchema.fields.push(
  {
    id: 'id',
    name: 'id',
    data: new SchemaFieldString({
      colSpan: 6,
    }),
  },
  {
    id: 'name',
    name: 'name',
    data: new SchemaFieldString({
      colSpan: 6,
      needI18n: true,
    }),
  },
  {
    id: 'portraits',
    name: 'portraits',
    data: portraitSchema,
  }
);
const settingsSchema = new SchemaFieldArray(itemSchema, {
  fitRestHeight: true,
});

export default function ActorSettings({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const {
    translations,
    currentLang,
    storyActors,
    updateTranslations,
    updateStoryActors,
    trackCurrentState,
  } = useStoryStore();
  const [formData, setFormData] = useState<StoryActor[]>(storyActors);

  const formTranslations = useMemo(() => {
    return cloneDeep(translations);
  }, [translations]);
  return (
    <Modal open={open}>
      <Stack
        spacing={4}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '60%',
          height: '60%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          bgcolor: 'background.paper',
          outline: 'none',
          boxShadow: 24,
          p: 4,
          ...borderRadius.large,
        }}
      >
        <HighlightOffOutlinedIcon
          sx={{
            position: 'absolute',
            top: '-32px',
            right: '-32px',
            color: 'common.white',
            fontSize: '2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={close}
        />
        <DialogTitle
          sx={{
            p: 0,
            m: 0,
            marginTop: '0!important',
          }}
        >
          Actor Settings
        </DialogTitle>

        <SchemaForm
          translations={formTranslations}
          currentLang={currentLang}
          formData={formData}
          schema={settingsSchema}
          onValueChange={(v) => {
            setFormData(v);
          }}
        />

        <br />

        <Stack
          direction='row'
          spacing={2}
          sx={{
            mt: 'auto!important',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button variant='outlined' onClick={close}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              updateTranslations(formTranslations);
              updateStoryActors(formData);
              trackCurrentState();
              close();
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
