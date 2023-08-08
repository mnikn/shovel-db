import { pluckFirst, useObservable, useSubscription } from 'observable-hooks';
import { useCallback, useRef, useState } from 'react';

export type Translation = {
  [termKey: string]: {
    [langCode: string]: string;
  };
};

export const PRESET_LANGS = ['zh-cn', 'en'];
const DEFAULT_LANG = PRESET_LANGS[0];

export default function useTranslation({ langs }: { langs: string[] }) {
  const [currentLang, setCurrentLang] = useState<string>(DEFAULT_LANG);
  const $langs = useObservable(pluckFirst, [langs]);
  useSubscription($langs, (val) => {
    setCurrentLang(val[0]);
  });

  const [translations, setTranslations] = useState<Translation>({});
  const translationsRef = useRef(translations);

  const tr = useCallback(
    (key: string) => {
      return translations[key]?.[currentLang] !== undefined
        ? translations[key]?.[currentLang]
        : key;
    },
    [currentLang, translations]
  );

  const updateTranslations = useCallback((val: Translation) => {
    setTranslations(val);
    translationsRef.current = val;
  }, []);

  const updateTranslateKey = useCallback(
    (key: string, val: string) => {
      const newTranslations = { ...translationsRef.current };
      newTranslations[key] = {
        ...newTranslations[key],
        [currentLang]: val,
      };
      langs.forEach((lang) => {
        if (lang !== currentLang) {
          newTranslations[key][lang] = newTranslations[key][lang] || '';
        }
      });
      setTranslations(newTranslations);
    },
    [currentLang, langs]
  );

  const updateTranslateKeyAll = useCallback(
    (key: string, val: any) => {
      const newTranslations = { ...translationsRef.current };
      newTranslations[key] = {
        ...newTranslations[key],
      };
      langs.forEach((lang) => {
        newTranslations[key][lang] =
          val?.[lang] || newTranslations[key]?.[lang] || '';
      });
      setTranslations(newTranslations);
    },
    [langs]
  );

  const hasTranslateKey = useCallback((key: string) => {
    return key in translationsRef.current;
  }, []);

  const getTranslationsForKey = useCallback(
    (key: string) => {
      return translations[key];
    },
    [translations]
  );

  return {
    currentLang,
    setCurrentLang,
    tr,
    translations,
    updateTranslations,
    updateTranslateKey,
    updateTranslateKeyAll,
    hasTranslateKey,
    getTranslationsForKey,
  };
}
