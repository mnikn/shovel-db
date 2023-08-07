import {
  useObservableState,
  useObservable,
  pluckFirst,
} from 'observable-hooks';
import { of } from 'rxjs';

export type Translation = {
  [termKey: string]: {
    [langCode: string]: string;
  };
};

export const PRESET_LANGS = ['zh-cn', 'en'];
const DEFAULT_LANG = PRESET_LANGS[0];

export default function useTranslation({ languages }: { languages: string[] }) {
  const [currentLang, setCurrentLang] = useObservableState<string>(
    ($inputs) => {
      return $inputs;
    },
    DEFAULT_LANG
  );
  const $currentLang = useObservable(pluckFirst, [currentLang]);

  return {
    $currentLang,
    currentLang,
    setCurrentLang,
  };
}
