import {
  ApartmentOutlined,
  BuildOutlined,
  ClusterOutlined,
  CodeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Avatar, Layout, Menu } from 'antd';
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
} from 'react-flow-renderer';
import { useParams } from 'react-router';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import MenuBlock from '../../../admin/component/menu-block.component';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import {
  elementsAtom,
  flowAtom,
  flowChangedAtom,
  flowInstanceAtom,
  lambdaMetasAtom,
  selectedElementIdAtom,
  selectedNodeIdAtom,
} from '../../atom/artboard.atoms';
import { NodeFactory } from '../../factory/node.factory';
import { IFlow } from '../../interface/flow.interface';
import { createNode } from '../../util/create-node';
import { unserializeFlow } from '../../util/unserialize-flow';
import ArtboardCatalogComponent from './catalog.component';
import ArtboardNodeConfigComponent from './config.component';
import FlowContextExplorerComponent from './context-explorer.component';
import ArtboardEdgeConfigComponent from './edge-config.component';
import CustomEdge from './edge.component';
import './flowboard.component.less';
import FlowNameComponent from './name.component';
import FlowExportComponent from './serializer.component';
import ArtboardToolsComponent from './tools.component';

export default function FlowBoardComponent() {
  // Page state
  const [showCatalog, setShowCatalog] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);

  // Router
  const flowId: string = useParams().id;
  const client = useHttpClientSimple();

  // Local state
  const wrapper = useRef(null);
  const [customNodes, setCustomNodes] = useState<NodeTypesType>({});
  const [isLoading, setIsLoading] = useState(true);

  // Artboard state
  const [flow, setFlow] = useRecoilState(flowAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const [lambdaMetas, setLambdaMetas] = useRecoilState(lambdaMetasAtom);
  const [flowInstance, setFlowInstance] = useRecoilState(flowInstanceAtom);
  const setSelectedNodeId = useSetRecoilState(selectedNodeIdAtom);
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
    const bounds = wrapper.current.getBoundingClientRect();

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
    }
  };

  useEffect(() => {
    (async () => {
      const nodes = await client.get<ILambdaMeta[]>('/api/lambda');
      const flow = await client.get<IFlow>(
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

      if (!flow.data.nodes.length) {
        setShowCatalog(true);
      }
    })();

    return () => {
      setFlow(null);
      setElements([]);
    };
  }, [flowId]);

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock title="Flow">
          <div className="text-center py-2">
            <Avatar
              src={
                <ClusterOutlined className="text-9xl text-midnight-100 text-center mt-8" />
              }
              size={200}
              className="bg-midnight-800 rounded-3xl"
              shape="square"
            />
          </div>
          {flow && (
            <Menu
              className="compact"
              style={{ borderTop: '1px solid #333' }}
              selectable={false}
            >
              <Menu.Item
                key="context"
                icon={<ApartmentOutlined />}
                onClick={() => setShowExplorer(true)}
              >
                Context Explorer
              </Menu.Item>

              <Menu.Item
                key="export"
                icon={<CodeOutlined />}
                onClick={() => setShowExport(true)}
              >
                Serialize
              </Menu.Item>
            </Menu>
          )}
        </MenuBlock>

        <MenuBlock title="Triggers">
          {flow && (
            <Menu className="compact">
              {flow.nodes
                .filter(node => node.type.match('trigger'))
                .map(node => (
                  <Menu.Item key={node.id} icon={<PlayCircleOutlined />}>
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
                  <Menu.Item key={node.id} icon={<BuildOutlined />}>
                    {node.title}
                  </Menu.Item>
                ))}
            </Menu>
          )}
        </MenuBlock>
      </Sider>

      <Layout className="flowboard">
        <div className="w-full h-full bg-midnight-800" ref={wrapper}>
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
              onClick={() => setShowCatalog(false)}
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={24}
                size={0.5}
                color="#37393f"
              />

              <ArtboardNodeConfigComponent />
              <ArtboardEdgeConfigComponent />
              <ArtboardToolsComponent
                showCatalog={showCatalog}
                setShowCatalog={setShowCatalog}
              />
              <FlowNameComponent />
            </ReactFlow>
          )}
        </div>

        <ArtboardCatalogComponent
          showCatalog={showCatalog}
          setShowCatalog={setShowCatalog}
        />

        {showExport && (
          <FlowExportComponent
            flow={flow}
            onClose={() => setShowExport(false)}
          />
        )}

        {showExplorer && (
          <FlowContextExplorerComponent
            flow={flow}
            lambdas={lambdaMetas}
            onClose={() => setShowExplorer(false)}
          />
        )}
      </Layout>
    </Layout>
  );
}
