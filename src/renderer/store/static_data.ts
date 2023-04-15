import { createGlobalStore } from 'hox';
import { useCallback, useEffect, useState } from 'react';
import { Event, eventEmitter } from '../events';
import { DEFAULT_CONFIG_JSON } from '../models/schema';
import useTranslation from './common/translation';

export const [useStaticDataStore, getStaticDataStore] = createGlobalStore(
  () => {
    const translationModule = useTranslation();
    const [fileData, setFileData] = useState<{
      [key: string]: {
        schema: string;
        data: any[];
      };
    }>({});

    const updateSchema = useCallback((fileId: string, schema: string) => {
      setFileData((prev) => {
        const newVal = prev ? { ...prev } : {};
        if (!(fileId in newVal)) {
          newVal[fileId] = { schema: '', data: [] };
        }
        newVal[fileId].schema = schema;
        return newVal;
      });
    }, []);

    const updateData = useCallback((fileId: string, val: any[]) => {
      setFileData((prev) => {
        const newVal = prev ? { ...prev } : {};
        if (!(fileId in newVal)) {
          newVal[fileId] = { schema: '', data: [] };
        }
        newVal[fileId].data = val;
        return newVal;
      });
    }, []);

    useEffect(() => {
      const newFile = (fileId: string) => {
        setFileData((prev) => {
          const newVal = { ...prev };
          newVal[fileId] = {
            schema: JSON.stringify(DEFAULT_CONFIG_JSON.ARR_OBJ_JSON, null, 2),
            data: [],
          };
          return newVal;
        });
      };
      eventEmitter.on(Event.UpdateStaticDataAllData, setFileData);
      eventEmitter.on(Event.CreateStaticDataFile, newFile);
      eventEmitter.on(
        Event.UpdateStaticDataTranslations,
        translationModule.updateTranslations
      );
      return () => {
        eventEmitter.off(Event.UpdateStaticDataAllData, setFileData);
        eventEmitter.off(Event.CreateStaticDataFile, newFile);
        eventEmitter.off(
          Event.UpdateStaticDataTranslations,
          translationModule.updateTranslations
        );
      };
    }, [translationModule.updateTranslations]);

    return {
      ...translationModule,
      fileData,
      updateSchema,
      updateData,
    };
  }
);
