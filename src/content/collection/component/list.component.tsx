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
import { Avatar, Button, List, Popconfirm, Skeleton, Tabs } from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { pageDrawerAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { collectionsAtom } from '../collection.atoms';
import CollectionDetailsComponent from './details.component';

export default function CollectionListComponent() {
  const collections = useRecoilValue(collectionsAtom);
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
          title="Collections"
          avatar={{
            icon: <TableOutlined />,
          }}
          actions={
            <Link key="create" to="/backoffice/management/workflow/create">
              <Button type="primary" icon={<FileAddOutlined />}>
                New Collection
              </Button>
            </Link>
          }
          footer={
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Custom Workflows" key="1" />
              <Tabs.TabPane tab="System Workflows" key="2" />
              <Tabs.TabPane tab="Telemetry" key="3" />
            </Tabs>
          }
        />
      }
    >
      <Skeleton active loading={!collections.length}>
        <List
          bordered
          size="small"
          dataSource={collections}
          renderItem={collection => (
            <List.Item
              key={collection.reference}
              onClick={() => setPageDrawer(<CollectionDetailsComponent />)}
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
                description={
                  <>
                    <b>Table name:</b> <span>{collection.tableName}</span>
                  </>
                }
                title={collection.label + ' Collection'}
              />
              <Button
                icon={<BarChartOutlined />}
                className="rounded-md mr-1 "
              ></Button>
              <Link
                to={`/backoffice/content/collection/${collection.reference}/view`}
              >
                <Button
                  icon={<EyeOutlined />}
                  className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                ></Button>
              </Link>
              <Link
                to={`/backoffice/content/collection/${collection.reference}`}
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
