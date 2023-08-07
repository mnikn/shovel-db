import { useObservable, useObservableCallback } from 'observable-hooks';
import {
  combineLatest,
  combineLatestWith,
  last,
  map,
  merge,
  Observable,
  of,
  pairwise,
} from 'rxjs';

export type Translation = {
  [termKey: string]: {
    [langCode: string]: string;
  };
};

export const PRESET_LANGS = ['zh-cn', 'en'];
const DEFAULT_LANG = PRESET_LANGS[0];

export default function useTranslation({
  $langs,
  $langChange,
}: {
  $langs: Observable<string[]>;
  $langChange: Observable<string>;
}) {
  const $currentLang = useObservable<string>(() => {
    return merge(
      of(DEFAULT_LANG),
      $langs.pipe(
        map((val) => {
          return val[0];
        })
      ),
      $langChange
    );
  });

  const [updateTranslations, $updateTranslations] =
    useObservableCallback<Translation>();
  const [updateTranslateKey, $updateTranslateKey] = useObservableCallback<{
    key: string;
    val: string;
  }>();
  const [updateTranslateKeyAll, $updateTranslateKeyAll] =
    useObservableCallback<{
      key: string;
      val: any;
    }>();
  const $translations = useObservable<Translation>(() => {
    return merge(
      $updateTranslations
      // $updateTranslateKey.pipe(
      //   combineLatestWith($translations, $currentLang, $langs),
      //   map(([event, prev, currentLang, langs]) => {
      //     const newTranslations = { ...prev };
      //     newTranslations[event.key] = {
      //       ...newTranslations[event.key],
      //       [currentLang]: event.val,
      //     };

      //     langs.forEach((lang) => {
      //       if (lang !== currentLang) {
      //         newTranslations[event.key][lang] =
      //           newTranslations[event.key][lang] || '';
      //       }
      //     });
      //     return newTranslations;
      //   })
      // ),
      // $updateTranslateKeyAll.pipe(
      //   combineLatestWith($translations, $langs),
      //   map(([event, prev, langs]) => {
      //     const newTranslations = { ...prev };
      //     newTranslations[event.key] = {
      //       ...newTranslations[event.key],
      //     };
      //     langs.forEach((lang) => {
      //       newTranslations[event.key][lang] =
      //         event.val?.[lang] || newTranslations[event.key]?.[lang] || '';
      //     });
      //     return newTranslations;
      //   })
      // )
    );
  });

  return {
    $currentLang,
    updateTranslations,
    updateTranslateKey,
    updateTranslateKeyAll,
  };
}
