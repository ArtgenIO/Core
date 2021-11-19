import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Tabs,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect } from 'react';
import { ArrowHeadType, Edge } from 'react-flow-renderer';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  elementsAtom,
  selectedEdgeIdAtom,
  workflowChangedAtom,
} from '../../atom/artboard.atoms';

export default function ArtboardEdgeConfigComponent() {
  // Artboard states
  const [selectedEdgeId, setSelectedEdgeId] =
    useRecoilState(selectedEdgeIdAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const setIsWorkflowChanged = useSetRecoilState(workflowChangedAtom);

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
      const element = elements.find(el => el.id == selectedEdgeId);

      form.setFieldsValue({
        transform: element.data.transform ?? '',
      });
    }

    return () => {};
  }, [selectedEdgeId]);

  if (!selectedEdgeId) {
    return <></>;
  }

  return (
    <Modal
      title={
        <>
          <SettingOutlined /> Edge [{selectedEdgeId}]
        </>
      }
      visible
      closable
      maskClosable
      centered
      width="50%"
      footer={null}
      onCancel={() => setSelectedEdgeId(null)}
    >
      <Tabs tabPosition="left" style={{ minHeight: 400 }} size="large">
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
            </Descriptions>
            <Divider />
            <div className="text-right">
              <Button
                danger
                type="primary"
                onClick={() => onDeleteEdge(selectedEdgeId)}
                icon={<DeleteOutlined />}
              >
                Delete Edge
              </Button>
            </div>
          </>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Configuration" key="config">
          <Form
            form={form}
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
                  arrowHeadType: ArrowHeadType.ArrowClosed,
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
              setIsWorkflowChanged(true);
            }}
          >
            <Form.Item label="Transformation" name="transform">
              <Input />
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
}
