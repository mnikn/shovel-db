import { useState, useCallback, useRef, useEffect } from 'react';
import { computed, ref, toValue } from '@vue/reactivity';
import { cloneDeep } from 'lodash';
import { ProjectServiceType } from '..';
import { watch } from '@vue-reactivity/watch';
// import { useProjectStore } from '../project';
// import { LANG } from '../../../constants/i18n';
// import { trackState } from '../track';

export type Translation = {
  [key: string]: {
    [key: string]: string;
  };
};

const TranslationService = (projectService: ProjectServiceType) => {
  const currentLang = ref<string>('zh-cn');
  const translations = ref<Translation>({});

  const memento = computed(() => {
    return {
      translations: toValue(translations),
    };
  });
  const restoreMemento = (
    newMemento: Partial<{ translations: Translation }>
  ) => {
    if (newMemento.translations !== undefined) {
      translations.value = newMemento.translations;
    }
  };

  const switchLang = (lang: string) => {
    currentLang.value = lang;
  };

  const tr = (key: string) => {
    return translations.value[key]?.[currentLang.value] !== undefined
      ? translations.value[key]?.[currentLang.value]
      : key;
  };

  const updateTranslations = (val: Translation) => {
    translations.value = val;
  };

  const hasTranslateKey = (key: string) => {
    return key in translations.value;
  };

  const updateTranslateKey = (key: string, val: string) => {
    const newTranslations = { ...translations.value };
    newTranslations[key] = {
      ...newTranslations[key],
      [currentLang.value]: val,
    };
    projectService.langs.value.forEach((lang) => {
      if (lang !== currentLang.value) {
        newTranslations[key][lang] = newTranslations[key][lang] || '';
      }
    });
    translations.value = newTranslations;
  };

  const updateTranslateKeyAll = (key: string, val: any) => {
    const newTranslations = { ...translations.value };
    newTranslations[key] = {
      ...newTranslations[key],
    };
    projectService.langs.value.forEach((lang) => {
      newTranslations[key][lang] =
        val?.[lang] || newTranslations[key]?.[lang] || '';
    });
    translations.value = newTranslations;
  };

  const getTranslationsForKey = (key: string) => {
    return translations.value[key];
  };

  watch(
    () => projectService.langs.value,
    (langs) => {
      if (!langs.includes(currentLang.value)) {
        currentLang.value = langs[0];
      }
    }
  );

  return {
    memento,
    restoreMemento,
    currentLang,
    switchLang,
    tr,
    translations,
    updateTranslations,
    hasTranslateKey,
    updateTranslateKey,
    updateTranslateKeyAll,
    getTranslationsForKey,
  };
};
export type TranslationServiceType = ReturnType<typeof TranslationService>;
export type TranslationServiceMemento = TranslationServiceType['memento'];

export default TranslationService;

// export default function useTranslation() {
//   const { projectSettings } = useProjectStore();
//   const [currentLang, setCurrentLang] = useState<LANG>(projectSettings.i18n[0]);
//   const [translations, setTranslations] = useState<Translation>({});
//   const translationsRef = useRef(translations);
//   translationsRef.current = translations;

//   const switchLang = useCallback((lang: LANG) => {
//     setCurrentLang(lang);
//   }, []);

//   useEffect(() => {
//     setCurrentLang((prev) => {
//       if (!projectSettings.i18n.includes(prev)) {
//         return projectSettings.i18n[0];
//       }
//       return prev;
//     });
//   }, [projectSettings.i18n]);

//   const tr = useCallback(
//     (key: string) => {
//       return translationsRef.current[key]?.[currentLang] !== undefined
//         ? translationsRef.current[key]?.[currentLang]
//         : key;
//     },
//     [currentLang]
//   );

//   const updateTranslations = useCallback((val: Translation) => {
//     setTranslations(val);
//     translationsRef.current = val;
//   }, []);

//   const updateTranslateKey = useCallback(
//     (key: string, val: string) => {
//       const newTranslations = { ...translationsRef.current };
//       newTranslations[key] = {
//         ...newTranslations[key],
//         [currentLang]: val,
//       };
//       projectSettings.i18n.forEach((lang) => {
//         if (lang !== currentLang) {
//           newTranslations[key][lang] = newTranslations[key][lang] || '';
//         }
//       });
//       setTranslations(newTranslations);
//       translationsRef.current = newTranslations;
//     },
//     [currentLang, projectSettings.i18n]
//   );

//   const updateTranslateKeyAll = useCallback(
//     (key: string, val: any) => {
//       const newTranslations = { ...translationsRef.current };
//       newTranslations[key] = {
//         ...newTranslations[key],
//       };
//       projectSettings.i18n.forEach((lang) => {
//         newTranslations[key][lang] =
//           val?.[lang] || newTranslations[key]?.[lang] || '';
//       });
//       setTranslations(newTranslations);
//       translationsRef.current = newTranslations;
//     },
//     [projectSettings.i18n]
//   );

//   const hasTranslateKey = useCallback((key: string) => {
//     return key in translationsRef.current;
//   }, []);

//   const getTranslationsForKey = useCallback(
//     (key: string) => {
//       return translations[key];
//     },
//     [translations]
//   );

//   return {
//     currentLang,
//     setCurrentLang,
//     switchLang,
//     translations,
//     setTranslations,
//     translationsRef,
//     getTranslationsForKey,
//     hasTranslateKey,
//     tr,
//     updateTranslations,
//     updateTranslateKey,
//     updateTranslateKeyAll,
//   };
// }
