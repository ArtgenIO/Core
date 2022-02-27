import {
  DeleteOutlined,
  FileAddOutlined,
  FileOutlined,
  PartitionOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  List,
  message,
  Popconfirm,
  Skeleton,
  Switch,
} from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IFlow } from '../interface/flow.interface';
import CreateFlowComponent from './create.component';

export default function FlowListComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [flows, setFlows] = useState<IFlow[]>([]);
  const client = useHttpClientSimple();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState<boolean>(false);

  const doDeleteFlow = async (id: string) => {
    const flow = flows.find(wf => wf.id === id);

    if (flow) {
      try {
        await client.delete(`${toRestSysRoute(SchemaRef.FLOW)}/${id}`);

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
    client
      .get<IFindResponse<IFlow>>(toRestSysRoute(SchemaRef.FLOW))
      .then(response => {
        setFlows(response.data.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="No Code - Flows"
          avatar={{
            icon: <PartitionOutlined />,
          }}
          actions={
            <>
              <Link to={'/admin/flow/import'}>
                <Button type="ghost" icon={<UploadOutlined />} key="import">
                  Import Flow
                </Button>
              </Link>
              <Button
                onClick={() => setShowCreate(true)}
                type="primary"
                icon={<FileAddOutlined />}
                key="new"
              >
                New Flow
              </Button>
            </>
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
            renderItem={flow => (
              <List.Item
                key={flow.id}
                onClick={() => navigate(`/admin/flow/artboard/${flow.id}`)}
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
                  title={flow.name}
                />

                <Switch
                  title="Is Active"
                  checked={flow.isActive}
                  onClick={(v, e) => e.stopPropagation()}
                  onChange={newValue =>
                    setFlows(oldState => {
                      const newState = cloneDeep(oldState);

                      const f = newState.find(r => r.id === flow.id);
                      f.isActive = newValue;

                      client.patch(
                        toRestSysRoute(SchemaRef.FLOW) + `/${f.id}`,
                        f,
                      );

                      message.info(
                        `Flow is ${newValue ? 'activated' : 'inactivated'}`,
                      );

                      return newState;
                    })
                  }
                  className="mr-2"
                />

                <Popconfirm
                  title="Are You sure to delete this flow?"
                  okText="Yes, delete"
                  cancelText="No"
                  placement="left"
                  icon={<QuestionCircleOutlined />}
                  onConfirm={e => {
                    doDeleteFlow(flow.id);
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
  );
}
