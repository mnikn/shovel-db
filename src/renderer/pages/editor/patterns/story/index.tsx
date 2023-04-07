import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useStoryStore } from '../../../../store';
import useLayout from './use_layout';
import NodeCard from './node_card';
import { borderRadius } from '../../../../theme';
import { SchemaFieldSelect } from '../../../../models/schema';
import FieldSelect from '../../components/schema_form/field/select_field';

const i18nSchema = new SchemaFieldSelect({
  options: [
    {
      label: 'zh-cn',
      value: 'zh-cn',
    },
    {
      label: 'en',
      value: 'en',
    },
  ],
});

export default function Story() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement | null>(null);
  const [dragingNode, setDragingNode] = useState<any>(null);
  const {
    currentStorylet,
    selectNode,
    moveStoryletNode,
    trackCurrentState,
    switchLang,
    currentLang,
  } = useStoryStore();

  const dragingNodeRef = useRef<HTMLDivElement>(dragingNode);
  dragingNodeRef.current = dragingNode;
  const dragTargetRef = useRef<any>(null);

  const { zoom, treeData, linkData, refresh } = useLayout({
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
    <>
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
                  {dragingNode &&
                    item.id !== dragingNode.id &&
                    !!currentStorylet.getNodeSingleParent(nodeData.id) && (
                      <Box
                        sx={{
                          left: item.y - 70,
                          top: item.x + 10,
                          width: '8rem',
                          height: '8rem',
                          opacity: 0.8,
                          position: 'absolute',
                          cursor: 'pointer',
                          backgroundColor: '#ec4899',
                          ...borderRadius.round,
                          '&:hover': {
                            opacity: 1,
                          },
                          zIndex: 3,
                        }}
                        onMouseEnter={() => {
                          if (!currentStorylet) {
                            return;
                          }
                          dragTargetRef.current = {
                            node: nodeData,
                            type: 'parent',
                          };
                        }}
                        onMouseLeave={() => {
                          dragTargetRef.current = null;
                        }}
                      />
                    )}
                  {dragingNode && item.id !== dragingNode.id && (
                    <Box
                      sx={{
                        left: item.y + 370,
                        top: item.x + 10,
                        width: '8rem',
                        height: '8rem',
                        opacity: 0.8,
                        position: 'absolute',
                        cursor: 'pointer',
                        backgroundColor: '#ec4899',
                        ...borderRadius.round,
                        '&:hover': {
                          opacity: 1,
                        },
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
                  {
                    <NodeCard
                      pos={{ x: item.x0, y: item.y0 }}
                      node={nodeData}
                      onDrag={(val) => {
                        if (!dragingNodeRef.current) {
                          dragingNodeRef.current = item;
                          selectNode(null);
                          setDragingNode(item);
                          return;
                        }
                        item.x0 += val.dy / zoom;
                        item.y0 += val.dx / zoom;
                        refresh();
                      }}
                      onDragEnd={() => {
                        if (dragTargetRef.current) {
                          moveStoryletNode(
                            dragingNodeRef.current.id,
                            dragTargetRef.current.node.id,
                            dragTargetRef.current.type
                          );
                          trackCurrentState();
                        }

                        setDragingNode(null);
                        dragTargetRef.current = null;
                      }}
                    />
                  }
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
      <Box
        sx={{
          position: 'absolute',
          right: '24px',
          top: '24px',
          width: '120px',
        }}
      >
        <FieldSelect
          schema={i18nSchema}
          value={currentLang}
          onValueChange={switchLang}
        />
      </Box>
    </>
  );
}
