import { useEffect, useCallback, useState, useRef } from 'react';
import { createGlobalStore } from 'hox';
import { LANG } from '../../constants/i18n';

interface ProjectSettings {
  i18n: LANG[];
}

export const [useProjectStore, getProjectStore] = createGlobalStore(() => {
  const [projectSettings, setProjectSetttings] = useState<ProjectSettings>({
    i18n: [LANG.EN, LANG.ZH_CN],
  });

  return {
    projectSettings,
  };
});
