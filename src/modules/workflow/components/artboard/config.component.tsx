import {
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Form from '@rjsf/antd';
import {
  Avatar,
  Button,
  Descriptions,
  Divider,
  Empty,
  Input,
  List,
  message,
  Modal,
  Tabs,
} from 'antd';
import cloneDeep from 'lodash.clonedeep';
import React, { useEffect, useState } from 'react';
import { Edge } from 'react-flow-renderer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import {
  elementsAtom,
  lambdaMetasAtom,
  selectedNodeIdAtom,
  workflowChangedAtom,
} from '../../atom/artboard.atoms';
import { CustomNode, CustomNodeData } from '../../interface/custom-node';

export default function ArtboardNodeConfigComponent() {
  // Artboard states
  const lambdas = useRecoilValue(lambdaMetasAtom);
  const [selectedNodeId, setSelectedNodeId] =
    useRecoilState(selectedNodeIdAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const setIsWorkflowChanged = useSetRecoilState(workflowChangedAtom);

  // Local state
  const [configValue, setConfigValue] = useState(null);
  const [configSchema, setConfigSchema] = useState(null);
  const [nodeData, setNodeData] = useState<CustomNodeData>(null);
  const [lambdaMeta, setLambdaMeta] = useState<ILambdaMeta>(null);

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

    message.warn('Node has been removed');

    setSelectedNodeId(null);
  };

  return (
    <Modal
      centered
      width="50%"
      title={
        <>
          <SettingOutlined /> Node [{selectedNodeId}]
        </>
      }
      visible
      closable
      maskClosable
      footer={null}
      onCancel={() => setSelectedNodeId(null)}
    >
      <Tabs tabPosition="left" style={{ minHeight: 400 }} size="large">
        <Tabs.TabPane tab="Information" key="info">
          {lambdaMeta ? (
            <>
              <Descriptions
                title={<span className="font-thin">General Information</span>}
                layout="horizontal"
                column={1}
                bordered
              >
                <Descriptions.Item label="Label">
                  <Input
                    placeholder="Label"
                    defaultValue={nodeData.label}
                    onChange={event => {
                      setElements(els => {
                        const node = cloneDeep(
                          els.find(el => el.id === selectedNodeId),
                        ) as CustomNode;

                        node.data.label = event.target.value;

                        const newElements = els.filter(
                          el => el.id !== selectedNodeId,
                        );
                        newElements.push(node);

                        setNodeData(node.data);

                        return newElements;
                      });

                      setIsWorkflowChanged(true);
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
              <Divider />
              <div className="text-right">
                <Button
                  danger
                  type="primary"
                  onClick={() => doDeleteNode(selectedNodeId)}
                  icon={<DeleteOutlined />}
                >
                  Delete Node
                </Button>
              </div>
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

                setIsWorkflowChanged(true);
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
                <List.Item key={handle.id} actions={[<>Disconnect</>]}>
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
    </Modal>
  );
}
