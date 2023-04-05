import { RawJson } from '../../../type';
import { UUID } from '../../../utils/uuid';
import { cloneDeep } from 'lodash';
import { Node, NodeLink, Tree } from '../tree';

export enum NodeType {
  Root = 'root',
  Sentence = 'sentence',
  Branch = 'branch',
  Action = 'action',
}

type Code = string;

// base node
export interface StoryletNodeData {
  customNodeId?: string;
  type: NodeType;
  extraData: RawJson;
  enableCheck?: Code;
  beforeJumpProcess?: Code;
  afterJumpProcess?: Code;
  option?: {
    name: string;
    controlType: 'disable' | 'visible';
    controlCheck?: Code;
  };
}
export class StoryletNode<D extends StoryletNodeData> extends Node<D> {
  get idPrefix() {
    return 'storylet_node';
  }
}

// init node
export interface StoryletRootNodeData extends StoryletNodeData {}
export class StoryletRootNode extends StoryletNode<StoryletRootNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Root,
      extraData: {},
      beforeJumpProcess: '',
      afterJumpProcess: '',
    };
  }

  get idPrefix() {
    return 'root';
  }

  static fromJson(json: any): Node<any> {
    const instance = new StoryletRootNode();
    instance.id = json.id;
    instance.data = { ...json.data };
    // instance.data.extraData = json.data.extraData || {};
    // instance.data.customNodeId = json.data.customNodeId;
    // instance.data.beforeJumpProcess = json.data.beforeJumpProcess;
    // instance.data.afterJumpProcess = json.data.afterJumpProcess;
    // instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }
}

// sentence node
export interface StoryletSentenceNodeData extends StoryletNodeData {
  content: string;
  contentSpeed: { [key: string]: number[] };
  actor: { id: string; portrait: string } | null;
}
export class StoryletSentenceNode extends StoryletNode<StoryletSentenceNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Sentence,
      content: 'content_' + UUID(),
      contentSpeed: {},
      beforeJumpProcess: '',
      extraData: {},
      actor: null,
    };
  }

  get idPrefix() {
    return 'sentence';
  }

  static fromJson(json: RawJson): StoryletSentenceNode {
    const instance = new StoryletSentenceNode();
    instance.id = json.id;
    instance.data = { ...json.data };
    // instance.data.content = json.data.content;
    // instance.data.contentSpeed = json.data.contentSpeed || {};
    // instance.data.extraData = json.data.extraData || {};
    // instance.data.actor = json.data.actor;
    // instance.data.actorPortrait = json.data.actorPortrait;
    // instance.data.customNodeId = json.data.customNodeId;
    // instance.data.beforeJumpProcess = json.data.beforeJumpProcess;
    // instance.data.afterJumpProcess = json.data.afterJumpProcess;
    // instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }

  public clone(): StoryletSentenceNode {
    const instance = new StoryletSentenceNode();
    instance.data = cloneDeep(this.data);
    instance.data.content = `content_${UUID()}`;
    return instance;
  }
}

// branch node
export interface StoryletBranchNodeData extends StoryletNodeData {
  content: string;
  contentSpeed: { [key: string]: number[] };
  actor: { id: string; portrait: string } | null;
}
export class StoryletBranchNode extends StoryletNode<StoryletBranchNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Branch,
      content: 'content_' + UUID(),
      contentSpeed: {},
      beforeJumpProcess: '',
      extraData: {},
      actor: null,
    };
  }

  get idPrefix() {
    return 'branch';
  }

  static fromJson(json: any): StoryletBranchNode {
    const instance = new StoryletBranchNode();
    instance.id = json.id;
    instance.data = { ...json.data };
    // instance.data.content = json.data.content;
    // instance.data.contentSpeed = json.data.contentSpeed || {};
    // instance.data.extraData = json.data.extraData || {};
    // instance.data.actor = json.data.actor;
    // instance.data.customNodeId = json.data.customNodeId;
    // instance.data.beforeJumpProcess = json.data.beforeJumpProcess;
    // instance.data.afterJumpProcess = json.data.afterJumpProcess;
    // instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }

  public clone(): StoryletBranchNode {
    const instance = new StoryletBranchNode();
    instance.data = cloneDeep(this.data);
    instance.data.content = `content_${UUID()}`;
    return instance;
  }
}

export enum ActionType {
  JumpNode = 'jumpNode',
  JumpStorylet = 'jumpStorylet',
  Code = 'code',
}

