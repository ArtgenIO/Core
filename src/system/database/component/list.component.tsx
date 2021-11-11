import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Avatar, Button, List, Popconfirm, Skeleton } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React from 'react';
import { Link } from 'react-router-dom';
import { routeCrudAPI } from '../../../content/crud/util/schema-url';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClient } from '../../../management/backoffice/library/use-http-client';
import { IDatabase } from '../interface';

export default function DatabaseListComponent() {
  const [{ data: databases, loading, error }] = useHttpClient<IDatabase[]>(
    routeCrudAPI({ database: 'system', reference: 'Database' }) +
      new QueryBuilder().top(100).toQuery(),
  );

  if (error) {
    return <h1>Error while loading the page</h1>;
  }

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Database"
          subTitle="Manage database connections"
          avatar={{
            icon: <DatabaseOutlined />,
          }}
          actions={
            <>
              <Link key="create" to="/backoffice/system/database/add">
                <Button type="primary" icon={<FileAddOutlined />}>
                  Add Database
                </Button>
              </Link>
            </>
          }
        />
      }
    >
      <Skeleton loading={loading}>
        <List
          bordered
          size="large"
          dataSource={databases}
          renderItem={(db, k) => (
            <List.Item key={`db-${k}`}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    className="bg-dark"
                    icon={<DatabaseOutlined />}
                  />
                }
                title={<span className="text-xl font-thin">{db.name}</span>}
              />

              <Link
                to={`/backoffice/content/schema/board/${db.name}`}
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
                  onClick={e => e.stopPropagation()}
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
