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
export type StoryletRootNodeData = StoryletNodeData;
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
    instance.order = json.order || -1;
    instance.data = { ...json.data };
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
    instance.id = json.id || instance.id;
    instance.order = json.order || -1;
    instance.data = { ...json.data };
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
    instance.id = json.id || instance.id;
    instance.order = json.order || -1;
    instance.data = { ...json.data };
    return instance;
  }

  public clone(): StoryletBranchNode {
    const instance = new StoryletBranchNode();
    instance.data = cloneDeep(this.data);
    instance.data.content = `content_${UUID()}`;
    if (instance.data.option) {
      instance.data.option.name = `option_${UUID()}`;
    }
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
    instance.id = json.id || instance.id;
    instance.order = json.order || -1;
    instance.data = { ...json.data };
    return instance;
  }

  public clone(): StoryletActionNode {
    const instance = new StoryletActionNode();
    instance.data = cloneDeep(this.data);
    if (instance.data.option) {
      instance.data.option.name = `option_${UUID()}`;
    }
    return instance;
  }
}

export class Storylet extends Tree<StoryletNodeData> {
  public id: string = 'storylet_' + UUID();
  public name = '';

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

  public getNodeChildrenLinks(id: string): NodeLink[] {
    return Object.values(this.links).filter((item) => item.source.id === id);
  }

  public static fromJson(json: RawJson): Storylet {
    const instance = new Storylet();

    instance.nodes = Object.keys(json.nodes).reduce(
      (res: RawJson, k: string) => {
        res[k] = Storylet.fromNodeJson(json.nodes[k]);
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

  public static fromNodeJson(json: RawJson): StoryletNode<StoryletNodeData> {
    const nodeType = json.data.type;
    const nodeData = json;
    let instance: StoryletNode<StoryletNodeData> | null = new StoryletNode();
    if (nodeType === NodeType.Sentence) {
      instance = StoryletSentenceNode.fromJson(nodeData);
    } else if (nodeType === NodeType.Branch) {
      instance = StoryletBranchNode.fromJson(nodeData);
    } else if (nodeType === NodeType.Action) {
      instance = StoryletActionNode.fromJson(nodeData);
    } else if (nodeType === NodeType.Root) {
      instance = StoryletRootNode.fromJson(nodeData);
    }
    return instance;
  }
}
