import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { useStoryStore } from '../../../../store';
// import useEventState from 'renderer/utils/use_event_state';
// import { Storylet } from 'renderer/models/storylet';
// import StoryProvider from '../../services/story_provider';
// import eventBus, { Event } from './event';
// import { EVENT } from 'react-contexify/dist/constants';

// function findNodeById(json: any, id: string): any | null {
//   if (!json) {
//     return null;
//   }
//   if (json.id === id) {
//     return json;
//   }

//   let res: any | null = null;
//   json.children.forEach((item: any) => {
//     res = res || findNodeById(item, id);
//   });

//   return res;
// }

const initialScale = 0.4;
const initialPos = [2500, 1000];
export default function useLayout({
  zoomDom,
  dragingNode,
}: {
  zoomDom: HTMLElement | null;
  dragingNode: any;
}) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);
  const [zoom, setZoom] = useState<number>(1);

  const { currentStorylet } = useStoryStore();

  //   const currentStorylet = useEventState<Storylet>({
  //     event: StoryProvider.event,
  //     property: 'currentStorylet',
  //     initialVal: StoryProvider.currentStorylet || undefined,
  //   });

  useLayoutEffect(() => {
    if (!currentStorylet) {
      return;
    }
    const data = currentStorylet.clone();
    if (dragingNode) {
      Object.keys(data.links).forEach((k) => {
        if (k.includes(dragingNode.data.id)) {
          delete data.links[k];
        }
      });
      delete data.nodes[dragingNode.id];
    }
    const json = data.toHierarchyJson()[0] || {};
    const root = d3.hierarchy(json) as d3.HierarchyRectangularNode<any>;
    root.x0 = 0;
    root.y0 = 0;
    const tree = d3.tree().nodeSize([400, 900]);
    tree(root);

    root.descendants().forEach((d: any) => {
      d.id = d.data.id;
      d._children = d.children;
    });

    const updateNodeTree = (source: any) => {
      let nodes = root.descendants().reverse();
      if (dragingNode) {
        nodes = nodes.concat(dragingNode);
      }

      setTreeData(nodes);

      // Stash the old positions for transition.
      root.eachBefore((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      const diagonal = d3
        .linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x);
      const svg = d3.select('#dialogue-tree-links-container');
      svg.selectAll('*').remove();
      const gLink = svg
        .append('g')
        .attr('id', 'dialogue-tree-links')
        .style('position', 'absolute')
        .attr('fill', 'none')
        .attr('stroke', '#ffd4a3')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 5);

      const transition = (svg as any)
        .transition()
        .duration(300)
        .tween(
          'resize',
          (window as any).ResizeObserver
            ? null
            : () => () => svg.dispatch('toggle')
        );

      const link = gLink
        .selectAll('path')
        .data(root.links(), (d: any) => d.target.id)
        .style('position', 'absolute');
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append('path');
      // Transition links to their new position.

      const links: any[] = [];
      (link as any)
        .merge(linkEnter)
        .transition(transition)
        .attr('d', (c) => {
          const nodeSource = {
            ...(c as any).source,
          };
          nodeSource.x += 80;
          nodeSource.y += 400;
          const targetSource = {
            ...(c as any).target,
          };
          targetSource.x += 80;

          links.push({
            from: nodeSource,
            target: targetSource,
            data:
              (nodeSource.data?.links || []).find(
                (l) =>
                  l.sourceId === nodeSource.data.id &&
                  l.targetId === targetSource.data.id
              )?.data || {},
          });
          /* targetSource.y = targetSource.y - 30; */
          return diagonal({
            source: nodeSource,
            target: targetSource,
          });
        });

      setLinkData(links);

      // Transition exiting nodes to the parent's new position.
      (link as any)
        .exit()
        .transition(transition)
        .remove()
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o } as any);
        });
    };

    updateNodeTree(root);
  }, [currentStorylet, dragingNode]);

  useLayoutEffect(() => {
    if (!zoomDom) {
      return;
    }

    const elm = document.querySelector('#main-content');
    if (!elm) {
      return;
    }

    const onZoom = function () {
      let transformRes = d3.zoomTransform(elm);
      // transformRes = transformRes.translate(initialPos[0], initialPos[1]);
      // transformRes = transformRes.scale(initialScale);
      setZoom(transformRes.k);
      d3.select(zoomDom).style(
        'transform',
        `translate(${transformRes.x}px,${transformRes.y}px) scale(${transformRes.k})`
      );
    };

    // const updatePos = (pos) => {
    //   if (!elm) {
    //     return;
    //   }
    //   d3.zoom().translateBy(d3.select(elm), pos[0], pos[1]);
    //   onZoom();
    //   let transformRes = d3.zoomTransform(elm);
    //   transformRes = transformRes.translate(initialPos[0], initialPos[1]);
    //   transformRes = transformRes.scale();
    //   d3.select(zoomDom).style(
    //     'transform',
    //     `translate(${transformRes.x}px,${transformRes.y}px) scale(${transformRes.k})`
    //   );
    // };

    // eventBus.on(Event.UPDATE_VIEW_POS, updatePos);

    d3.select(elm).call(
      /* eslint-disable func-names */
      d3.zoom().on('zoom', onZoom)
    );
    d3.zoom().translateTo(d3.select(elm), initialPos[0], initialPos[1]);
    d3.zoom().scaleTo(d3.select(elm), initialScale);
    onZoom();

    d3.select(elm).on('dblclick.zoom', null);

    // return () => {
    //   eventBus.off(Event.UPDATE_VIEW_POS, updatePos);
    // };
  }, [zoomDom]);

  const refresh = useCallback(() => {
    setTreeData((prev: any) => {
      return [...prev];
    });
  }, []);

  const resetZoom = useCallback(() => {
    const elm = document.querySelector('#main-content');
    if (!elm || !zoomDom) {
      return;
    }
    d3.zoom().translateTo(d3.select(elm), initialPos[0], initialPos[1]);
    d3.zoom().scaleTo(d3.select(elm), initialScale);
    const transformRes = d3.zoomTransform(elm);
    setZoom(transformRes.k);
    d3.select(zoomDom).style(
      'transform',
      `translate(${transformRes.x}px,${transformRes.y}px) scale(${transformRes.k})`
    );
    // d3.select(zoomDom).style(
    //   'transform',
    //   `translate(${initialPos[0]}px,${initialPos[1]}px) scale(${initialScale})`
    // );
  }, [zoomDom]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    zoom,
    treeData,
    linkData,
    refresh,
    resetZoom,
  };
}
