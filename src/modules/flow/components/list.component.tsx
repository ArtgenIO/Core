import {
  DeleteOutlined,
  FileAddOutlined,
  FileOutlined,
  PartitionOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  List,
  message,
  Popconfirm,
  Skeleton,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../admin/library/http-client';
import { toODataRoute } from '../../content/util/schema-url';
import { ILogic } from '../interface/workflow.interface';

export default function WorkflowListComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<ILogic[]>([]);
  const httpClient = useHttpClientOld();
  const navigate = useNavigate();

  const doDeleteWorkflow = async (id: string) => {
    const workflow = workflows.find(wf => wf.id === id);

    if (workflow) {
      try {
        await httpClient.delete(`/api/rest/main/workflow/${id}`);

        setWorkflows(wfs => wfs.filter(wf => wf.id !== id));

        message.success(`Workflow [${workflow.name}] has been deleted`, 3);
      } catch (error: any) {
        message.error(
          `Server error: ${typeof error === 'string' ? error : error?.message}`,
          3,
        );
      }
    } else {
      message.error('State missmatch, reload the page please!', 3);
    }
  };

  useEffect(() => {
    httpClient
      .get<ILogic[]>(toODataRoute({ database: 'main', reference: 'Workflow' }))
      .then(response => {
        setWorkflows(response.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Workflows"
          avatar={{
            icon: <PartitionOutlined />,
          }}
          actions={
            <Link key="create" to="/admin/flow/create">
              <Button type="primary" icon={<FileAddOutlined />}>
                New Workflow
              </Button>
            </Link>
          }
        />
      }
    >
      <Skeleton active loading={isLoading}>
        {workflows.length ? (
          <List
            bordered
            dataSource={workflows}
            size="small"
            renderItem={row => (
              <List.Item
                key={row.id}
                onClick={() => navigate(`/admin/flow/artboard/${row.id}`)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size="large"
                      className="bg-midnight-800"
                      icon={<FileOutlined />}
                    />
                  }
                  description={
                    <>
                      <b>Tags: ---</b>
                    </>
                  }
                  title={row.name}
                />

                <Popconfirm
                  title="Are You sure to delete this workflow?"
                  okText="Yes, delete"
                  cancelText="No"
                  placement="left"
                  icon={<QuestionCircleOutlined />}
                  onConfirm={() => doDeleteWorkflow(row.id)}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={e => e.stopPropagation()}
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                  ></Button>
                </Popconfirm>
              </List.Item>
            )}
          ></List>
        ) : (
          <Empty />
        )}
      </Skeleton>
    </PageWithHeader>
  );
}
