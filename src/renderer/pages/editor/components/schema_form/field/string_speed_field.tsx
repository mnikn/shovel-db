import MoreVertIcon from '@mui/icons-material/MoreVert';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { grey } from '@mui/material/colors';
import {
  Button,
  FormLabel,
  IconButton,
  Modal,
  Stack,
  Box,
} from '@mui/material';
import React, { useState } from 'react';
import { SchemaFieldString } from '../../../../../models/schema';
import { borderRadius } from '../../../../../theme';
import { range } from 'd3';

export default function FieldStringSpeed({
  schema,
  targetString,
  value,
  currentLang,
  onValueChange,
}: {
  schema: SchemaFieldString;
  targetString: string;
  value: any;
  currentLang: string;
  onValueChange?: (value: any) => void;
}) {
  const [contentSpeedEditVisible, setContentSpeedEditVisible] = useState(false);
  const [form, setForm] = useState(
    value || { [currentLang]: range(targetString.length).map(() => 1) }
  );
  return (
    <Stack>
      <IconButton
        onClick={() => {
          setContentSpeedEditVisible(true);
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Modal open={contentSpeedEditVisible}>
        <Stack
          spacing={4}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '60%',
            minHeight: '50%',
            maxHeight: '70%',
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
            onClick={() => {
              setContentSpeedEditVisible(false);
            }}
          />
          <FormLabel>Content Speed</FormLabel>
          <Stack direction='row' sx={{ flexWrap: 'wrap' }} spacing={2}>
            {targetString.split('').map((item, i) => {
              return (
                <Stack spacing={2} key={i} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${grey[400]}`,
                      ...borderRadius.normal,
                    }}
                  >
                    {item}
                  </Box>
                  <input
                    style={{
                      textAlign: 'center',
                      border: `1px solid ${grey[400]}`,
                      outline: 'none',
                      width: '80px',
                      padding: '8px',
                      ...borderRadius.normal,
                    }}
                    type='number'
                    step='0.01'
                    value={form?.[currentLang]?.[i]}
                    onChange={(e) => {
                      let newVal: { [key: string]: number[] } = form || {};
                      if (!newVal[currentLang]) {
                        newVal[currentLang] = [];
                      }
                      newVal[currentLang][i] = Number(e.target.value);

                      setForm(newVal);
                      if (onValueChange) {
                        onValueChange(newVal);
                      }
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Modal>
    </Stack>
  );
}
