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
  List,
  message,
  Modal,
  Tabs,
} from 'antd';
import { kebabCase } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import {
  elementsAtom,
  nodesAtom,
  selectedNodeIdAtom,
  workflowChangedAtom,
} from '../../atom/drawboard.atoms';

export default function DrawboardNodeConfigComponent() {
  // Drawboard states
  const [selectedNodeId, setSelectedNodeId] =
    useRecoilState(selectedNodeIdAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const nodes = useRecoilValue(nodesAtom);
  const setIsWorkflowChanged = useSetRecoilState(workflowChangedAtom);

  // Local state
  const [configData, setConfigData] = useState(null);
  const [configSchema, setConfigSchema] = useState(null);
  const [nodeMeta, setNodeMeta] = useState<ILambdaMeta>(null);

  useEffect(() => {
    if (selectedNodeId) {
      // Local state
      const element = elements.find(el => el.id == selectedNodeId);
      const node = nodes.find(node => kebabCase(node.type) === element.type);

      setNodeMeta(node);
      setConfigSchema(node.config);
      setConfigData(element.data.config ?? {});
    }

    return () => {};
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
          {nodeMeta ? (
            <>
              <Descriptions
                title={<span className="font-thin">General Information</span>}
                layout="horizontal"
                column={1}
                bordered
              >
                <Descriptions.Item label="Identifier">
                  {selectedNodeId}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {nodeMeta.type}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {nodeMeta.description}
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
              formData={configData}
              onBlur={() => message.info('Node configuration applied')}
              onChange={state => {
                setElements(els => {
                  const oldNode = els.find(
                    el => el.id === selectedNodeId,
                  ) as Node;
                  const newNode: Node = {
                    id: oldNode.id,
                    type: oldNode.type,
                    data: {
                      label: oldNode.data.label,
                      type: oldNode.data.type,
                      config: state.formData,
                    },
                    position: oldNode.position,
                  };

                  const newElements = els.filter(
                    el => el.id !== selectedNodeId,
                  );
                  newElements.push(newNode);

                  setConfigData(state.formData);

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
          {nodeMeta ? (
            <List
              dataSource={nodeMeta.handles}
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
