import { createGlobalStore } from 'hox';
import { useCallback, useEffect, useState } from 'react';
import { Event, eventEmitter } from '../events';
import { SchemaFieldArray } from '../models/schema';
import useTranslation from './common/translation';

export const [useStaticDataStore, getStaticDataStore] = createGlobalStore(
  () => {
    const translationModule = useTranslation();
    const [schemaConfigs, setSchemaConfigs] = useState<{
      [key: string]: string;
    }>({});

    const updateSchema = useCallback((fileId: string, schema: string) => {
      setSchemaConfigs((prev) => {
        const newVal = { ...prev };
        newVal[fileId] = schema;
        return newVal;
      });
    }, []);

    useEffect(() => {
      eventEmitter.on(Event.UpdateStaticDataAllSchema, setSchemaConfigs);
      eventEmitter.on(
        Event.UpdateStaticDataTranslations,
        translationModule.updateTranslations
      );
      return () => {
        eventEmitter.off(Event.UpdateStaticDataTranslations, setSchemaConfigs);
        eventEmitter.off(
          Event.UpdateStaticDataTranslations,
          translationModule.updateTranslations
        );
      };
    }, [translationModule.updateTranslations]);

    return {
      ...translationModule,
      updateSchema,
      schemaConfigs,
    };
  }
);
