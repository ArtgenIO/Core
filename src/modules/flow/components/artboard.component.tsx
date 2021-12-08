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
import { useHttpClientOld } from '../../admin/library/http-client';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import {
  catalogCollapsedAtom,
  elementsAtom,
  flowInstanceAtom,
  lambdaMetasAtom,
  selectedElementIdAtom,
  selectedNodeIdAtom,
  workflowAtom,
  workflowChangedAtom,
} from '../atom/artboard.atoms';
import { NodeFactory } from '../factory/node.factory';
import { ILogic } from '../interface/workflow.interface';
import { createNode } from '../util/create-node';
import { unserializeWorkflow } from '../util/unserialize-workflow';
import './artboard.component.less';
import ArtboardCatalogComponent from './artboard/catalog.component';
import ArtboardNodeConfigComponent from './artboard/config.component';
import ArtboardEdgeConfigComponent from './artboard/edge-config.component';
import CustomEdge from './artboard/edge.component';
import WorkflowNameComponent from './artboard/name.component';
import ArtboardToolsComponent from './artboard/tools.component';

export default function WorkflowArtboardComponent() {
  // Page state
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawerState = useResetRecoilState(pageDrawerAtom);
  // Router
  const workflowId = useParams<{ id: string }>().id;
  const httpClient = useHttpClientOld();

  // Local state
  const flowWrapper = useRef(null);
  const [customNodes, setCustomNodes] = useState<NodeTypesType>({});
  const [isLoading, setIsLoading] = useState(true);

  // Artboard state
  const setWorkflow = useSetRecoilState(workflowAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const [lambdaMetas, setLambdaMetas] = useRecoilState(lambdaMetasAtom);
  const [flowInstance, setFlowInstance] = useRecoilState(flowInstanceAtom);
  const setSelectedNodeId = useSetRecoilState(selectedNodeIdAtom);
  const setCatalogCollapsed = useSetRecoilState(catalogCollapsedAtom);
  const setIsWorkflowChanged = useSetRecoilState(workflowChangedAtom);
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

    setIsWorkflowChanged(true);
  };

  const onDrop = (event: DragEvent) => {
    const bounds = flowWrapper.current.getBoundingClientRect();

    setIsWorkflowChanged(true);

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
      const workflow = await httpClient.get<ILogic>(
        `/api/rest/main/workflow/${workflowId}`,
      );

      const customNodes: NodeTypesType = {};
      for (const node of nodes.data) {
        customNodes[kebabCase(node.type)] = NodeFactory.fromMeta(
          node,
          setSelectedNodeId,
        );
      }
      setCustomNodes(customNodes);
      setLambdaMetas(nodes.data);
      setWorkflow(workflow.data);
      setElements(unserializeWorkflow(workflow.data));
      setIsLoading(false);

      setPageDrawer(<ArtboardCatalogComponent />);

      if (!workflow.data.nodes.length) {
        setCatalogCollapsed(false);
      }
    })();

    return () => {
      setWorkflow(null);
      setElements([]);
      resetPageDrawerState();
    };
  }, [workflowId]);

  return (
    <>
      <div className="h-screen bg-dark">
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
                onChange={() => setIsWorkflowChanged(true)}
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
                <WorkflowNameComponent />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Skeleton>
      </div>
    </>
  );
}
