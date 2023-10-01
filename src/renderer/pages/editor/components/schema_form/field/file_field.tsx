import React from 'react';
import ImageUploading from 'react-images-uploading';
import { SchemaFieldFile } from '../../../../../models/schema';
import { Container, FormLabel, Stack, Box } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { grey } from '@mui/material/colors';
import { animation, borderRadius } from '../../../../../theme';
import ipc from '../../../../../electron/ipc';
import { getProjectService } from '../../../../../services';
import path from 'path';

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
  const projectPath = getProjectService().projectPath.value;
  const fullFilePath: any =
    projectPath && value
      ? path.join(path.join(projectPath, 'resources'), value)
      : null;
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
          value={fullFilePath}
          onChange={async (e) => {
            const filePath = e?.[0].file?.path;
            if (!filePath) {
              return;
            }
            const resourceId = await getProjectService().saveExternalResource(
              filePath
            );
            console.log('reer: ', resourceId);
            if (onValueChange) {
              onValueChange(resourceId);
            }
          }}
          dataURLKey='data_url'
        >
          {({ dragProps, onImageUpload, onImageUpdate }) => {
            return (
              // write your building UI
              <Box
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
              >
                {!value && (
                  <Container
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'common.white',
                      height: '100%',
                      width: '100%',
                    }}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    <AddCircleOutlineRoundedIcon />
                    Upload
                  </Container>
                )}
                {fullFilePath && (
                  <Box
                    sx={{
                      position: 'relative',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      p: 1,
                    }}
                  >
                    <img
                      src={fullFilePath}
                      style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        margin: 'auto',
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
                  </Box>
                )}
              </Box>
            );
          }}
        </ImageUploading>
      )}
    </Stack>
  );
}
