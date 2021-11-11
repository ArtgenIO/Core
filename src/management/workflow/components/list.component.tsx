import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
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
import { Link } from 'react-router-dom';
import PageHeader from '../../backoffice/layout/PageHeader';
import PageWithHeader from '../../backoffice/layout/PageWithHeader';
import { useHttpClientOld } from '../../backoffice/library/http-client';
import { IWorkflow } from '../interface/workflow.interface';

export default function WorkflowListComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const httpClient = useHttpClientOld();

  const doDeleteWorkflow = async (id: string) => {
    const workflow = workflows.find(wf => wf.id === id);

    if (workflow) {
      try {
        await httpClient.delete(`/api/workflow/${id}`);

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
      .get<IWorkflow[]>('/api/$system/management/workflow')
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
            <Link key="create" to="/backoffice/management/workflow/create">
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
              <List.Item key={row.id}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size="large"
                      className="bg-dark"
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
                <Button
                  icon={<BarChartOutlined />}
                  className="rounded-md mr-1 "
                ></Button>
                <Link
                  to={`/backoffice/management/workflow/drawboard/${row.id}`}
                >
                  <Button
                    icon={<EditOutlined />}
                    className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                  ></Button>
                </Link>
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
