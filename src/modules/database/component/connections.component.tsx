import {
  DatabaseOutlined,
  DeleteOutlined,
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
import React, { useState } from 'react';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { toODataRoute } from '../../content/util/schema-url';
import { IDatabase } from '../interface';
import ConnectComponent from './connect.component';
import EditComponent from './edit.component';

export default function ConnectionsComponent() {
  const client = useHttpClientOld();
  const [showConnect, setShowConnect] = useState(false);
  const [showEdit, setShowEdit] = useState<string>(null);
  const [{ data: databases, loading, error }, refetch] = useHttpClient<
    IDatabase[]
  >(
    toODataRoute({ database: 'main', reference: 'Database' }) +
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
          title="Connections"
          actions={
            <Button
              className="test--connect-btn"
              type="primary"
              ghost
              icon={<FileAddOutlined />}
              onClick={() => setShowConnect(true)}
            >
              Create Connection
            </Button>
          }
        />
      }
    >
      <Alert
        message="Your Artgen system can manage multiple database connection at once, so You can just connect your existing database, or add new ones to use for different workloads."
        type="info"
        className="mb-8"
        showIcon
      />
      <Skeleton loading={loading}>
        <List
          bordered
          size="large"
          dataSource={databases}
          renderItem={(db, k) => (
            <List.Item key={`db-${k}`} onClick={() => setShowEdit(db.ref)}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    className="bg-midnight-800"
                    icon={<DatabaseOutlined />}
                  />
                }
                title={<span className="text-xl test--db-rct">{db.title}</span>}
              />

              <Popconfirm
                title="Are You sure to delete this database connection?"
                className="test--delete-db"
                okText="Yes, delete it"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() => {
                  client
                    .delete(`/api/rest/main/database/${db.ref}`)
                    .then(() => {
                      notification.success({
                        message: `Database [${db.ref}] deleted`,
                        className: 'test--db-deleted-not',
                      });

                      refetch();
                    });
                }}
              >
                <Tooltip title="Delete database" placement="leftBottom">
                  <Button
                    icon={<DeleteOutlined />}
                    data-db-delete={db.ref}
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                  ></Button>
                </Tooltip>
              </Popconfirm>
            </List.Item>
          )}
        ></List>
      </Skeleton>
      {showConnect ? (
        <ConnectComponent
          onClose={() => {
            setShowConnect(false);
            refetch();
          }}
        />
      ) : undefined}
      {showEdit ? (
        <EditComponent
          connection={databases.find(db => db.ref == showEdit)}
          onClose={() => {
            setShowEdit(null);
            refetch();
          }}
        />
      ) : undefined}
    </PageWithHeader>
  );
}
