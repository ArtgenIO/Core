import {
  BuildOutlined,
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  List,
  message,
  Tabs,
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useForm } from 'antd/lib/form/Form';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Edge, isNode, MarkerType, Node } from 'reactflow';
import { useRecoilValue } from 'recoil';
import { Elements } from '../../../../types/elements.interface';
import { ILambdaHandle } from '../../../../types/lambda-handle.interface';
import { lambdaMetasAtom } from '../../../atoms/artboard.atoms';
import HandleSchemaComponent from './handle-schema.component';

type Props = {
  setSelectedEdgeId: Dispatch<SetStateAction<string>>;
  selectedEdgeId: string;
  elements: Elements;
  setElements: Dispatch<SetStateAction<Elements>>;
};

export default function ArtboardEdgeConfigComponent({
  selectedEdgeId,
  setSelectedEdgeId,
  elements,
  setElements,
}: Props) {
  // Artboard states
  const [showHandleSchema, setShowHandleSchema] = useState<ILambdaHandle>(null);
  const [edge, setEdge] = useState<Edge>(null);

  const [sourceNode, setSourceNode] = useState<Node>(null);
  const [targetNode, setTargetNode] = useState<Node>(null);

  const [sourceHandle, setSourceHandle] = useState<ILambdaHandle>(null);
  const [targetHandle, setTargetHandle] = useState<ILambdaHandle>(null);

  const lambdaMetas = useRecoilValue(lambdaMetasAtom);

  const onDeleteEdge = (edgeId: string) => {
    setElements(els => {
      return els.filter(el => el.id !== edgeId);
    });

    setSelectedEdgeId(null);

    message.warn('Edge has been deleted');
  };

  // Local state
  const [form] = useForm();

  useEffect(() => {
    if (selectedEdgeId) {
      // Local state
      const edge = elements.find(el => el.id == selectedEdgeId) as Edge;

      form.setFieldsValue({
        transform: edge.data.transform ?? '',
      });

      const sourceNode = elements.find(el => el.id === edge.source) as Node;
      const targetNode = elements.find(el => el.id === edge.target) as Node;

      setEdge(edge);

      setSourceNode(sourceNode);
      setTargetNode(targetNode);

      setSourceHandle(
        lambdaMetas
          .find(lam => lam.type == sourceNode.data.type)
          .handles.find(h => h.id == edge.sourceHandle),
      );
      setTargetHandle(
        lambdaMetas
          .find(lam => lam.type == targetNode.data.type)
          .handles.find(h => h.id == edge.targetHandle),
      );
    } else {
      setEdge(null);
    }
  }, [selectedEdgeId]);

  if (!edge) {
    return <></>;
  }

  return (
    <Drawer
      title={
        <div className="flex w-full">
          <div className="grow">
            <span className="text-primary-500">Edge</span> {edge.source} »{' '}
            {edge.target}
          </div>
          <div className="shrink">
            <div className="-mt-1">
              <Button
                className="text-red-500 border-red-500 hover:text-red-200 hover:border-red-200"
                block
                icon={<DeleteOutlined />}
                onClick={() => onDeleteEdge(selectedEdgeId)}
              >
                Delete Edge
              </Button>
            </div>
          </div>
        </div>
      }
      open
      closable
      maskClosable
      width="50%"
      footer={null}
      onClose={() => setSelectedEdgeId(null)}
    >
      <Tabs tabPosition="left" defaultActiveKey="config" size="large">
        <Tabs.TabPane tab="Information" key="info">
          <>
            <Descriptions
              title={<span className="font-thin">General Information</span>}
              layout="horizontal"
              column={1}
              bordered
            >
              <Descriptions.Item label="Identifier">
                {selectedEdgeId}
              </Descriptions.Item>

              <Descriptions.Item label="Source">
                {sourceNode.id} // {sourceNode.data.type} » {edge.sourceHandle}
              </Descriptions.Item>

              <Descriptions.Item label="Target">
                {targetNode.id} // {targetNode.data.type} » {edge.targetHandle}
              </Descriptions.Item>
            </Descriptions>
          </>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Configuration" key="config">
          <Button.Group className="w-full">
            <Button
              block
              icon={<LoginOutlined className="text-success-400" />}
              key="source"
              onClick={() => setShowHandleSchema(sourceHandle)}
            >
              Show [Source] Handle
            </Button>
            <Button
              block
              key="target"
              icon={<LogoutOutlined className="text-primary-400" />}
              onClick={() => setShowHandleSchema(targetHandle)}
            >
              Show [Target] Handle
            </Button>
          </Button.Group>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            name="basic"
            onChange={formData => {
              setElements(els => {
                const oldEdge = els.find(
                  el => el.id === selectedEdgeId,
                ) as Edge;
                const newEdge: Edge = {
                  id: oldEdge.id,
                  source: oldEdge.source,
                  target: oldEdge.target,
                  sourceHandle: oldEdge.sourceHandle,
                  targetHandle: oldEdge.targetHandle,
                  type: oldEdge.type,
                  markerEnd: MarkerType.ArrowClosed,
                  data: {
                    ...oldEdge.data,
                    transform: form.getFieldValue('transform') ?? '',
                  },
                };

                const newElements = els.filter(el => el.id !== selectedEdgeId);
                newElements.push(newEdge);

                return newElements;
              });

              // Close
              console.log('Edge changed');
            }}
          >
            <Alert
              type="info"
              message="Handles carry data between the source node's output and the target node's input, you can transform the target's input data while transfering"
              className="mb-2"
            />
            <Form.Item name="transform">
              <Input.TextArea
                rows={12}
                className="bg-midnight-800 text-white font-code"
              />
            </Form.Item>
          </Form>

          <Divider />

          <List
            dataSource={elements.filter(isNode)}
            size="large"
            bordered
            renderItem={node => (
              <List.Item key={node.id}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size="large"
                      className="bg-yellow-400"
                      icon={<BuildOutlined />}
                    />
                  }
                  description={
                    <>
                      <b>Type:</b> <span>{node.data.type}</span>
                    </>
                  }
                  title={node.id}
                />
              </List.Item>
            )}
          ></List>
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
