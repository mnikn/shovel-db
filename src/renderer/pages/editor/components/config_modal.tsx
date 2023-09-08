import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { Button, DialogTitle, Modal, Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { SchemaFieldString } from '../../../models/schema';
import { borderRadius } from '../../../theme';
import FieldString from './schema_form/field/string_field';

const ConfigModal = ({
  close,
  lang,
  value,
  onValueChange,
  onEditorMounted,
}: {
  close: () => void;
  lang: string;
  value: string;
  onValueChange: (val: string) => void;
  onEditorMounted?: (editorVal: any, monaco: any) => void;
}) => {
  const [formData, setFormData] = useState<string>(value);

  const schemaObj = useMemo(() => {
    return new SchemaFieldString({
      colSpan: 12,
      type: 'code',
      codeLang: lang,
      /* height: '500px', */
      flexGrow: 1,
      editorMounted: onEditorMounted,
    });
  }, [lang, onEditorMounted]);

  return (
    <Modal open>
      <Stack
        spacing={4}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px',
          height: '560px',
          bgcolor: 'background.paper',
          outline: 'none',
          boxShadow: 24,
          flexGrow: 1,
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
};

export default ConfigModal;
