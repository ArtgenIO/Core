import {
  BugOutlined,
  BuildOutlined,
  ClusterOutlined,
  CodeOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Avatar, Layout, Menu, message, Switch } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { cloneDeep, kebabCase } from 'lodash';
import { DragEvent, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  ArrowHeadType,
  Background,
  BackgroundVariant,
  Elements,
  isNode,
  NodeTypesType,
  OnLoadParams,
  useZoomPanHelper,
} from 'react-flow-renderer';
import { useParams } from 'react-router';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';
import MenuBlock from '../../../admin/component/menu-block.component';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import { IFindResponse } from '../../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { createLayouOrganizer } from '../../../schema/util/layout-organizer';
import { lambdaMetasAtom } from '../../atom/artboard.atoms';
import { NodeFactory } from '../../factory/node.factory';
import { ICapturedContext } from '../../interface/captured-context.interface';
import { IFlow } from '../../interface/flow.interface';
import { createNode } from '../../util/create-node';
import { unserializeFlow } from '../../util/unserialize-flow';
import ContextListComponent from '../_menu/context-list.component';
import FlowContextExplorerComponent from './context-explorer.component';
import ArtboardEdgeConfigComponent from './edge-config.component';
import { SmartEdgeFactory } from './edge-factory.component';
import FlowboardName from './flow-name.component';
import FlowBoardSerializer from './flow-serializer.component';
import FlowboardTools from './flow-tools.component';
import './flowboard.component.less';
import FlowboardLambdaCatalog from './lambda-catalog.component';
import FlowBoardNodeConfig from './node-config.component';