// action node
export interface StoryletActionNodeData extends StoryletNodeData {
  actionType: ActionType;
  targetNode?: string;
  targetStorylet?: string;
  process?: string;
}
export class StoryletActionNode extends StoryletNode<StoryletActionNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Action,
      actionType: ActionType.Code,
      extraData: {},
    };
  }

  get idPrefix() {
    return 'action';
  }

  static fromJson(json: RawJson): StoryletActionNode {
    const instance = new StoryletActionNode();
    instance.id = json.id;
    instance.data = { ...json.data };
    // instance.data.customNodeId = json.data.customNodeId;
    // instance.data.actionType = json.data.customType;
    // instance.data.extraData = json.data.extraData;
    // instance.data.customNodeId = json.data.customNodeId;
    // instance.data.beforeJumpProcess = json.data.beforeJumpProcess;
    // instance.data.afterJumpProcess = json.data.afterJumpProcess;
    // instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }
}

export class Storylet extends Tree<StoryletNodeData> {
  public id: string = 'storylet_' + UUID();
  public name: string = '';

  constructor(newRoot = true) {
    super();
    if (newRoot) {
      const node = new StoryletRootNode();
      this.upsertNode(node);
    }
  }

  get root(): StoryletRootNode | null {
    return (
      Object.values(this.nodes).find((node) => {
        return node.data.type === NodeType.Root;
      }) || null
    );
  }

  public findParent(
    nodeId: string,
    parentId: string
  ): StoryletNode<any> | null {
    const parents = this.getNodeParents(nodeId);
    const node = parents.find((n) => n.id === parentId);
    if (node) {
      return node;
    }
    return parents.reduce((res: any, p) => {
      if (res) {
        return res;
      }
      res = this.findParent(p.id, parentId);
      return res;
    }, null);
  }

  public clone(): Storylet {
    const instance = new Storylet();
    instance.id = this.id;
    instance.name = this.name;
    instance.nodes = { ...this.nodes };
    instance.links = { ...this.links };
    return instance;
  }

  public toJson(): any {
    const data = super.toJson();
    data.name = this.name;
    data.id = this.id;
    return data;
  }

  // public upsertLink(
  //   fromNodeId: string,
  //   targetNodeId: string,
  //   linkData?: RawJson
  // ) {
  //   super.upsertLink(fromNodeId, targetNodeId, linkData);
  //   this.nodes[targetNodeId].data.order =
  //     this.nodes[targetNodeId].data.order !== -1
  //       ? this.nodes[targetNodeId].data.order
  //       : this.getNodeChildren(fromNodeId).length;
  // }

  // public unlink(linkId: string) {
  //   const parent = this.links[linkId].target;
  //   const unlinkNodeOrder = this.links[linkId].source.data.order;
  //   super.unlink(linkId);
  //   this.getNodeChildren(parent.id).forEach((item) => {
  //     if (item.data.order >= unlinkNodeOrder) {
  //       item.data.order -= 1;
  //     }
  //   });
  //   delete this.links[linkId];
  // }

  public getNodeChildrenLinks(id: string): NodeLink[] {
    return Object.values(this.links).filter((item) => item.source.id === id);
  }

  public static fromJson(json: RawJson): Storylet {
    const instance = new Storylet();

    instance.nodes = Object.keys(json.nodes).reduce(
      (res: RawJson, k: string) => {
        const nodeType = json.nodes[k].data.type;
        const nodeData = json.nodes[k];
        let instance: RawJson | null = null;
        if (nodeType === NodeType.Sentence) {
          instance = StoryletSentenceNode.fromJson(nodeData);
        } else if (nodeType === NodeType.Branch) {
          instance = StoryletBranchNode.fromJson(nodeData);
        } else if (nodeType === NodeType.Action) {
          instance = StoryletActionNode.fromJson(nodeData);
        } else if (nodeType === NodeType.Root) {
          instance = StoryletRootNode.fromJson(nodeData);
        }
        if (instance) {
          res[k] = instance;
        }
        return res;
      },
      {}
    );

    instance.links = Object.keys(json.links).reduce((res: any, k: string) => {
      const data = json.links[k];
      const source = instance.nodes[data.sourceId];
      const target = instance.nodes[data.targetId];
      const link = new NodeLink(source, target);
      link.data = data.data;
      res[k] = link;
      return res;
    }, {});

    instance.id = json.id;
    instance.name = json.name;
    return instance;
  }
}
