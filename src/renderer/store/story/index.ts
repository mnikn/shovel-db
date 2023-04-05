import {
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import { createGlobalStore } from 'hox';
import { cloneDeep, maxBy } from 'lodash';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../models/story/storylet';
import useTranslation from './translation';
import { getTrackStore, trackState } from '../track';
import { RawJson } from '../../../type';
import { LANG } from '../../../constants/i18n';
import { UUID } from '../../../utils/uuid';
import { formatNodeLinkId, NodeLink } from '../../models/tree';

interface NodeSelection {
  nodeId: string;
}

export interface StoryActor {
  id: string;
  name: string;
  portraits: { id: string; pic: string }[];
}

export const [useStoryStore, getStoryStore] = createGlobalStore(() => {
  const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);
  const [selection, setSelection] = useState<NodeSelection | null>(null);
  const [storyActors, setStoryActors] = useState<StoryActor[]>([]);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const currentStoryletRef = useRef(currentStorylet);
  const storyActorsRef = useRef(storyActors);

  const translationModule = useTranslation();

  const trackCurrentState = useCallback(() => {
    trackState('story', {
      currentStorylet: currentStoryletRef.current?.clone() || null,
      translations: cloneDeep(translationModule.translationsRef.current),
      currentLang: translationModule.currentLang,
      storyActors: storyActorsRef.current,
    });
  }, []);

  useEffect(() => {
    const store = getTrackStore();
    if (!store) {
      return;
    }

    store.registerStoreSetter('story', (val: RawJson) => {
      setCurrentStorylet(val.currentStorylet?.clone() || null);
      translationModule.setTranslations(val.translations || {});
      translationModule.setCurrentLang(val.currentLang || LANG.EN);
      setStoryActors(val.storyActors || []);
    });
  }, [translationModule.updateTranslations, translationModule.switchLang]);

  useLayoutEffect(() => {
    const storylet = new Storylet();
    const sentenceNode = new StoryletSentenceNode();
    const sentenceNode2 = new StoryletSentenceNode();
    const sentenceNode3 = new StoryletSentenceNode();
    // sentenceNode.data.content = 'asdas';
    translationModule.updateTranslateKey(sentenceNode.data.content, 'asds');
    translationModule.updateTranslateKey(sentenceNode2.data.content, 'ff');
    translationModule.updateTranslateKey(sentenceNode3.data.content, 'sdf');
    // sentenceNode2.data.content = 'ds';
    // sentenceNode3.data.content = 'reer';
    storylet.name = 'asdsad';
    storylet.upsertNode(sentenceNode);
    storylet.upsertNode(sentenceNode2);
    storylet.upsertNode(sentenceNode3);
    if (storylet.root) {
      storylet.upsertLink(storylet.root.id, sentenceNode.id);
      storylet.upsertLink(storylet.root.id, sentenceNode2.id);
      storylet.upsertLink(storylet.root.id, sentenceNode3.id);
    }
    setCurrentStorylet(storylet);
    trackState('story', {
      currentStorylet: storylet,
      translations: translationModule.translationsRef.current,
      currentLang: translationModule.currentLang,
    });
  }, []);

  const insertChildNode = useCallback(
    (
      child: StoryletNode<StoryletNodeData>,
      parent: StoryletNode<StoryletNodeData>
    ) => {
      if (!currentStorylet) {
        return;
      }
      const newVal = currentStorylet.clone();
      newVal.upsertNode(child);
      if (
        (child instanceof StoryletSentenceNode ||
          child instanceof StoryletBranchNode) &&
        !translationModule.hasTranslateKey(child.data.content)
      ) {
        translationModule.updateTranslateKey(child.data.content, '');
      }

      if (parent instanceof StoryletBranchNode) {
        child.data.option = {
          name: 'option_' + UUID(),
          controlType: 'visible',
          controlCheck: '',
        };
        translationModule.updateTranslateKey(child.data.option.name, '');
      } else {
        delete child.data.option;
      }
      newVal.upsertLink(parent.id, child.id);
      setCurrentStorylet(newVal);
      currentStoryletRef.current = newVal;
    },
    [
      currentStorylet,
      translationModule.updateTranslateKey,
      translationModule.hasTranslateKey,
    ]
  );

  const insertSiblingNode = useCallback(
    (
      needInsert: StoryletNode<StoryletNodeData>,
      source: StoryletNode<StoryletNodeData>
    ) => {
      if (!currentStorylet) {
        return;
      }
      var parent = currentStorylet.getNodeSingleParent(source.id);
      if (!parent) {
        return;
      }
      const newVal = currentStorylet.clone();
      needInsert.order = source.order;
      newVal.upsertNode(needInsert);
      newVal.upsertLink(parent.id, needInsert.id);
      newVal.getNodeChildren(parent.id).forEach((node) => {
        if (node.order >= source.order && source.id !== node.id) {
          node.order += 1;
        }
      });
      if (
        (needInsert instanceof StoryletSentenceNode ||
          needInsert instanceof StoryletBranchNode) &&
        !translationModule.hasTranslateKey(needInsert.data.content)
      ) {
        translationModule.updateTranslateKey(needInsert.data.content, '');
      }

      if (parent instanceof StoryletBranchNode) {
        needInsert.data.option = {
          name: 'option_' + UUID(),
          controlType: 'visible',
          controlCheck: '',
        };
        translationModule.updateTranslateKey(needInsert.data.option.name, '');
      } else {
        delete needInsert.data.option;
      }
      setCurrentStorylet(newVal);
      currentStoryletRef.current = newVal;
    },
    [currentStorylet, translationModule.updateTranslateKey]
  );

  const selectNode = useCallback((nodeId: string | null) => {
    if (selectionRef.current?.nodeId === nodeId || nodeId === null) {
      setSelection(null);
      selectionRef.current = null;
      return;
    }

    setSelection({
      nodeId,
    });
    selectionRef.current = { nodeId };

    const nodeView = document.querySelector(`#${nodeId}`) as HTMLElement;
    nodeView.onblur = () => {
      if (selectionRef.current?.nodeId === nodeId) {
        nodeView.focus();
        nodeView.onblur = null;
      }
    };
    nodeView.focus();
  }, []);

  const updateNode = useCallback(
    (data: StoryletNode<StoryletNodeData>) => {
      if (!currentStorylet) {
        return;
      }
      const newVal = currentStorylet.clone();
      newVal.upsertNode(data);
      setCurrentStorylet(newVal);
      currentStoryletRef.current = newVal;
    },
    [currentStorylet]
  );

  const deleteNode = useCallback(
    (id: string) => {
      if (!currentStorylet) {
        return;
      }

      const newVal = currentStorylet.clone();
      const currentNode = newVal.nodes[id];
      if (!currentNode) {
        return;
      }

      moveSelection('ArrowDown') ||
        moveSelection('ArrowUp') ||
        moveSelection('ArrowLeft');

      newVal.getNodeChildren(id).forEach((child) => {
        deleteNode(child.id);
        if (newVal) {
          delete newVal.nodes[child.id];
        }
      });

      Object.keys(newVal.links).forEach((item) => {
        if (item.includes(id) && newVal) {
          delete newVal.links[item];
        }
      });
      delete newVal.nodes[id];

      setCurrentStorylet(newVal);
      currentStoryletRef.current = newVal;
    },
    [currentStorylet]
  );

  const moveStoryletNode = useCallback(
    (sourceId: string, targetNodeId: string, type: 'child' | 'parent') => {
      if (!currentStorylet) {
        return;
      }

      const val = currentStorylet.clone();
      Object.values(val.links).forEach((item) => {
        if (item.target.id === sourceId) {
          delete val.links[formatNodeLinkId(item.source.id, item.target.id)];
        }
      });

      const targetNode = val.nodes[targetNodeId];

      if (type === 'child') {
        const child = val.nodes[sourceId];
        const parent = val.nodes[targetNodeId];
        const newLinkItem = new NodeLink(parent, child);
        if (parent instanceof StoryletBranchNode) {
          child.data.option = {
            name: 'option_' + UUID(),
            controlType: 'visible',
            controlCheck: '',
          };
        }
        val.links[formatNodeLinkId(parent.id, sourceId)] = newLinkItem;
        child.order = maxBy(val.getNodeChildren(parent.id), 'order') + 1;
      } else if (type === 'parent') {
        const child = val.nodes[sourceId];
        const newParentId =
          currentStorylet?.getNodeSingleParent(targetNodeId)?.id || '';
        const parent = val.nodes[newParentId];
        const newLinkItem = new NodeLink(parent, child);
        if (parent instanceof StoryletBranchNode) {
          child.data.option = {
            name: 'option_' + UUID(),
            controlType: 'visible',
            controlCheck: '',
          };
        }
        val.links[formatNodeLinkId(parent.id, sourceId)] = newLinkItem;
        child.order = targetNode.order - 1;
        val.getNodeChildren(parent.id).forEach((node) => {
          if (node.order <= child.order && node.id !== child.id) {
            node.order -= 1;
          }
        });
      }

      setCurrentStorylet(val);
    },
    [currentStorylet]
  );

  const moveSelection = useCallback(
    (direction: string) => {
      if (!selectionRef.current || !currentStorylet) {
        return false;
      }

      const selectingNode = currentStorylet.nodes[selectionRef.current.nodeId];
      if (!selectingNode) {
        return false;
      }
      const parent = currentStorylet.getNodeSingleParent(selectingNode.id);
      const siblingNodes = parent
        ? currentStorylet
            .getNodeChildren(parent.id)
            .filter((item) => item.id !== selectingNode.id)
        : [];
      switch (direction) {
        case 'ArrowUp': {
          const targetNode = siblingNodes
            .filter((item) => item.order <= selectingNode.order)
            .sort((a, b) => {
              return b.order - a.order;
            })[0];
          if (targetNode) {
            selectNode(targetNode.id);
            return true;
          }
          break;
        }
        case 'ArrowDown': {
          const targetNode = siblingNodes
            .filter((item) => item.order >= selectingNode.order)
            .sort((a, b) => {
              return a.order - b.order;
            })[0];
          if (targetNode) {
            selectNode(targetNode.id);
            return true;
          }
          break;
        }
        case 'ArrowLeft': {
          if (parent) {
            selectNode(parent.id);
            return true;
          }
          break;
        }
        case 'ArrowRight': {
          const children = currentStorylet.getNodeChildren(selectingNode.id);
          if (children.length > 0) {
            selectNode(
              children.sort((a, b) => {
                return a.order - b.order;
              })[0].id
            );
            return true;
          }
          break;
        }
      }
      return false;
    },
    [currentStorylet]
  );

  const updateStoryActors = useCallback((val: StoryActor[]) => {
    storyActorsRef.current = val;
    setStoryActors(val);
  }, []);

  return {
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    insertSiblingNode,
    deleteNode,
    updateNode,
    moveStoryletNode,
    moveSelection,
    trackCurrentState,
    storyActors,
    updateStoryActors,
    ...translationModule,
  };
});
