import { BuildOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { kebabCase } from 'lodash';
import { DragEvent, useEffect, useRef, useState } from 'react';
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
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
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
import ArtboardCatalogComponent from './artboard/catalog.component';
import ArtboardNodeConfigComponent from './artboard/config.component';
import ArtboardEdgeConfigComponent from './artboard/edge-config.component';
import CustomEdge from './artboard/edge.component';
import FlowNameComponent from './artboard/name.component';
import ArtboardToolsComponent from './artboard/tools.component';
import './flowboard.component.less';

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
  const [flow, setFlow] = useRecoilState(flowAtom);
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
      const flow = await httpClient.get<IFlow>(
        `${toRestSysRoute(SchemaRef.FLOW)}/${flowId}`,
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
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock title="Triggers">
          {flow && (
            <Menu className="compact">
              {flow.nodes
                .filter(node => node.type.match('trigger'))
                .map(node => (
                  <Menu.Item icon={<PlayCircleOutlined />}>
                    {node.title}
                  </Menu.Item>
                ))}
            </Menu>
          )}
        </MenuBlock>
        <MenuBlock title="Nodes">
          {flow && (
            <Menu className="compact">
              {flow.nodes
                .filter(node => !node.type.match('trigger'))
                .map(node => (
                  <Menu.Item icon={<BuildOutlined />}>{node.title}</Menu.Item>
                ))}
            </Menu>
          )}
        </MenuBlock>
      </Sider>

      <Layout className="flowboard">
        <ReactFlowProvider>
          <div className="w-full h-full bg-midnight-800" ref={flowWrapper}>
            {!isLoading && (
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
            )}
          </div>
        </ReactFlowProvider>
      </Layout>
    </Layout>
  );
}
