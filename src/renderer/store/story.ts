import { createGlobalStore } from 'hox';
import { cloneDeep, maxBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LANG } from '../../constants/i18n';
import { RawJson } from '../../type';
import { UUID } from '../../utils/uuid';
import { Event, eventEmitter } from '../events';
import { DEFAULT_CONFIG_JSON, SchemaFieldObject } from '../models/schema';
import { buildSchema } from '../models/schema/factory';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../models/story/storylet';
import { formatNodeLinkId, NodeLink } from '../models/tree';
import useTranslation from './common/translation';
import { getTrackStore, trackState } from './track';

interface NodeSelection {
  nodeId: string;
}

export interface StoryActor {
  id: string;
  name: string;
  portraits: { id: string; pic: string }[];
}

export interface NodeSettings {
  basicDataSchema: string;
  extraDataSchema?: string;
}

const rootBasicDataSchemaConfig = {
  type: 'object',
  fields: {
    customNodeId: {
      name: 'Custom node id',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
      },
      type: 'string',
    },
    enableCheck: {
      name: 'Enable check',
      config: {
        colSpan: 12,
        defaultValue: '',
        type: 'code',
        codeLang: 'python',
        showPopup: true,
      },
      type: 'string',
    },
  },
  config: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
};

const sentenceBasicDataSchemaConfig = {
  type: 'object',
  fields: {
    customNodeId: {
      name: 'Custom node id',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
      },
      type: 'string',
    },
    actor: {
      name: 'Actor',
      config: {
        colSpan: 8,
        groupConfig: {
          group: {
            valueKey: 'id',
            label: 'id',
          },
          child: {
            valueKey: 'portrait',
            label: 'portrait',
          },
        },
      },
      type: 'select',
    },
    content: {
      name: 'Content',
      config: {
        colSpan: 11,
        autoFocus: true,
        needI18n: true,
        type: 'multiline',
      },
      type: 'string',
    },
    contentSpeed: {
      name: 'Content Speed',
      config: {
        colSpan: 11,
        targetProp: 'content',
      },
      type: 'string_speed',
    },
    enableCheck: {
      name: 'Enable check',
      config: {
        colSpan: 12,
        defaultValue: '',
        type: 'code',
        codeLang: 'python',
        showPopup: true,
      },
      type: 'string',
    },
  },
  config: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
};

const branchBasicDataSchemaConfig = {
  type: 'object',
  fields: {
    customNodeId: {
      name: 'Custom node id',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
      },
      type: 'string',
    },
    actor: {
      name: 'Actor',
      config: {
        colSpan: 8,
        groupConfig: {
          group: {
            valueKey: 'id',
            label: 'id',
          },
          child: {
            valueKey: 'portrait',
            label: 'portrait',
          },
        },
      },
      type: 'select',
    },
    content: {
      name: 'Content',
      config: {
        colSpan: 11,
        autoFocus: true,
        needI18n: true,
        type: 'multiline',
      },
      type: 'string',
    },
    contentSpeed: {
      name: 'Content Speed',
      config: {
        colSpan: 11,
        targetProp: 'content',
      },
      type: 'string_speed',
    },
    enableCheck: {
      name: 'Enable check',
      config: {
        colSpan: 12,
        defaultValue: '',
        type: 'code',
        codeLang: 'python',
        showPopup: true,
      },
      type: 'string',
    },
  },
  config: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
};

const actionBasicDataSchema = {
  type: 'object',
  fields: {
    customNodeId: {
      name: 'Custom node id',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
      },
      type: 'string',
    },
    actionType: {
      name: 'Action type',
      config: {
        colSpan: 4,
        options: [
          {
            label: 'code',
            value: 'code',
          },
          {
            label: 'jumpToNode',
            value: 'jumpToNode',
          },
          {
            label: 'copyNode',
            value: 'copyNode',
          },
        ],
        defaultValue: 'code',
      },
      type: 'select',
    },
    jumpTargetNode: {
      name: 'Jump target node',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
        enableWhen: "(v) => v.actionType === 'jumpToNode'",
        showPopup: true,
      },
      type: 'string',
    },
    copyTargetNode: {
      name: 'Copy target node',
      config: {
        colSpan: 4,
        defaultValue: '',
        type: 'singleline',
        enableWhen: "(v) => v.actionType === 'copyNode'",
        showPopup: true,
      },
      type: 'string',
    },
    process: {
      name: 'Process code',
      config: {
        colSpan: 12,
        defaultValue: '',
        type: 'code',
        codeLang: 'python',
        enableWhen: "(v) => v.actionType === 'code'",
        showPopup: true,
      },
      type: 'string',
    },
    enableCheck: {
      name: 'Enable check',
      config: {
        colSpan: 12,
        defaultValue: '',
        type: 'code',
        codeLang: 'python',
        showPopup: true,
      },
      type: 'string',
    },
  },
  config: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
};

