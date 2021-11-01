import { FileAddOutlined, PartitionOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import PageHeader from '../../backoffice/layout/PageHeader';
import PageWithHeader from '../../backoffice/layout/PageWithHeader';
import { IWorkflow } from '../interface/serialized-workflow.interface';

const sendRequest = async (data: Omit<IWorkflow, 'id'>) => {
  const response = await axios.post<IWorkflow>('/api/workflow', data);

  return response.data.id;
};

export default function CreateWorkflowComponent() {
  const history = useHistory();

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Workflows"
          avatar={{
            icon: <PartitionOutlined />,
          }}
          actions={
            <Link key="create" to="/backoffice/management/workflow/create">
              <Button type="primary" icon={<FileAddOutlined />}>
                New Template
              </Button>
            </Link>
          }
        />
      }
    >
      <div>
        <Form
          name="workflow"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={fdata => {
            message.info('Sending the WF data...');
            sendRequest({
              name: fdata.name,
              nodes: [],
              edges: [],
            }).then(id => {
              history.push(`/backoffice/management/workflow/drawboard/${id}`);
              message.success('Workflow ready!');
            });
          }}
          onFinishFailed={() => message.error('Failed to validate')}
        >
          <h1>Choose a workflow template</h1>

          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                pattern: /^[a-zA-Z0-9\s]+$/,
                message: 'Please input a name!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Template" name="template">
            <div>
              <br />
              [Blank]
              <br />
              [Create Resource]
              <br />
              [Read Resource]
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageWithHeader>
  );
}
