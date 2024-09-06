import { Box, Container, FormLabel, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import Grid2 from '@mui/material/Unstable_Grid2';
import * as d3 from 'd3';
import { clipboard } from 'electron';
import { get } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {
  iterSchema,
  SchemaField,
  SchemaFieldObject,
  SchemaFieldString,
} from '../../../../../models/schema';
import { buildSchema } from '../../../../../models/schema/factory';
import {
  Storylet,
  StoryletActionNode,
  StoryletBranchNode,
  StoryletNode,
  StoryletNodeData,
  StoryletRootNode,
  StoryletSentenceNode,
} from '../../../../../models/story/storylet';
import { NodeLink } from '../../../../../models/tree';
import { useStoryStore, useEditorStore } from '../../../../../stores';
import { animation, borderRadius } from '../../../../../theme';
import EditDialog from '../edit_dialog';

function CardPopup({ node }: { node: StoryletNode<StoryletNodeData> }) {
  const { nodeSchemaSettings } = useStoryStore();
  const [height, setHeight] = useState(0);
  const basicDataSchema = useMemo(() => {
    const basicsDataMap = {
      root: buildSchema(JSON.parse(nodeSchemaSettings.root.basicDataSchema)),
      sentence: buildSchema(
        JSON.parse(nodeSchemaSettings.sentence.basicDataSchema)
      ),
      branch: buildSchema(
        JSON.parse(nodeSchemaSettings.branch.basicDataSchema)
      ),
      action: buildSchema(
        JSON.parse(nodeSchemaSettings.action.basicDataSchema)
      ),
    };
    const res = basicsDataMap[node.data.type] as SchemaFieldObject;
    return res;
  }, [node, nodeSchemaSettings]);

  const components: React.ReactNode[] = [];
  iterSchema(
    basicDataSchema,
    (schema: SchemaField, path: string, label?: string) => {
      if (!schema.config.showPopup || !get(node.data, path)) {
        return;
      }
      
      if (schema instanceof SchemaFieldString) {
        if (schema.config.type !== 'code') {
          components.push(
            <Stack
              spacing={2}
              key={schema.config.fieldId}
              sx={{
                flexGrow: 1,
              }}
            >
              <FormLabel sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
                {label}
              </FormLabel>
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                {get(node.data, path)}
              </Box>
            </Stack>
          );
        } else {
          components.push(
            <Stack
              spacing={2}
              key={schema.config.fieldId}
              sx={{
                flexGrow: 1,
              }}
            >
              <FormLabel sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
                {label}
              </FormLabel>
              <Box sx={{ flexGrow: 1, height: '350px' }}>
                <MonacoEditor
                  width='100%'
                  height='100%'
                  language={schema.config.codeLang || 'python'}
                  theme='vs-dark'
                  value={get(node.data, path)}
                  options={{
                    insertSpaces: true,
                    autoIndent: 'full',
                    readOnly: true,
                    tabSize: 2,
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 28,
                    scrollbar: {
                      horizontal: 'auto',
                      vertical: 'auto',
                    },
                  }}
                />
              </Box>
            </Stack>
          );
        }
      }
    }
  );

  if (components.length <= 0) {
    return null;
  }

  let topHeight = -600;
  if (height >= 500) {
    topHeight = -1000;
  }

  return (
    <div
      className='absolute min-h-[500px] bg-[#ffffff] left-1/2 -translate-x-1/2 w-[1000px] top-[32px] p-4 rounded-[24px] flex flex-wrap gap-4'
      style={{
        top: topHeight,
      }}
    >
      {components.map((component, i) => {
        return component;
      })}
    </div>
  );
}


function CardComponents({ components }: { components: React.ReactNode[] }) {
  if (components.length <= 0) {
    return null;
  }

  return (
    <div
      className='flex flex-col gap-4 w-full'
    >
      {components.map((component, i) => {
        return component;
      })}
    </div>
  );
}

export default function BaseNodeCard({
  pos,
  node,
  color,
  children,
  onDrag,
  onDragEnd,
  style,
}: {
  node: StoryletNode<StoryletNodeData>;
  pos: { x: number; y: number };
  color: { normal: string; hover: string; active?: string };
  children?: React.ReactNode;
  onDrag?: (val: any) => void;
  onDragEnd?: (val: any) => void;
  style?: React.CSSProperties;
}) {
  const {
    currentStorylet,
    selection,
    selectNode,
    insertChildNode,
    batchInsertChildNode,
    insertSiblingNode,
    moveSelection,
    deleteNode,
    translations,
    updateTranslateKeyAll,
    getTranslationsForKey,
    updateNode,
    tr,
  } = useStoryStore();
  const viewRef = useRef<HTMLElement>();
  const [editOpen, setEditOpen] = useState(false);
  const { hasModal, setHasModal } = useEditorStore();
  const [isHover, setIsHover] = useState(false);
  const [isDraging, setIsDraging] = useState(false);
  if (!currentStorylet) {
    return null;
  }

  const isSelecting = selection === node.id;

  useLayoutEffect(() => {
    if (!viewRef.current) {
      return;
    }
    viewRef.current.tabIndex = isSelecting ? 1 : -1;
  }, [isSelecting]);

  const onSelect = useCallback(() => {
    if (editOpen) {
      return;
    }
    selectNode(node.id);
  }, [node.id, editOpen]);


  const { nodeSchemaSettings } = useStoryStore();
  const components: React.ReactNode[] = [];
  const basicDataSchema = useMemo(() => {
    const basicsDataMap = {
      root: buildSchema(JSON.parse(nodeSchemaSettings.root.basicDataSchema)),
      sentence: buildSchema(
        JSON.parse(nodeSchemaSettings.sentence.basicDataSchema)
      ),
      branch: buildSchema(
        JSON.parse(nodeSchemaSettings.branch.basicDataSchema)
      ),
      action: buildSchema(
        JSON.parse(nodeSchemaSettings.action.basicDataSchema)
      ),
    };
    const res = basicsDataMap[node.data.type] as SchemaFieldObject;
    return res;
  }, [node, nodeSchemaSettings]);
  iterSchema(
    basicDataSchema,
    (schema: SchemaField, path: string, label?: string) => {
      if (!schema.config.showPopup || !get(node.data, path)) {
        return;
      }
      
      if (schema instanceof SchemaFieldString) {
        if (schema.config.type !== 'code') {
          components.push(
            <Stack
              spacing={2}
              key={schema.config.fieldId}
              sx={{
                flexGrow: 1,
              }}
            >
              <FormLabel sx={{ fontWeight: 'bold', fontSize: '2.5rem', textAlign: 'center', pointerEvents: 'none' }}>
                {label}
              </FormLabel>
              <Box sx={{ flexGrow: 1, width: '100%', fontSize: '3rem', fontWeight: 600 }}>
                {get(node.data, path)}
              </Box>
            </Stack>
          );
        } else {
          components.push(
            <Stack
              spacing={2}
              key={schema.config.fieldId}
              sx={{
                flexGrow: 1,
              }}
            >
              <FormLabel sx={{ fontWeight: 'bold', fontSize: '2.5rem', textAlign: 'center', pointerEvents: 'none' }}>
                {label}
              </FormLabel>
              <Box sx={{ flexGrow: 1, height: '350px' }}>
                <MonacoEditor
                  width='100%'
                  height='100%'
                  language={schema.config.codeLang || 'python'}
                  theme='vs-dark'
                  value={get(node.data, path)}
                  options={{
                    insertSpaces: true,
                    autoIndent: 'full',
                    readOnly: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    wordWrapColumn: 100,
                    wrappingIndent: 'indent',
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 28,
                    scrollbar: {
                      // horizontal: 'auto',
                      vertical: 'auto',
                    },
                  }}
                />
              </Box>
            </Stack>
          );
        }
      }
    }
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSelecting || editOpen || hasModal) {
        return;
      }

      e.preventDefault();

      const duplicateNode = (targetNode: StoryletNode<StoryletNodeData>) => {
        const newNode = targetNode.clone();
        if (
          (newNode instanceof StoryletSentenceNode ||
            newNode instanceof StoryletBranchNode) &&
          (targetNode instanceof StoryletSentenceNode ||
            targetNode instanceof StoryletBranchNode)
        ) {
          updateTranslateKeyAll(
            newNode.data.content,
            getTranslationsForKey(targetNode.data.content)
          );

          if (newNode.data.option) {
            updateTranslateKeyAll(
              newNode.data.option.name,
              getTranslationsForKey(targetNode.data.option?.name as string)
            );
          }
        }
        return newNode;
      };

      let insertFn: Function | null = null;
      // Enter
      if (e.keyCode === 13) {
        insertFn = insertSiblingNode;
      }
      // Tab
      if (e.keyCode === 9) {
        insertFn = insertChildNode;
      }
      if (insertFn) {
        let newNode: StoryletNode<StoryletNodeData> =
          new StoryletSentenceNode();
        if (e.ctrlKey || e.metaKey) {
          newNode = new StoryletBranchNode();
          if (e.shiftKey) {
            newNode = new StoryletActionNode();
          }
        }
        insertFn(newNode, node);

        return;
      }

      if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey)) {
        const insertNodeFn = e.shiftKey ? insertSiblingNode : insertChildNode;
        const newNode = duplicateNode(node);
        insertNodeFn(newNode, node);
        return;
      }

      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          const relations = currentStorylet.getAllNodeChildrenRelations(
            node.id
          );
          const needCopy = { nodes: {}, links: {}, rootChildId: node.id };
          Object.keys(relations.nodes).forEach((k) => {
            needCopy.nodes[k] = relations.nodes[k].toJson();
          });
          Object.keys(relations.links).forEach((k) => {
            needCopy.links[k] = relations.links[k].toJson();
          });
          clipboard.writeText(JSON.stringify(needCopy));
        } else {
          clipboard.writeText(JSON.stringify(node.toJson()));
        }
        return;
      }

      if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey)) {
        const copyJson = JSON.parse(clipboard.readText());
        if ('nodes' in copyJson) {
          const idMap = {};
          const nodes: { [key: string]: StoryletNode<StoryletNodeData> } = {};
          const links: NodeLink[] = [];
          Object.keys(copyJson.nodes).forEach((k) => {
            const node = Storylet.fromNodeJson(copyJson.nodes[k]);
            const newNode = duplicateNode(node);
            idMap[copyJson.nodes[k].id] = newNode.id;
            nodes[newNode.id] = newNode;
          });
          Object.keys(copyJson.links).forEach((k) => {
            const originLinkData = copyJson.links[k];
            const newLink = new NodeLink(
              nodes[idMap[originLinkData.sourceId]],
              nodes[idMap[originLinkData.targetId]]
            );
            links.push(newLink);
          });
          batchInsertChildNode(
            { nodes: Object.values(nodes), links },
            idMap[copyJson.rootChildId],
            node.id
          );
          return;
        } else {
          const originNode = Storylet.fromNodeJson({
            ...copyJson,
          });
          if (e.shiftKey) {
            const duplicated = duplicateNode(originNode);
            node.data = duplicated.data;
            updateNode(node);
          } else {
            const newNode = duplicateNode(originNode);
            insertChildNode(newNode, node);
          }
        }
        return;
      }

      // Esc
      if (e.keyCode === 8 && !(node instanceof StoryletRootNode)) {
        deleteNode(node.id);
        return;
      }

      if (e.code === 'KeyE') {
        selectNode(null);

        setEditOpen(true);
        setIsHover(false);
        setIsDraging(false);
        setHasModal(true);
        return;
      }

      moveSelection(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    editOpen,
    isSelecting,
    insertChildNode,
    batchInsertChildNode,
    insertSiblingNode,
    moveSelection,
    deleteNode,
    translations,
    updateTranslateKeyAll,
    getTranslationsForKey,
    hasModal,
    setHasModal,
  ]);

  const close = useCallback(() => {
    setEditOpen(false);
    setIsHover(false);
    setIsDraging(false);
    setHasModal(false);
    setTimeout(() => {
      selectNode(node.id);
    }, 0);
  }, [selectNode, setHasModal]);

  return (
    <Box
      id={node.id}
      ref={(dom) => {
        if (!dom) {
          return;
        }

        viewRef.current = dom as HTMLElement;
        if (!currentStorylet.getNodeSingleParent(node.id)) {
          return;
        }
        const dragListener = d3
          .drag()
          .on('drag', (d) => {
            // 检查文档是否有带有focused类的monaco-editor元素
            const editorFocused = document.querySelector('.monaco-editor.focused');
            if (editorFocused) {
              return;
            }
            setIsDraging(true);
            setIsHover(false);
            if (onDrag) {
              onDrag(d);
            }
          })
          .on('end', (d) => {
            setIsDraging(false);
            if (onDragEnd) {
              onDragEnd(d);
            }
          });
        dragListener(d3.select(dom as any));
      }}
      sx={{
        position: 'absolute',
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor:
          !isSelecting && !isDraging
            ? color.normal
            : color.active || color.hover,
        ...animation.autoFade,
        ...borderRadius.larger,
        fontSize: '2rem',
        transform: `translate(${pos.y}px,${pos.x}px)`,
        height: components.length > 0 ? 'auto' : '220px',
        width: components.length > 0 ? '700px' : '500px',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        outline: 'none',
        '&:hover': {
          backgroundColor: color.hover,
        },
        zIndex: isHover ? 10 : isSelecting ? 2 : 1,
        ...style,
      }}
      onClick={onSelect}
      onMouseEnter={() => {
        if (!isDraging) {
          setIsHover(true);
        }
      }}
      onMouseLeave={() => {
        if (!isDraging) {
          setIsHover(false);
        }
      }}
    >
      {children}
      {node.data.customNodeId && (
        <Container
          sx={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            fontSize: '2.5rem',
            textAlign: 'center',
            color: 'common.white',
            fontWeight: 'bold',
            transform: 'translateX(-50%)',
          }}
        >
          {node.data.customNodeId}
        </Container>
      )}
      {/* {(isSelecting || isHover) && !editOpen && <CardPopup node={node} />} */}
      {components.length > 0 && <CardComponents components={components} />}

      {currentStorylet.getNodeSingleParent(node.id) instanceof
        StoryletBranchNode && (
        <Container
          sx={{
            position: 'absolute',
            // top: '50%',
            // left: '-170px',
            // width: '160px',
            top: '-90px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            p: 1,
            ...borderRadius.larger,
            minHeight: '60px',
            maxHeight: '120px',
            overflow: 'hidden',
            textAlign: 'center',
            backgroundColor: grey[50],
          }}
        >
          {tr(node.data.option?.name || '')}
        </Container>
      )}
      {editOpen && <EditDialog node={node} open={editOpen} close={close} />}
    </Box>
  );
}
