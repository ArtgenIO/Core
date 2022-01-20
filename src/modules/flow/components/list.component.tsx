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
  Layout,
  List,
  message,
  Popconfirm,
  Skeleton,
} from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IFlow } from '../interface/flow.interface';
import CreateFlowComponent from './create.component';
import ManagerMenuComponent from './_menu/manager.component';

export default function FlowListComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [flows, setFlows] = useState<IFlow[]>([]);
  const httpClient = useHttpClientSimple();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState<boolean>(false);

  const doDeleteFlow = async (id: string) => {
    const flow = flows.find(wf => wf.id === id);

    if (flow) {
      try {
        await httpClient.delete(`${toRestSysRoute(SchemaRef.FLOW)}/${id}`);

        setFlows(wfs => wfs.filter(wf => wf.id !== id));

        message.success(`Flow [${flow.name}] has been deleted`, 3);
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
      .get<IFindResponse<IFlow>>(toRestSysRoute(SchemaRef.FLOW))
      .then(response => {
        setFlows(response.data.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <ManagerMenuComponent />
      </Sider>

      <Layout>
        <PageWithHeader
          header={
            <PageHeader
              title="Low Code - Flows"
              avatar={{
                icon: <PartitionOutlined />,
              }}
              actions={
                <Button
                  onClick={() => setShowCreate(true)}
                  type="primary"
                  icon={<FileAddOutlined />}
                >
                  New Flow
                </Button>
              }
            />
          }
        >
          <Skeleton active loading={isLoading}>
            {flows.length ? (
              <List
                bordered
                dataSource={flows}
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
                      title="Are You sure to delete this flow?"
                      okText="Yes, delete"
                      cancelText="No"
                      placement="left"
                      icon={<QuestionCircleOutlined />}
                      onConfirm={e => {
                        doDeleteFlow(row.id);
                        e.stopPropagation();
                      }}
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
          {showCreate ? (
            <CreateFlowComponent onClose={() => setShowCreate(false)} />
          ) : undefined}
        </PageWithHeader>
      </Layout>
    </Layout>
  );
}
