import { useEffect, useMemo, useState } from 'react';
import { createStore } from 'hox';
import { Storylet, StoryletSentenceNode } from '../models/story/storylet';

export const [useStoryStore, StoryStoreProvider] = createStore(() => {
  const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);

  useEffect(() => {
    const storylet = new Storylet();
    const sentenceNode = new StoryletSentenceNode();
    const sentenceNode2 = new StoryletSentenceNode();
    const sentenceNode3 = new StoryletSentenceNode();
    sentenceNode.data.content = 'asdas';
    storylet.upsertNode(sentenceNode);
    storylet.upsertNode(sentenceNode2);
    storylet.upsertNode(sentenceNode3);
    if (storylet.root) {
      storylet.upsertLink(storylet.root.id, sentenceNode.id);
      storylet.upsertLink(storylet.root.id, sentenceNode2.id);
      storylet.upsertLink(storylet.root.id, sentenceNode3.id);
    }
    setCurrentStorylet(storylet);
  }, []);
  return {
    currentStorylet,
  };
});