export default function FlowBoardComponent() {
  const [flow, setFlow] = useState<IFlow>(null);

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
  const [selectedMenuNodes, setSelectedMenuNodes] = useState([]);
  const { setCenter } = useZoomPanHelper();
  const [capturedContexts, setCapturedContexts] = useState<ICapturedContext[]>(
    [],
  );
  const [appliedContext, setAppliedContext] = useState<ICapturedContext>(null);

  // Artboard state
  const [lambdaMetas, setLambdaMetas] = useRecoilState(lambdaMetasAtom);
  const [flowInstance, setFlowInstance] = useState<OnLoadParams>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>(null);
  const [focusedElementId, setFocusedElementId] = useState<string>(null);
  const [elements, setElements] = useState<Elements>([]);

  const layoutOrganizer = createLayouOrganizer(300, 60);

  useEffect(() => {
    setSelectedMenuNodes([selectedNodeId]);

    if (selectedNodeId) {
      zoomTo(selectedNodeId);
    }
  }, [selectedNodeId]);

  const zoomTo = (nodeId: string) => {
    if (flowInstance) {
      const el = flowInstance
        .getElements()
        .filter(isNode)
        .find(e => e.id === nodeId);

      if (el) {
        setCenter(el.position.x + 400, el.position.y + 200, 1.5, 1000);
      }
    }
  };

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

    console.log('Drag over');
  };

  const onDrop = (event: DragEvent) => {
    const bounds = wrapper.current.getBoundingClientRect();

    console.log('Drop over');

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
      const [lambdaReply, flowReply] = await Promise.all([
        client.get<ILambdaMeta[]>('/api/lambda'),
        client.get<IFlow>(`${toRestSysRoute(SchemaRef.FLOW)}/${flowId}`),
      ]);

      const customNodes: NodeTypesType = {};

      for (const node of lambdaReply.data) {
        customNodes[kebabCase(node.type)] = NodeFactory.fromMeta(
          node,
          setSelectedNodeId,
        );
      }

      setCustomNodes(customNodes);
      setLambdaMetas(lambdaReply.data);
      setFlow(flowReply.data);
      setElements(layoutOrganizer(unserializeFlow(flowReply.data), 'TB'));
      setIsLoading(false);

      if (!flowReply.data.nodes.length) {
        setShowCatalog(true);
      }
    })();

    client
      .get<IFindResponse<ICapturedContext>>(
        toRestSysRoute(SchemaRef.FLOW_EXEC, q =>
          q
            .filter(f => f.filterExpression('flowId', 'eq', flowId))
            .orderBy('createdAt desc')
            .top(5),
        ),
      )
      .then(reply => setCapturedContexts(reply.data.data));

    return () => {
      setFlow(null);
      setElements([]);
    };
  }, [flowId]);

  return (
    <Layout hasSider>
      <Sider width={260} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock title="Flow">
          <div className="text-center py-2">
            <Avatar
              src={
                <ClusterOutlined className="text-9xl text-midnight-100 text-center mt-8" />
              }
              size={220}
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
                key="export"
                icon={<CodeOutlined />}
                onClick={() => setShowExport(true)}
              >
                Serialize
              </Menu.Item>

              <Menu.Item key="active" icon={<SwitcherOutlined />}>
                Active
                <Switch
                  size="small"
                  className="float-right mt-2"
                  checked={flow.isActive}
                  onChange={newValue =>
                    setFlow(oldState => {
                      const newState = cloneDeep(oldState);
                      newState.isActive = newValue;

                      client.patch(
                        toRestSysRoute(SchemaRef.FLOW) + `/${newState.id}`,
                        newState,
                      );

                      message.info(
                        `Flow is ${newValue ? 'activated' : 'inactivated'}`,
                      );

                      return newState;
                    })
                  }
                ></Switch>
              </Menu.Item>

              <Menu.Item key="capture" icon={<BugOutlined />}>
                Capture Context
                <Switch
                  size="small"
                  className="float-right mt-2"
                  checked={flow.captureContext}
                  onChange={newValue =>
                    setFlow(oldState => {
                      const newState = cloneDeep(oldState);
                      newState.captureContext = newValue;

                      client.patch(
                        toRestSysRoute(SchemaRef.FLOW) + `/${newState.id}`,
                        newState,
                      );

                      message.info(
                        `Flow's context capture is ${
                          newValue ? 'activated' : 'inactivated'
                        }`,
                      );

                      return newState;
                    })
                  }
                ></Switch>
              </Menu.Item>
            </Menu>
          )}
        </MenuBlock>

        <MenuBlock title="Nodes">
          {flow && (
            <Menu selectedKeys={selectedMenuNodes} className="compact">
              {flow.nodes
                .sort((a, b) => (a.position[0] < b.position[0] ? 1 : -1))
                .map((node, x) => (
                  <Menu.Item
                    key={node.id}
                    icon={<BuildOutlined />}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {node.title}
                  </Menu.Item>
                ))}
            </Menu>
          )}
        </MenuBlock>

        <ContextListComponent
          flow={flow}
          capturedContexts={capturedContexts}
          setAppliedContext={setAppliedContext}
          setShowExplorer={setShowExplorer}
        />
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
                  setFocusedElementId(elements[0].id);
                } else {
                  setFocusedElementId(null);
                }
              }}
              onChange={() => {
                console.log('Changed');
              }}
              nodeTypes={customNodes}
              defaultZoom={1.5}
              edgeTypes={{
                'artgen-edge': SmartEdgeFactory({
                  onClick: setSelectedEdgeId,
                }),
              }}
              onClick={() => setShowCatalog(false)}
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={24}
                size={0.5}
                color="#37393f"
              />

              {selectedEdgeId && (
                <ArtboardEdgeConfigComponent
                  selectedEdgeId={selectedEdgeId}
                  setSelectedEdgeId={setSelectedEdgeId}
                  elements={elements}
                  setElements={setElements}
                />
              )}
              <FlowboardTools
                showCatalog={showCatalog}
                setShowCatalog={setShowCatalog}
                setSelectedNodeId={setSelectedNodeId}
                focusedElementId={focusedElementId}
                setElements={setElements}
                flowInstance={flowInstance}
                flow={flow}
              />
              <FlowboardName flow={flow} setFlow={setFlow} />
            </ReactFlow>
          )}
        </div>

        {selectedNodeId && (
          <FlowBoardNodeConfig
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            elements={elements}
            setElements={setElements}
          />
        )}

        <FlowboardLambdaCatalog
          showCatalog={showCatalog}
          setShowCatalog={setShowCatalog}
          setElements={setElements}
          flowInstance={flowInstance}
        />

        {showExport && (
          <FlowBoardSerializer
            flow={flow}
            onClose={() => setShowExport(false)}
          />
        )}

        {showExplorer && (
          <FlowContextExplorerComponent
            flow={flow}
            lambdas={lambdaMetas}
            onClose={() => setShowExplorer(false)}
            appliedContext={appliedContext}
          />
        )}
      </Layout>
    </Layout>
  );
}
