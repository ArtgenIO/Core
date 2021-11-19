import {
  BorderInnerOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  List,
  Popconfirm,
  Result,
  Skeleton,
  Tag,
  Tooltip,
} from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';
import { useHttpClient } from '../../admin/library/use-http-client';
import { routeCrudAPI } from '../../content/util/schema-url';
import { IDatabase } from '../interface';

export default function DatabaseListComponent() {
  const [{ data: databases, loading, error }] = useHttpClient<IDatabase[]>(
    routeCrudAPI({ database: 'system', reference: 'Database' }) +
      new QueryBuilder().top(100).toQuery(),
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
            <>
              <Link key="create" to="/admin/database/add">
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

              <Tag>{db.type}</Tag>

              <Link to={`/admin/database/${db.name}/edit`}>
                <Tooltip title="Edit Connection Details" placement="leftBottom">
                  <Button
                    icon={<EditOutlined />}
                    className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
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
                title="Are You sure to delete this connection?"
                okText="Yes, delete it"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
              >
                <Tooltip title="Delete Connection" placement="leftBottom">
                  <Button
                    icon={<DeleteOutlined />}
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
