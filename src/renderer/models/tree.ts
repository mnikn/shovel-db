import { cloneDeep, maxBy } from 'lodash';
import { RawJson } from '../../type';
import { UUID } from '../../utils/uuid';

export function formatNodeLinkId(from: string, target: string) {
  return `${from}-${target}`;
}

// link
export interface NodeLinkData {
  [key: string]: any;
}

export interface NodeLinkJsonData {
  sourceId: string;
  targetId: string;
  data: NodeLinkData;
}

export class NodeLink {
  public source: Node<any>;
  public target: Node<any>;
  public data: NodeLinkData = {};

  constructor(source: Node<any>, target: Node<any>) {
    this.source = source;
    this.target = target;
  }

  toJson(): NodeLinkJsonData {
    const sourceId = this.source.id;
    const targetId = this.target.id;
    return {
      sourceId: sourceId,
      targetId: targetId,
      data: this.data,
    };
  }
}

// node
export interface NodeJsonData {
  id: string;
  [key: string]: any;
}

export class Node<T> {
  public id = `${this.idPrefix}_${UUID()}`;
  public order = -1;
  public data: T;

  constructor() {
    this.data = {} as T;
  }

  public toJson(): any {
    return {
      id: this.id,
      order: this.order,
      data: cloneDeep(this.data),
    };
  }

  static fromJson(json: any): Node<any> {
    const instance = new Node<any>();
    instance.id = json.id;
    instance.order = json.order;
    instance.data = json.data;
    return instance;
  }

  get idPrefix() {
    return 'node';
  }

  public clone(): Node<T> {
    const instance = new Node<T>();
    instance.data = cloneDeep(this.data);
    return instance;
  }
}

export class Tree<T> {
  public nodes: { [key: string]: Node<T> } = {};
  public links: { [key: string]: NodeLink } = {};

  public upsertNode(node: Node<T>) {
    this.nodes[node.id] = node;
  }

  public removeNode(id: string) {
    delete this.nodes[id];
    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.includes(id);
    });
    matchLinkIds.forEach(this.unlink.bind(this));
  }

  public upsertLink(fromNodeId: string, targetNodeId: string, linkData?: any) {
    if (!this.nodes[fromNodeId]) {
      throw new Error('from node not exists!');
    }
    if (!this.nodes[targetNodeId]) {
      throw new Error('target node not exists!');
    }
    const linkId = formatNodeLinkId(fromNodeId, targetNodeId);
    if (this.links[linkId]) {
      this.links[linkId].data = linkData || this.links[linkId].data;
    } else {
      this.links[linkId] = new NodeLink(
        this.nodes[fromNodeId],
        this.nodes[targetNodeId]
      );
      this.links[linkId].data = linkData || this.links[linkId].data;
    }

    const maxOrderNode = maxBy(this.getNodeChildren(fromNodeId), 'order');
    this.nodes[targetNodeId].order =
      this.nodes[targetNodeId].order !== -1
        ? this.nodes[targetNodeId].order
        : (maxOrderNode?.order !== undefined ? maxOrderNode?.order : -1) + 1;
  }

  public upsertLinks(fromNodeId: string, targetNodeIds: string[]) {
    targetNodeIds.forEach((childId) => {
      this.upsertLink(fromNodeId, childId);
    });
  }

  public unlink(linkId: string) {
    const parent = this.links[linkId].target;
    const unlinkNodeOrder = this.links[linkId].source.data.order;
    delete this.links[linkId];
    this.getNodeChildren(parent.id).forEach((item) => {
      if (item.order >= unlinkNodeOrder) {
        item.order -= 1;
      }
    });
    delete this.links[linkId];
  }

  public getNodeParents(id: string): Node<T>[] {
    const targetNode = this.nodes[id];
    if (!targetNode) {
      return [];
    }

    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.split('-')[1] === id;
    });

    return matchLinkIds.map((linkId) => {
      return this.links[linkId].source;
    });
  }

  public getNodeSingleParent(id: string): Node<T> | null {
    const parents = this.getNodeParents(id);
    return parents[0] || null;
  }

  public getNodeChildren(id: string): Node<T>[] {
    const targetNode = this.nodes[id];
    if (!targetNode) {
      return [];
    }

    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.split('-')[0] === id;
    });

    return matchLinkIds.map((linkId) => {
      return this.links[linkId].target;
    });
  }

  public getAllNodeChildrenRelations(id: string): {
    nodes: { [key: string]: Node<T> };
    links: { [key: string]: NodeLink };
  } {
    const targetNode = this.nodes[id];
    if (!targetNode) {
      return { nodes: {}, links: {} };
    }

    const result = { nodes: {}, links: {} };
    result.nodes[id] = targetNode;

    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.split('-')[0] === id;
    });
    matchLinkIds.forEach((linkId) => {
      result.links[linkId] = this.links[linkId];
      const childResult = this.getAllNodeChildrenRelations(
        this.links[linkId].target.id
      );
      result.nodes = { ...result.nodes, ...childResult.nodes };
      result.links = { ...result.links, ...childResult.links };
    });

    return result;
  }

  public toJson(): any {
    return {
      nodes: Object.keys(this.nodes).reduce((res: any, k) => {
        res[k] = this.nodes[k].toJson();
        return res;
      }, {}),
      links: Object.keys(this.links).reduce((res: any, k) => {
        res[k] = this.links[k].toJson();
        return res;
      }, {}),
    };
  }

  public toHierarchyJson(): RawJson[] {
    const rootNodes = Object.values(this.nodes)
      .sort((a, b) => {
        return a.order - b.order;
      })
      .filter((item) => {
        const isSource =
          Object.values(this.links).length === 0 ||
          Object.values(this.links).find(
            (item2) => item2.source?.id === item.id
          );
        const notTarget = !Object.values(this.links).find(
          (item2) => item2.target.id === item.id
        );
        return isSource && notTarget;
      });

    const json = rootNodes.map((item) => {
      return this.buildHierarchy(item, Object.values(this.links));
    });
    return json;
  }

  private buildHierarchy(node: RawJson, links: RawJson[]) {
    const children: RawJson[] = Object.values(links)
      .filter((item) => item.source?.id === node.id)
      .map((item) => {
        return {
          id: item.target.id,
          children: [] as RawJson[],
        };
      })
      .map((child) => {
        return this.buildHierarchy(child, links);
      });
    return {
      id: node.id,
      children: children.sort((a, b) => {
        return this.nodes[a.id].order - this.nodes[b.id].order;
      }),
    };
  }

  public static fromJson(json: any): Tree<any> {
    const instance = new Tree();
    instance.nodes = Object.keys(json.nodes).reduce((res: any, k: string) => {
      res[k] = Node.fromJson(json.nodes[k]);
      return res;
    }, {});

    instance.links = Object.keys(json.links).reduce((res: any, k: string) => {
      const data = json.links[k];
      const source = instance.nodes[data.sourceId];
      const target = instance.nodes[data.targetId];
      const link = new NodeLink(source, target);
      link.data = data.data;
      res[k] = link;
      return res;
    }, {});
    return instance;
  }

  public clone(): Tree<T> {
    const instance = new Tree<T>();
    const nodes = {};
    Object.keys(this.nodes).forEach((key) => {
      nodes[key] = this.nodes[key].clone();
    });
    instance.nodes = nodes;
    instance.links = cloneDeep(this.links);
    return instance;
  }
}
