import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import { createStore } from 'hox';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../../models/story/storylet';
import useTranslation from './translation';

interface NodeSelection {
  nodeId: string;
}

export const [useStoryStore, StoryStoreProvider] = createStore(() => {
  const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);
  const [selection, setSelection] = useState<NodeSelection | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const translationModule = useTranslation();

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
  }, []);

  const insertChildNode = useCallback(
    (
      child: StoryletNode<StoryletNodeData>,
      parent: StoryletNode<StoryletNodeData>
    ) => {
      if (!currentStorylet) {
        return;
      }
      currentStorylet.upsertNode(child);
      if (
        (child instanceof StoryletSentenceNode ||
          child instanceof StoryletBranchNode) &&
        !translationModule.hasTranslateKey(child.data.content)
      ) {
        translationModule.updateTranslateKey(child.data.content, '');
      }
      currentStorylet.upsertLink(parent.id, child.id);
      setCurrentStorylet(currentStorylet.clone());
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
      needInsert.order = source.order;
      currentStorylet.upsertNode(needInsert);
      currentStorylet.upsertLink(parent.id, needInsert.id);
      currentStorylet.getNodeChildren(parent.id).forEach((node) => {
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
      setCurrentStorylet(currentStorylet.clone());
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
      currentStorylet.upsertNode(data);
      setCurrentStorylet(currentStorylet.clone());
    },
    [currentStorylet]
  );

  const deleteNode = useCallback(
    (id: string) => {
      if (!currentStorylet) {
        return;
      }
      const currentNode = currentStorylet.nodes[id];
      if (!currentNode) {
        return;
      }

      moveSelection('ArrowDown') ||
        moveSelection('ArrowUp') ||
        moveSelection('ArrowLeft');

      currentStorylet.getNodeChildren(id).forEach((child) => {
        deleteNode(child.id);
        if (currentStorylet) {
          delete currentStorylet.nodes[child.id];
        }
      });

      Object.keys(currentStorylet.links).forEach((item) => {
        if (item.includes(id) && currentStorylet) {
          delete currentStorylet.links[item];
        }
      });
      delete currentStorylet.nodes[id];

      setCurrentStorylet(currentStorylet.clone());
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

  return {
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    insertSiblingNode,
    deleteNode,
    updateNode,
    moveSelection,
    ...translationModule,
  };
});
