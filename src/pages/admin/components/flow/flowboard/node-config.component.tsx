import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Form from '@rjsf/antd';
import {
  Avatar,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Input,
  List,
  message,
  Tabs,
} from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Edge, Node } from 'reactflow';
import { useRecoilValue } from 'recoil';
import {
  CustomNode,
  CustomNodeData,
} from '../../../../../api/types/custom-node';
import { Elements } from '../../../../../api/types/elements.interface';
import { ILambdaHandle } from '../../../../../api/types/lambda-handle.interface';
import { ILambdaMeta } from '../../../../../api/types/meta.interface';

import { lambdaMetasAtom } from '../../../atoms/artboard.atoms';
import HandleSchemaComponent from './handle-schema.component';

type Props = {
  selectedNodeId: string | null;
  setSelectedNodeId: Dispatch<SetStateAction<string>>;
  elements: Elements;
  setElements: Dispatch<SetStateAction<Elements>>;
};

export default function FlowBoardNodeConfig({
  selectedNodeId,
  setSelectedNodeId,
  elements,
  setElements,
}: Props) {
  // Artboard states
  const lambdas = useRecoilValue(lambdaMetasAtom);

  // Local state
  const [configValue, setConfigValue] = useState(null);
  const [configSchema, setConfigSchema] = useState(null);
  const [nodeData, setNodeData] = useState<CustomNodeData>(null);
  const [lambdaMeta, setLambdaMeta] = useState<ILambdaMeta>(null);
  const [showHandleSchema, setShowHandleSchema] = useState<ILambdaHandle>(null);

  useEffect(() => {
    if (selectedNodeId) {
      // Local state
      const node = elements.find(el => el.id == selectedNodeId) as CustomNode;
      const meta = lambdas.find(lambda => lambda.type === node.data.type);

      setLambdaMeta(meta);
      setConfigSchema(meta.config);
      setConfigValue(node.data.config ?? null);
      setNodeData(node.data);
    }

    return () => {
      setNodeData(null);
      setConfigValue(null);
      setConfigSchema(null);
      setLambdaMeta(null);
    };
  }, [selectedNodeId]);

  if (!selectedNodeId) {
    return <></>;
  }

  const doDeleteNode = (nodeId: string) => {
    setElements(els => {
      return els.filter(el => {
        const keys = Object.keys(el);

        // Delete edges
        if (keys.includes('target')) {
          const edge = el as Edge;

          if (edge.target === nodeId || edge.source === nodeId) {
            return false;
          }
        }

        // Delete nodes
        return el.id !== nodeId;
      });
    });
  };

  const doDupeNode = (nodeId: string) => {
    setElements(els => {
      const dupe = cloneDeep(els.find(el => el.id === nodeId) as Node);
      dupe.id =
        dupe.id.replace(/\d+$/, '') +
        (parseInt(dupe.id.replace(/^.+\.(\d+)$/, '$1'), 10) + 1).toString();

      dupe.position.y = dupe.position.y + 100;
      dupe.position.x = dupe.position.x + 100;

      const newState = cloneDeep(els);
      newState.push(dupe);

      setSelectedNodeId(dupe.id);

      return newState;
    });

    message.success('Node has been duplicated!');
  };

  return (
    <Drawer
      width="50%"
      title={
        <div className="flex w-full">
          <div className="grow">Node » {selectedNodeId}</div>

          <div className="shrink">
            <div className="-mt-1 pr-2">
              <Button
                className="text-purple-500 border-purple-500 hover:text-purple-200 hover:border-purple-200 inline-block"
                block
                icon={<CopyOutlined />}
                onClick={() => doDupeNode(selectedNodeId)}
              >
                Duplicate Node
              </Button>
            </div>
          </div>

          <div className="shrink">
            <div className="-mt-1">
              <Button
                className="text-red-500 border-red-500 hover:text-red-200 hover:border-red-200  inline-block"
                block
                icon={<DeleteOutlined />}
                onClick={() => doDeleteNode(selectedNodeId)}
              >
                Delete Node
              </Button>
            </div>
          </div>
        </div>
      }
      open
      closable
      maskClosable
      footer={null}
      onClose={() => setSelectedNodeId(null)}
    >
      <Tabs tabPosition="left" size="large" defaultActiveKey="config">
        <Tabs.TabPane tab="Information" key="info">
          {lambdaMeta ? (
            <>
              <Descriptions
                title={<span className="font-thin">General Information</span>}
                layout="horizontal"
                column={1}
                bordered
              >
                <Descriptions.Item label="Title">
                  <Input
                    placeholder="Title"
                    defaultValue={nodeData.title}
                    onChange={event => {
                      setElements(els => {
                        const node = cloneDeep(
                          els.find(el => el.id === selectedNodeId),
                        ) as CustomNode;

                        node.data.title = event.target.value;

                        const newElements = els.filter(
                          el => el.id !== selectedNodeId,
                        );
                        newElements.push(node);

                        setNodeData(node.data);

                        return newElements;
                      });
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Identifier">
                  {selectedNodeId}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {lambdaMeta.type}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {lambdaMeta.description}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : (
            <></>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Configuration" key="config">
          {configSchema ? (
            <Form
              schema={configSchema}
              formData={configValue}
              onBlur={() => message.info('Node configuration applied')}
              onChange={state => {
                setElements(els => {
                  const node = cloneDeep(
                    els.find(el => el.id === selectedNodeId),
                  ) as CustomNode;

                  node.data.config = state.formData;

                  const newElements = els.filter(
                    el => el.id !== selectedNodeId,
                  );
                  newElements.push(node);

                  setConfigValue(state.formData);

                  return newElements;
                });
              }}
            >
              <></>
            </Form>
          ) : (
            <>
              <h1 className="font-thin text-center">
                This node has no configuration
              </h1>
              <Divider />
              <Empty />
            </>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Handles" key="handles">
          {lambdaMeta ? (
            <List
              dataSource={lambdaMeta.handles}
              size="large"
              bordered
              renderItem={handle => (
                <List.Item
                  key={handle.id}
                  actions={[
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => setShowHandleSchema(handle)}
                    >
                      Schema
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size="large"
                        className={
                          handle.direction === 'input'
                            ? 'bg-blue-400'
                            : 'bg-green-400'
                        }
                        icon={
                          handle.direction === 'input' ? (
                            <LoginOutlined />
                          ) : (
                            <LogoutOutlined />
                          )
                        }
                      />
                    }
                    description={
                      <>
                        <b>Direction:</b> <span>{handle.direction}</span>
                      </>
                    }
                    title={handle.id}
                  />
                </List.Item>
              )}
            ></List>
          ) : (
            <h1>Node has no handle?</h1>
          )}
        </Tabs.TabPane>
      </Tabs>

      {showHandleSchema && (
        <HandleSchemaComponent
          handle={showHandleSchema}
          onClose={() => setShowHandleSchema(null)}
        />
      )}
    </Drawer>
  );
}