const defaultActorSchema = {
  type: 'array',
  fieldSchema: {
    type: 'object',
    fields: {
      id: {
        name: 'id',
        config: {
          colSpan: 6,
        },
        type: 'string',
      },
      name: {
        name: 'name',
        config: {
          colSpan: 6,
          needI18n: true,
        },
        type: 'string',
      },
      portraits: {
        name: 'portraits',
        fieldSchema: {
          type: 'object',
          config: {
            colSpan: 12,
            summary: '{{pic}} {{id}}',
          },
          fields: {
            pic: {
              name: 'pic',
              config: {
                colSpan: 3,
                type: 'img',
              },
              type: 'file',
            },
            id: {
              name: 'id',
              config: {
                colSpan: 9,
              },
              type: 'string',
            },
          },
        },
        config: {
          height: '200px',
          colSpan: 12,
        },
        type: 'array',
      },
    },
    config: {
      colSpan: 12,
      initialExpand: true,
      summary: '{{___index}} {{portrais[0].pic}} {{id}} {{name}}',
    },
  },
  config: {
    colSpan: 12,
    initialExpand: true,
    fitRestHeight: true,
    summary: '{{___key}}',
  },
};

export const [useStoryStore, getStoryStore] = createGlobalStore(() => {
  const [story, setStory] = useState<{ [key: string]: Storylet }>({});
  const [currentStorylet, setCurrentStorylet] = useState<Storylet | null>(null);
  const [selection, setSelection] = useState<NodeSelection | null>(null);
  const [storyActors, setStoryActors] = useState<StoryActor[]>([]);
  const [nodeSettings, setNodeSettings] = useState<{
    root: NodeSettings;
    sentence: NodeSettings;
    branch: NodeSettings;
    action: NodeSettings;
  }>({
    root: {
      basicDataSchema: JSON.stringify(rootBasicDataSchemaConfig, null, 2),
      extraDataSchema: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2),
    },
    sentence: {
      basicDataSchema: JSON.stringify(sentenceBasicDataSchemaConfig, null, 2),
      extraDataSchema: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2),
    },
    branch: {
      basicDataSchema: JSON.stringify(branchBasicDataSchemaConfig, null, 2),
      extraDataSchema: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2),
    },
    action: {
      basicDataSchema: JSON.stringify(actionBasicDataSchema, null, 2),
      extraDataSchema: JSON.stringify(DEFAULT_CONFIG_JSON.OBJECT_JSON, null, 2),
    },
  });
  const [actorSettings, setActorSettings] = useState<string>(
    JSON.stringify(defaultActorSchema, null, 2)
  );
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const currentStoryletRef = useRef(currentStorylet);
  const storyRef = useRef(story);
  storyRef.current = story;
  const storyActorsRef = useRef(storyActors);

  const translationModule = useTranslation();

  const trackCurrentState = useCallback(() => {
    trackState('story', {
      story: { ...storyRef.current },
      currentStorylet: currentStoryletRef.current?.clone() || null,
      translations: cloneDeep(translationModule.translationsRef.current),
      currentLang: translationModule.currentLang,
      storyActors: storyActorsRef.current,
    });
  }, []);

  const nodeSchemaMap = useMemo(() => {
    return Object.keys(nodeSettings).reduce((res, key) => {
      res[key] = Object.keys(nodeSettings[key]).reduce((res2, key2) => {
        res2[key2] = buildSchema(
          JSON.parse(nodeSettings[key][key2])
        ) as SchemaFieldObject;
        return res2;
      }, {});
      return res;
    }, {});
  }, [nodeSettings]);

  const getNodeSchema = useCallback(
    (node: StoryletNode<StoryletNodeData>) => {
      return nodeSchemaMap[node.data.type];
    },
    [nodeSchemaMap]
  );

  useEffect(() => {
    const store = getTrackStore();
    if (!store) {
      return;
    }

    store.registerStoreSetter('story', (val: RawJson) => {
      setStory(val.story);
      setCurrentStorylet(val.currentStorylet?.clone() || null);
      translationModule.setTranslations(val.translations || {});
      translationModule.setCurrentLang(val.currentLang || LANG.EN);
      setStoryActors(val.storyActors || []);
    });
  }, [translationModule.updateTranslations, translationModule.switchLang]);

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

  const batchInsertChildNode = useCallback(
    (
      data: { nodes: StoryletNode<StoryletNodeData>[]; links: NodeLink[] },
      rootChildId: string,
      parentId: string
    ) => {
      if (!currentStorylet) {
        return;
      }
      const newVal = currentStorylet.clone();
      const parent = newVal.nodes[parentId];
      if (!parent) {
        return;
      }

      console.log('batch insert data: ', data);
      data.nodes.forEach((node) => {
        newVal.upsertNode(node);
        if (
          (node instanceof StoryletSentenceNode ||
            node instanceof StoryletBranchNode) &&
          !translationModule.hasTranslateKey(node.data.content)
        ) {
          translationModule.updateTranslateKey(node.data.content, '');
        }
        if (parent instanceof StoryletBranchNode) {
          node.data.option = {
            name: 'option_' + UUID(),
            controlType: 'visible',
            controlCheck: '',
          };
          translationModule.updateTranslateKey(node.data.option.name, '');
        } else {
          delete node.data.option;
        }
      });

      data.links.forEach((link) => {
        newVal.links[formatNodeLinkId(link.source.id, link.target.id)] = link;
      });
      newVal.upsertLink(parent.id, rootChildId);

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
    if (nodeView) {
      // nodeView.onblur = () => {
      //   if (selectionRef.current?.nodeId === nodeId) {
      //     nodeView.focus();
      //     nodeView.onblur = null;
      //   }
      // };
      nodeView.focus();
    }
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
        if (item.includes(id)) {
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
        child.order = maxBy(val.getNodeChildren(parent.id), 'order').order + 1;
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
        child.order = targetNode.order + 1;
        val.getNodeChildren(parent.id).forEach((node) => {
          if (node.order >= child.order && node.id !== child.id) {
            node.order += 1;
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

  useEffect(() => {
    const openStorylet = (fileId) => {
      setCurrentStorylet(story[fileId]);
    };
    const deleteStorylet = (fileId: string) => {
      setStory((prev) => {
        const storylet = story[fileId];
        setCurrentStorylet((prev2) => {
          if (prev2 && prev2.id === storylet.id) {
            return null;
          }
          return prev2;
        });
        const newVal = { ...prev };
        delete newVal[fileId];
        return newVal;
      });
    };
    const createStorylet = (file: any) => {
      setStory((prev) => {
        const newVal = { ...prev };
        const newStorylet = new Storylet();
        newStorylet.name = file.name;
        newVal[file.id] = newStorylet;
        return newVal;
      });
    };

    const updateStoryletName = (fileId: string, name: string) => {
      const storylet = story[fileId];
      if (!storylet) {
        return;
      }
      const newVal = storylet.clone();
      newVal.name = name;
      setCurrentStorylet(newVal);
    };

    const updateStory = (val: RawJson) => {
      const res = {};
      Object.keys(val).forEach((key) => {
        res[key] = Storylet.fromJson(val[key]);
        Object.keys(res[key].links)
          .filter(
            (k: any) => !res[key].links[k].source || !res[key].links[k].target
          )
          .forEach((l) => {
            console.warn('fing miss link: ', l);
            delete res[key].links[l];
          });
      });
      setStory(res);
    };

    const updateStoryActors = (val: any[]) => {
      setStoryActors(val);
    };

    const updateTranslations = (val: RawJson) => {
      translationModule.updateTranslations(val);
    };

    eventEmitter.on(Event.UpdateStory, updateStory);
    eventEmitter.on(Event.UpdateStoryActors, updateStoryActors);
    eventEmitter.on(Event.UpdateStoryTranslations, updateTranslations);
    eventEmitter.on(Event.CreateStorylet, createStorylet);
    eventEmitter.on(Event.DeleteStorylet, deleteStorylet);
    eventEmitter.on(Event.OpenStorylet, openStorylet);
    eventEmitter.on(Event.UpdateStoryletName, updateStoryletName);
    eventEmitter.on(Event.UpdateStoryNodeSettings, setNodeSettings);
    eventEmitter.on(Event.UpdateStoryActorSettings, setActorSettings);
    return () => {
      eventEmitter.off(Event.UpdateStory, updateStory);
      eventEmitter.off(Event.UpdateStoryActors, updateStoryActors);
      eventEmitter.off(Event.UpdateStoryTranslations, updateTranslations);
      eventEmitter.off(Event.CreateStorylet, createStorylet);
      eventEmitter.off(Event.DeleteStorylet, deleteStorylet);
      eventEmitter.off(Event.OpenStorylet, openStorylet);
      eventEmitter.off(Event.UpdateStoryletName, updateStoryletName);
      eventEmitter.off(Event.UpdateStoryNodeSettings, setNodeSettings);
      eventEmitter.off(Event.UpdateStoryActorSettings, setActorSettings);
    };
  }, [story, translationModule.updateTranslations]);

  useEffect(() => {
    if (!currentStorylet) {
      return;
    }
    setStory((prev) => {
      const fileKey = Object.keys(prev).find(
        (k) => prev[k].id === currentStorylet.id
      );
      if (!fileKey) {
        return prev;
      }
      const newVal = { ...prev };
      newVal[fileKey] = currentStorylet;
      return newVal;
    });
  }, [currentStorylet]);

  return {
    story,
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    insertSiblingNode,
    deleteNode,
    updateNode,
    batchInsertChildNode,
    moveStoryletNode,
    moveSelection,
    trackCurrentState,
    storyActors,
    updateStoryActors,
    nodeSettings,
    setNodeSettings,
    getNodeSchema,
    actorSettings,
    setActorSettings,
    ...translationModule,
  };
});
