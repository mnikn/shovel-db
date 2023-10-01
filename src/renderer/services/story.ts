import TranslationService from './parts/translation';
import type { ProjectServiceType } from './project';

const StoryService = (projectService: ProjectServiceType) => {
  const translationService = TranslationService(projectService);
  // const [story, setStory] = useState<{ [key: string]: Storylet }>({});
  // const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);
  // const [selection, setSelection] = useState<NodeSelection | null>(null);
};
export default StoryService;
