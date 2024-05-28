import {
  Box,
  CircularProgress,
  Collapse,
  Container,
  Stack,
} from '@mui/material';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  SchemaFieldNumber,
  SchemaFieldSelect,
  SchemaFieldString,
} from '../../../../models/schema';
import { useFileStore, useStaticDataStore } from '../../../../stores';
import FilterPanel from '../../components/filter_panel';
import SchemaForm from '../../components/schema_form';
import FieldSelect from '../../components/schema_form/field/select_field';
import { get, difference } from 'lodash';
import { hash } from '../../../../../utils/hash';

const i18nSchema = new SchemaFieldSelect({
  options: [
    {
      label: 'zh-cn',
      value: 'zh-cn',
    },
    {
      label: 'en-us',
      value: 'en-us',
    },
  ],
});

export default function StaticData() {
  const {
    currentSchema,
    currentData,
    updateFileData,
    syncCurrentData,
    currentFilters,
    currentLang,
    switchLang,
    translations,
    updateTranslations,
    updateTranslateKey,
    loading,
  } = useStaticDataStore();
  const { currentOpenFile } = useFileStore();
  const [displayData, setDisplayData] = useState<any[]>(currentData);
  const hasFilter = displayData?.length !== currentData?.length;
  const currentDataRef = useRef<any>(currentData);
  currentDataRef.current = currentData;
  const displayDataRef = useRef<any>(displayData);
  displayDataRef.current = displayData;
  /* const schemaConfig = fileData?.[currentOpenFile?.id || '']?.schema; */
  /* const fileDataRef = useRef(fileData);
   * fileDataRef.current = fileData; */
  /* const currentFileSchema = useMemo(() => {
   *   if (!fileDataRef.current) {
   *     return new SchemaFieldArray(new SchemaFieldObject());
   *   }
   *   const config = schemaConfig;
   *   if (!config) {
   *     return buildSchema(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON) as SchemaFieldArray;
   *   }
   *   return buildSchema(JSON.parse(config)) as SchemaFieldArray;
   * }, [schemaConfig]); */

  const onValueChange = useCallback(
    (val: any) => {
      if (!currentOpenFile) {
        return;
      }
      /* updateData(currentOpenFile.id, val); */

      let res = val;
      if (hasFilter) {
        res = currentDataRef.current;

        if (displayDataRef.current.length < val.length) {
          // createItem
          const newItem = difference(val, displayDataRef.current)[0];
          const newItemIndex = val.findIndex((v) => {
            return v === newItem;
          });
          const prevItem =
            newItemIndex - 1 !== -1 ? val[newItemIndex - 1] : null;

          if (prevItem) {
            const prevItemIndex = res.findIndex((item) => {
              return hash(item) === hash(prevItem);
            });
            if (prevItemIndex) {
              res.splice(prevItemIndex + 1, 0, newItem);
            } else {
              res.push(newItem);
            }
          } else {
            res.push(newItem);
          }
        } else if (displayDataRef.current.length > val.length) {
          // deleteItem
          const removeItem = difference(displayDataRef.current, val)[0];
          if (removeItem) {
            res = res.filter((item) => {
              return hash(item) === hash(removeItem);
            });
          }
        } else {
          // val change
          const changeItem = difference(val, displayDataRef.current)[0];
          const beforeChangeItem = difference(displayDataRef.current, val)[0];
          res = res.map((item) => {
            // hack detect id
            if (hash(item) === hash(beforeChangeItem)) {
              return changeItem;
            }
            return item;
          });
          // order modify
        }
      }
      updateFileData(currentOpenFile, res);
      syncCurrentData(res);
    },
    [updateTranslations, currentOpenFile, updateFileData, hasFilter]
  );

  useLayoutEffect(() => {
    setDisplayData(currentData);
  }, []);

    /* const filterSettings = [
     *   {
     *     label: 'id',
     *     prop: 'id',
     *   },
     * ]; */

  const onFilterChange = (filterVal: any) => {
    setDisplayData(
      currentData.filter((item) => {
        const needFilter = Object.keys(filterVal).reduce((res, prop) => {
          if (!res) {
            return res;
          }
          if (!filterVal[prop].value) {
            return res;
          }

          if (filterVal[prop].schema instanceof SchemaFieldString) {
            if (filterVal[prop].filterType === 'include') {
              return get(item, prop).includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'exclude') {
              return !get(item, prop).includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'equal') {
              return get(item, prop) === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldNumber) {
            if (filterVal[prop].filterType === 'less') {
              return get(item, prop) > filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'less_equal') {
              return get(item, prop) >= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger') {
              return get(item, prop) < filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger_equal') {
              return get(item, prop) <= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'equal') {
              return get(item, prop) === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldSelect) {
            if (filterVal[prop].filterType === 'exists') {
              return get(item, prop) === filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'not_exists') {
              return get(item, prop) !== filterVal[prop].value;
            }
          }
          return res;
        }, true);
        return needFilter;
      })
    );
  };

  if (loading) {
    return (
      <CircularProgress
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transofrm: 'translateX(-50%) translateY(-50%)',
          color: '#ffffff',
        }}
      />
    );
  }

  if (!currentSchema) {
    return null;
  }

  return (
    <Stack sx={{ p: 6, height: '100%' }}>
      <Container
        sx={{
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <FilterPanel
          schema={currentSchema}
          filterSettings={currentFilters}
          onFilterChange={onFilterChange}
        />
      </Container>
      <SchemaForm
        formData={displayData}
        schema={currentSchema}
        currentLang={currentLang}
        translations={translations}
        onValueChange={onValueChange}
        onTranslationsChange={(termKey, val) => {
          updateTranslateKey(termKey, val);
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '24px',
          top: '24px',
          width: '120px',
        }}
      >
        <FieldSelect
          schema={i18nSchema}
          value={currentLang}
          onValueChange={switchLang}
        />
      </Box>
    </Stack>
  );
}
