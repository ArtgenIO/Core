import { Skeleton } from 'antd';
import { kebabCase } from 'lodash';
import React, { DragEvent, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  ArrowHeadType,
  Background,
  BackgroundVariant,
  NodeTypesType,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { useParams } from 'react-router';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { pageDrawerAtom } from '../../admin/admin.atoms';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import {
  catalogCollapsedAtom,
  elementsAtom,
  flowAtom,
  flowChangedAtom,
  flowInstanceAtom,
  lambdaMetasAtom,
  selectedElementIdAtom,
  selectedNodeIdAtom,
} from '../atom/artboard.atoms';
import { NodeFactory } from '../factory/node.factory';
import { IFlow } from '../interface/flow.interface';
import { createNode } from '../util/create-node';
import { unserializeFlow } from '../util/unserialize-flow';
import './artboard.component.less';
import ArtboardCatalogComponent from './artboard/catalog.component';
import ArtboardNodeConfigComponent from './artboard/config.component';
import ArtboardEdgeConfigComponent from './artboard/edge-config.component';
import CustomEdge from './artboard/edge.component';
import FlowNameComponent from './artboard/name.component';
import ArtboardToolsComponent from './artboard/tools.component';

export default function FlowArtboardComponent() {
  // Page state
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawerState = useResetRecoilState(pageDrawerAtom);
  // Router
  const flowId: string = useParams().id;
  const httpClient = useHttpClientSimple();

  // Local state
  const flowWrapper = useRef(null);
  const [customNodes, setCustomNodes] = useState<NodeTypesType>({});
  const [isLoading, setIsLoading] = useState(true);

  // Artboard state
  const setFlow = useSetRecoilState(flowAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const [lambdaMetas, setLambdaMetas] = useRecoilState(lambdaMetasAtom);
  const [flowInstance, setFlowInstance] = useRecoilState(flowInstanceAtom);
  const setSelectedNodeId = useSetRecoilState(selectedNodeIdAtom);
  const setCatalogCollapsed = useSetRecoilState(catalogCollapsedAtom);
  const setIsFlowChanged = useSetRecoilState(flowChangedAtom);
  const setSelectedElementId = useSetRecoilState(selectedElementIdAtom);

  const onConnect = params =>
    setElements(els => {
      params.id = v4();
      params.type = 'smoothstep';

      if (!params.data) {
        params.data = {
          transform: '',
        };
      }

      if (!params.data.transform) {
        params.data.transform = '';
      }

      return addEdge(
        {
          ...params,
          type: 'artgen-edge',
          arrowHeadType: ArrowHeadType.ArrowClosed,
        },
        els,
      );
    });

  const onDragOver = event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    setIsFlowChanged(true);
  };

  const onDrop = (event: DragEvent) => {
    const bounds = flowWrapper.current.getBoundingClientRect();

    setIsFlowChanged(true);

    if (event.dataTransfer.getData('application/reactflow')) {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const node: ILambdaMeta = lambdaMetas.find(node => node.type === type);
      const element = createNode(node, flowInstance.getElements());
      element.position = flowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      setElements(elements => elements.concat(element));
      setCatalogCollapsed(true);
    }
  };

  useEffect(() => {
    (async () => {
      const nodes = await httpClient.get<ILambdaMeta[]>('/api/lambda');
      const flow = await httpClient.get<IFlow>(`/api/rest/main/flow/${flowId}`);

      const customNodes: NodeTypesType = {};
      for (const node of nodes.data) {
        customNodes[kebabCase(node.type)] = NodeFactory.fromMeta(
          node,
          setSelectedNodeId,
        );
      }
      setCustomNodes(customNodes);
      setLambdaMetas(nodes.data);
      setFlow(flow.data);
      setElements(unserializeFlow(flow.data));
      setIsLoading(false);

      setPageDrawer(<ArtboardCatalogComponent />);

      if (!flow.data.nodes.length) {
        setCatalogCollapsed(false);
      }
    })();

    return () => {
      setFlow(null);
      setElements([]);
      resetPageDrawerState();
    };
  }, [flowId]);

  return (
    <>
      <div className="h-screen bg-midnight-800 flowboard">
        <Skeleton loading={isLoading}>
          <ReactFlowProvider>
            <div className="w-full h-full" ref={flowWrapper}>
              <ReactFlow
                onConnect={onConnect}
                elements={elements}
                onLoad={(instance: OnLoadParams) => {
                  setFlowInstance(instance);

                  instance.fitView();
                }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onSelectionChange={elements => {
                  if (elements?.length) {
                    setSelectedElementId(elements[0].id);
                  } else {
                    setSelectedElementId(null);
                  }
                }}
                onChange={() => setIsFlowChanged(true)}
                nodeTypes={customNodes}
                defaultZoom={1.5}
                edgeTypes={{
                  'artgen-edge': CustomEdge,
                }}
                onClick={() => setCatalogCollapsed(true)}
              >
                <Background
                  variant={BackgroundVariant.Lines}
                  gap={24}
                  size={0.5}
                  color="#37393f"
                />

                <ArtboardNodeConfigComponent />
                <ArtboardEdgeConfigComponent />
                <ArtboardToolsComponent />
                <FlowNameComponent />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Skeleton>
      </div>
    </>
  );
}
