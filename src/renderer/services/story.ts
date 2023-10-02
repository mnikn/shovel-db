import { watch } from '@vue-reactivity/watch';
import { computed, ref, toValue } from '@vue/reactivity';
import { maxBy } from 'lodash';
import { FILE_GROUP } from '../../common/constants';
import { UUID } from '../../common/utils/uuid';
import ipc from '../electron/ipc';
import { DEFAULT_CONFIG_JSON } from '../models/schema';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletSentenceNode,
} from '../models/story/storylet';
import { formatNodeLinkId, NodeLink } from '../models/tree';
import { FileServiceType } from './file';
import TranslationService from './parts/translation';
import type { ProjectServiceType } from './project';

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
        colSpan: 10,
        autoFocus: true,
        needI18n: true,
        type: 'multiline',
      },
      type: 'string',
    },
    contentSpeed: {
      name: 'Content Speed',
      config: {
        colSpan: 2,
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

const StoryService = (
  fileService: FileServiceType,
  projectService: ProjectServiceType
) => {
  const translationService = TranslationService(projectService);
  let storyFileDataTable = ref<{
    [key: string]: Storylet;
  }>({});
  let currentStorylet = ref<Storylet | null>(null);
  let nodeSchemaSettings = ref({
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
  let actorSchemaSettings = ref(JSON.stringify(defaultActorSchema, null, 2));
  let selection = ref<string | null>(null);
  let actors = ref<any[]>([]);

  watch(
    () => [
      fileService.files.value,
      fileService.currentOpenFile.value,
      storyFileDataTable.value,
    ],
    () => {
      if (
        !fileService.currentOpenFile.value ||
        fileService.getFileRootParent(fileService.currentOpenFile.value)?.id !==
          FILE_GROUP.STORY
      ) {
        return;
      }
      if (!(fileService.currentOpenFile.value in storyFileDataTable.value)) {
        storyFileDataTable.value[fileService.currentOpenFile.value] =
          new Storylet();
        storyFileDataTable.value[fileService.currentOpenFile.value].name =
          fileService.files.value[fileService.currentOpenFile.value].name;
      }

      currentStorylet.value =
        storyFileDataTable.value[fileService.currentOpenFile.value];
    },
    {
      immediate: true,
    }
  );

  watch(
    () => projectService.projectPath.value,
    async (projectPath) => {
      if (!projectPath) {
        return;
      }
      const translationRawData = (
        await ipc.fetchDataFiles(projectPath, [['story', 'translations.csv']])
      )?.[0];
      if (translationRawData) {
        const translations: any = {};
        translationRawData.forEach((s, i) => {
          s.forEach((s2, j) => {
            if (j === 0) {
              translations[s2] = {};
            } else {
              translations[s[0]][projectService.langs.value[j - 1]] = s2;
            }
          });
        });
        translationService.restoreMemento({
          translations,
        });
      }

      const storyRawData = (
        await ipc.fetchDataFiles(projectPath, [['story', 'story.json']])
      )?.[0];
      if (storyRawData) {
        const res = {};
        Object.keys(storyRawData?.story).forEach((key) => {
          res[key] = Storylet.fromJson(storyRawData?.story?.[key]);
          Object.keys(res[key].links)
            .filter(
              (k: any) => !res[key].links[k].source || !res[key].links[k].target
            )
            .forEach((l) => {
              console.warn('fing miss link: ', l);
              delete res[key].links[l];
            });
        });
        storyFileDataTable.value = res;
        actors.value = storyRawData?.actors;
      }
    },
    {
      immediate: true,
    }
  );

  const selectNode = (nodeId: string | null) => {
    selection.value = nodeId;
  };

  const insertChildNode = (
    child: StoryletNode<StoryletNodeData>,
    parent: StoryletNode<StoryletNodeData>
  ) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }
    const newVal = currentStorylet.value.clone();
    newVal.upsertNode(child);
    if (
      (child instanceof StoryletSentenceNode ||
        child instanceof StoryletBranchNode) &&
      !translationService.hasTranslateKey(child.data.content)
    ) {
      translationService.updateTranslateKey(child.data.content, '');
    }

    if (parent instanceof StoryletBranchNode) {
      child.data.option = {
        name: 'option_' + UUID(),
        controlType: 'visible',
        controlCheck: '',
      };
      translationService.updateTranslateKey(child.data.option.name, '');
    } else {
      delete child.data.option;
    }
    newVal.upsertLink(parent.id, child.id);

    storyFileDataTable.value[fileService.currentOpenFile.value] = newVal;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const batchInsertChildNode = (
    data: { nodes: StoryletNode<StoryletNodeData>[]; links: NodeLink[] },
    rootChildId: string,
    parentId: string
  ) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }
    const newVal = currentStorylet.value.clone();
    const parent = newVal.nodes[parentId];
    if (!parent) {
      return;
    }

    data.nodes.forEach((node) => {
      newVal.upsertNode(node);
      if (
        (node instanceof StoryletSentenceNode ||
          node instanceof StoryletBranchNode) &&
        !translationService.hasTranslateKey(node.data.content)
      ) {
        translationService.updateTranslateKey(node.data.content, '');
      }
      if (parent instanceof StoryletBranchNode) {
        node.data.option = {
          name: 'option_' + UUID(),
          controlType: 'visible',
          controlCheck: '',
        };
        translationService.updateTranslateKey(node.data.option.name, '');
      } else {
        delete node.data.option;
      }
    });

    data.links.forEach((link) => {
      newVal.links[formatNodeLinkId(link.source.id, link.target.id)] = link;
    });
    newVal.upsertLink(parent.id, rootChildId);

    storyFileDataTable.value[fileService.currentOpenFile.value] = newVal;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const insertSiblingNode = (
    needInsert: StoryletNode<StoryletNodeData>,
    source: StoryletNode<StoryletNodeData>
  ) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }
    var parent = currentStorylet.value.getNodeSingleParent(source.id);
    if (!parent) {
      return;
    }
    const newVal = currentStorylet.value.clone();
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
      !translationService.hasTranslateKey(needInsert.data.content)
    ) {
      translationService.updateTranslateKey(needInsert.data.content, '');
    }

    if (parent instanceof StoryletBranchNode) {
      needInsert.data.option = {
        name: 'option_' + UUID(),
        controlType: 'visible',
        controlCheck: '',
      };
      translationService.updateTranslateKey(needInsert.data.option.name, '');
    } else {
      delete needInsert.data.option;
    }
    storyFileDataTable.value[fileService.currentOpenFile.value] = newVal;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const updateNode = (data: StoryletNode<StoryletNodeData>) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }
    const newVal = currentStorylet.value.clone();
    newVal.upsertNode(data);
    storyFileDataTable.value[fileService.currentOpenFile.value] = newVal;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const deleteNode = (id: string) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }

    const newVal = currentStorylet.value.clone();
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

    storyFileDataTable.value[fileService.currentOpenFile.value] = newVal;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const moveStoryletNode = (
    sourceId: string,
    targetNodeId: string,
    type: 'child' | 'parent'
  ) => {
    if (!currentStorylet.value || !fileService.currentOpenFile.value) {
      return;
    }

    const val = currentStorylet.value.clone();
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
        currentStorylet.value?.getNodeSingleParent(targetNodeId)?.id || '';
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

    storyFileDataTable.value[fileService.currentOpenFile.value] = val;
    storyFileDataTable.value = { ...storyFileDataTable.value };
  };

  const moveSelection = (direction: string) => {
    if (
      !selection.value ||
      !currentStorylet.value ||
      !fileService.currentOpenFile.value
    ) {
      return false;
    }

    const selectingNode = currentStorylet.value.nodes[selection.value];
    if (!selectingNode) {
      return false;
    }
    const parent = currentStorylet.value.getNodeSingleParent(selectingNode.id);
    const siblingNodes = parent
      ? currentStorylet.value
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
        const children = currentStorylet.value.getNodeChildren(
          selectingNode.id
        );
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
  };

  const updateActors = (val: any[]) => {
    actors.value = val;
  };

  const memento = computed(() => {
    return {
      story: {
        story: Object.keys(storyFileDataTable.value).reduce((res, key) => {
          res[key] = storyFileDataTable.value[key].toJson();
          return res;
        }, {}),
        actors: toValue(actors),
      },
      trasnlationMemento: translationService.memento.value,
    };
  });

  // type MementoType = typeof memento.value;
  // const restoreMemento = (newMemento: Partial<MementoType>) => {
  //   if (newMemento.trasnlationMemento !== undefined) {
  //     translationService.restoreMemento(newMemento.trasnlationMemento);
  //   }
  //   if (newMemento.story !== undefined) {
  //     storyFileDataTable.value = newMemento.story;
  //   }
  // };

  return {
    ...translationService,
    currentStorylet,
    nodeSchemaSettings,

    actorSchemaSettings,
    actors,
    updateActors,

    selection,
    selectNode,
    moveSelection,

    insertChildNode,
    batchInsertChildNode,
    insertSiblingNode,
    updateNode,
    deleteNode,
    moveStoryletNode,

    memento,
    // restoreMemento,
  };
};

export type StoryServiceType = ReturnType<typeof StoryService>;
export type StoryServiceMemento = StoryServiceType['memento'];
export default StoryService;
