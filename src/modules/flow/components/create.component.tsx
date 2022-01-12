import { Button, Drawer, Form, Input, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router';
import { useHttpClientOld } from '../../admin/library/http-client';
import { IFlow } from '../interface/flow.interface';

type Props = {
  onClose: () => void;
};

export default function CreateFlowComponent({ onClose }: Props) {
  const redirect = useNavigate();
  const httpClient = useHttpClientOld();

  const sendRequest = async (data: Omit<IFlow, 'id'>) => {
    const response = await httpClient.post<IFlow>('/api/rest/main/flow', data);

    return response.data.id;
  };

  return (
    <Drawer
      width="33%"
      visible={true}
      title={`Create New Flow`}
      onClose={onClose}
    >
      <Form
        name="flow"
        initialValues={{ remember: true }}
        onFinish={fdata => {
          message.info('Sending the WF data...');
          sendRequest({
            name: fdata.name,
            nodes: [],
            edges: [],
          }).then(id => {
            redirect(`/admin/flow/artboard/${id}`);
            message.success('Flow ready!');
          });
        }}
        onFinishFailed={() => message.error('Failed to validate')}
        className="mx-2"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input a name!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
