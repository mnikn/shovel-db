import React from 'react';
import ImageUploading from 'react-images-uploading';
import { SchemaFieldFile } from '../../../../../models/schema';
import { Container, FormLabel, Stack } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { grey } from '@mui/material/colors';
import { animation, borderRadius } from '../../../../../theme';

export default function FieldFile({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldFile;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      {label && <FormLabel>{label}</FormLabel>}
      {schema.config.type === 'img' && (
        <ImageUploading
          value={value}
          onChange={(e) => {
            if (onValueChange) {
              onValueChange(e[0].file?.path);
            }
          }}
          dataURLKey='data_url'
        >
          {({ dragProps, onImageUpload, onImageUpdate }) => {
            return (
              // write your building UI
              <Container
                sx={{
                  backgroundColor: grey[800],
                  ...borderRadius.large,
                  ...animation.autoFade,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: grey[500],
                  },
                  width: '80px',
                  height: '80px',
                }}
                // className='bg-gray-800 rounded-md flex items-center justify-center p-1 hover:bg-gray-500 transition-all cursor-pointer'
              >
                {!value && (
                  <Container
                    className='flex text-white justify-center items-center w-full h-full'
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    <AddCircleOutlineRoundedIcon sx={{ mr: 1 }} />
                    Upload
                  </Container>
                )}
                {value && (
                  <Container className='relative w-full h-full flex'>
                    <img
                      className='m-auto'
                      src={value}
                      style={{
                        height: '72px',
                        objectFit: 'cover',
                      }}
                      alt=''
                      onClick={() => {
                        onImageUpdate(0);
                      }}
                    />
                    <RemoveCircleOutlineRoundedIcon
                      sx={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        color: 'common.white',
                      }}
                      onClick={() => {
                        if (onValueChange) {
                          onValueChange(null);
                        }
                      }}
                    />
                  </Container>
                )}
              </Container>
            );
          }}
        </ImageUploading>
      )}
    </Stack>
  );
}
