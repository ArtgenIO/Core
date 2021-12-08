import {
  BorderInnerOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  List,
  notification,
  Popconfirm,
  Result,
  Skeleton,
  Tooltip,
} from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_URL } from '../../admin/admin.constants';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { routeCrudAPI } from '../../content/util/schema-url';
import { IDatabase } from '../interface';

export default function DatabaseListComponent() {
  const client = useHttpClientOld();
  const [{ data: databases, loading, error }, refetch] = useHttpClient<
    IDatabase[]
  >(
    routeCrudAPI({ database: 'main', reference: 'Database' }) +
      new QueryBuilder().top(100).toQuery(),
    {
      useCache: false,
    },
  );

  if (error) {
    return (
      <Result status="error" title="Could not load the database list!"></Result>
    );
  }

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Databases"
          actions={
            <Link key="create" to={`${ADMIN_URL}/database/connect`}>
              <Button
                className="test--connect-btn"
                type="primary"
                ghost
                icon={<FileAddOutlined />}
              >
                Connect Database
              </Button>
            </Link>
          }
        />
      }
    >
      <Skeleton loading={loading}>
        <Alert
          message="Artgen can manage multiple database connection at once, so You can just connect your existing database, or add new ones to use for different workloads."
          type="info"
          className="mb-8"
          showIcon
        />

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
                title={
                  <span className="text-xl font-thin test--db-name">
                    {db.title}
                  </span>
                }
              />

              <Link to={`/admin/database/${db.name}/edit`}>
                <Tooltip title="Edit Connection Details" placement="leftBottom">
                  <Button
                    icon={<EditOutlined />}
                    className="rounded-md mr-1 hover:text-green-500 hover:border-green-500 hidden"
                  ></Button>
                </Tooltip>
              </Link>

              <Link to={`/admin/database/artboard/${db.name}`}>
                <Tooltip title="Open Artboard" placement="leftBottom">
                  <Button
                    icon={<BorderInnerOutlined />}
                    className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                  ></Button>
                </Tooltip>
              </Link>

              <Popconfirm
                title="Are You sure to delete this database?"
                className="test--delete-db"
                okText="Yes, delete it"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() => {
                  client
                    .delete(`/api/rest/main/database/${db.name}`)
                    .then(() => {
                      notification.success({
                        message: `Database [${db.name}] deleted`,
                        className: 'test--db-deleted-not',
                      });

                      refetch();
                    });
                }}
              >
                <Tooltip title="Delete database" placement="leftBottom">
                  <Button
                    icon={<DeleteOutlined />}
                    data-db-delete={db.name}
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                  ></Button>
                </Tooltip>
              </Popconfirm>
            </List.Item>
          )}
        ></List>
      </Skeleton>
    </PageWithHeader>
  );
}
