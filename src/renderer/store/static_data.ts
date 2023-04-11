import { createGlobalStore } from 'hox';
import { useCallback, useEffect, useState } from 'react';
import { Event, eventEmitter } from '../events';
import useTranslation from './common/translation';

export const [useStaticDataStore, getStaticDataStore] = createGlobalStore(
  () => {
    const translationModule = useTranslation();
    const [schemaConfigs, setSchemaConfigs] = useState<{
      [key: string]: string;
    }>({});

    const [fileData, setFileData] = useState<{
      [key: string]: {
        schema: string;
        data: any[];
      };
    }>({});

    const updateSchema = useCallback((fileId: string, schema: string) => {
      setSchemaConfigs((prev) => {
        const newVal = { ...prev };
        newVal[fileId] = schema;
        return newVal;
      });
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
      eventEmitter.on(Event.UpdateStaticDataAllData, setFileData);
      eventEmitter.on(
        Event.UpdateStaticDataTranslations,
        translationModule.updateTranslations
      );
      return () => {
        eventEmitter.off(Event.UpdateStaticDataAllData, setFileData);
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
      schemaConfigs,
    };
  }
);
