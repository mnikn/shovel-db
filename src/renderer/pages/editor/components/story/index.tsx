import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useStoryStore } from '../../../../store';
import useLayout from './use_layout';
import NodeCard from './node_card';

export default function Story() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement | null>(null);
  const [dragingNode, setDragingNode] = useState<any>(null);
  const { currentStorylet } = useStoryStore();

  const dragingNodeRef = useRef<HTMLDivElement>(dragingNode);
  dragingNodeRef.current = dragingNode;
  const dragTargetRef = useRef<any>(null);

  const { zoom, treeData, linkData } = useLayout({
    zoomDom,
    dragingNode,
  });

  const onDomMounted = useCallback((dom: HTMLDivElement) => {
    if (dom) {
      setZoomDom(dom);
    }
  }, []);

  if (!currentStorylet) {
    return null;
  }

  return (
    <Box
      id='main-content'
      sx={{
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <Box
        id='graph-container'
        ref={onDomMounted}
        sx={{
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
      >
        <Box
          id='nodes'
          sx={{
            height: '100%',
            width: '100%',
            position: 'absolute',
          }}
        >
          {treeData.map((item) => {
            const nodeData = currentStorylet.nodes[item.id];
            return (
              <div key={item.id}>
                {dragingNode && item !== dragingNode && (
                  <div
                    className='w-32 h-32 bg-pink-500 opacity-80 absolute hover:opacity-100 rounded-full cursor-pointer'
                    style={{
                      left: item.y + 700,
                      top: item.x + 20,
                      zIndex: 3,
                    }}
                    onMouseEnter={() => {
                      if (!currentStorylet) {
                        return;
                      }
                      dragTargetRef.current = {
                        node: nodeData,
                        type: 'child',
                      };
                    }}
                    onMouseLeave={() => {
                      dragTargetRef.current = null;
                    }}
                  />
                )}
                {<NodeCard pos={{ x: item.x0, y: item.y0 }} node={nodeData} />}
              </div>
            );
          })}
        </Box>

        <svg
          id='dialogue-tree-links-container'
          className='absolute w-full h-full'
          style={{
            overflow: 'inherit',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
}
