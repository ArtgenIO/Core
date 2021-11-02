import {
  BarChartOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Avatar, Button, List, Popconfirm, Skeleton, Tabs, Tag } from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { pageDrawerAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { schemasAtom } from '../schema.atoms';
import SchemaDetailsComponent from './details.component';

export default function SchemaListComponent() {
  const schemas = useRecoilValue(schemasAtom);
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawer = useResetRecoilState(pageDrawerAtom);

  useEffect(() => {
    return () => {
      resetPageDrawer();
    };
  }, []);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Schemas"
          avatar={{
            icon: <TableOutlined />,
          }}
          actions={
            <Link key="create" to="/backoffice/content/schema/create">
              <Button type="primary" icon={<FileAddOutlined />}>
                New Schema
              </Button>
            </Link>
          }
          footer={
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Custom Schemas" key="1" />
              <Tabs.TabPane tab="System Schemas" key="2" />
              <Tabs.TabPane tab="Telemetry" key="3" />
            </Tabs>
          }
        />
      }
    >
      <Skeleton active loading={!schemas.length}>
        <List
          bordered
          size="small"
          dataSource={schemas}
          renderItem={r => (
            <List.Item
              key={r.id}
              onClick={() =>
                setPageDrawer(<SchemaDetailsComponent id={r.id} />)
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    className="bg-dark"
                    icon={<DatabaseOutlined />}
                  />
                }
                title={<span className="text-xl font-thin">{r.label}</span>}
              />
              {r.tags.map(t => (
                <Tag key={r.id + t}>{t}</Tag>
              ))}
              <Button
                icon={<BarChartOutlined />}
                className="rounded-md mr-1 "
              ></Button>
              <Link to={`/backoffice/content/schema/${r.id}/view`}>
                <Button
                  icon={<EyeOutlined />}
                  className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                ></Button>
              </Link>
              <Link
                to={`/backoffice/content/schema/${r.id}`}
                onClick={e => e.stopPropagation()}
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
              >
                <Button
                  icon={<DeleteOutlined />}
                  className="rounded-md hover:text-red-500 hover:border-red-500"
                ></Button>
              </Popconfirm>
            </List.Item>
          )}
        ></List>
      </Skeleton>
    </PageWithHeader>
  );
}
