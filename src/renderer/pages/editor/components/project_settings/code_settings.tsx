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
  DEFAULT_CONFIG,
  SchemaFieldArray,
  SchemaFieldFile,
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../models/schema';
import { StoryActor, useStoryStore } from '../../../../store';
import { cloneDeep } from 'lodash';
import { RawJson } from '../../../../../type';
import SchemaForm from '../schema_form';
import FieldString from '../schema_form/field/string_field';

export default function CodeSettings({
  open,
  close,
  lang,
  value,
  onValueChange,
  onEditorMounted,
}: {
  open: boolean;
  close: () => void;
  lang: string;
  value: string;
  onValueChange: (val: string) => void;
  onEditorMounted?: (editorVal: any, monaco: any) => void;
}) {
  const { nodeSettings } = useStoryStore();
  const [formData, setFormData] = useState<string>(value);

  const schemaObj = useMemo(() => {
    return new SchemaFieldString({
      colSpan: 12,
      type: 'code',
      codeLang: lang,
      height: '500px',
      editorMounted: onEditorMounted,
    });
  }, [lang, onEditorMounted]);

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
          Code Settings
        </DialogTitle>

        <FieldString
          schema={schemaObj}
          value={formData}
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
              onValueChange(formData);
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
