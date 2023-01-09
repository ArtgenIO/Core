import {
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
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
import { useEffect, useState } from 'react';
import { IDatabase } from '../../../../models/database.interface';
import { IFindResponse } from '../../../../types/find-reponse.interface';
import { SchemaRef } from '../../../../types/system-ref.enum';
import PageHeader from '../../../layout/page-header.component';
import PageWithHeader from '../../../layout/page-with-header.component';
import { useHttpClient } from '../../../library/hook.http-client';
import { toRestSysRoute } from '../../../library/schema-url';
import { useHttpClientSimple } from '../../../library/simple.http-client';
import DatabaseConnectComponent from './connect.component';
import DatabaseEditComponent from './edit.component';
import DatabaseExportComponent from './export.component';

export default function DatabaseListComponent() {
  const client = useHttpClientSimple();

  // Local state
  const [showConnect, setShowConnect] = useState(false);
  const [showEditor, setShowEditor] = useState<string>(null);
  const [showExport, setShowExport] = useState<IDatabase>(null);
  const [databases, setDatabases] = useState<IDatabase[]>([]);

  const [{ data: response, loading, error }] = useHttpClient<
    IFindResponse<IDatabase>
  >(
    toRestSysRoute(SchemaRef.DATABASE) + new QueryBuilder().top(100).toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    if (response) {
      setDatabases(response.data);
    }
  }, [response]);

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
            <Button
              className="test--connect-btn"
              type="primary"
              ghost
              icon={<FileAddOutlined />}
              onClick={() => setShowConnect(true)}
            >
              Connect Database
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
      <Skeleton loading={loading} active>
        <List
          bordered
          size="large"
          dataSource={databases}
          renderItem={(db, k) => (
            <List.Item key={`db-${k}`} onClick={() => setShowEditor(db.ref)}>
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

              <Tooltip
                title="Export database schemantic"
                placement="leftBottom"
              >
                <Button
                  icon={<DownloadOutlined />}
                  className="rounded-md hover:text-teal-500 hover:border-teal-500 mr-1"
                  onClick={e => {
                    setShowExport(db);
                    e.stopPropagation();
                  }}
                ></Button>
              </Tooltip>

              <Popconfirm
                title="Are You sure to delete this database connection?"
                className="test--delete-db"
                okText="Yes, delete it"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={e => {
                  client
                    .delete(`/api/rest/main/database/${db.ref}`)
                    .then(() => {
                      notification.success({
                        message: `Database [${db.ref}] deleted`,
                        className: 'test--db-deleted-not',
                      });

                      setDatabases(dbs => dbs.filter(r => r.ref != db.ref));
                    });

                  e.stopPropagation();
                }}
              >
                <Tooltip title="Delete database" placement="leftBottom">
                  <Button
                    icon={<DeleteOutlined />}
                    data-db-delete={db.ref}
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                    onClick={e => e.stopPropagation()}
                  ></Button>
                </Tooltip>
              </Popconfirm>
            </List.Item>
          )}
        ></List>
      </Skeleton>

      {showConnect ? (
        <DatabaseConnectComponent
          setDatabases={setDatabases}
          onClose={() => setShowConnect(false)}
        />
      ) : undefined}

      {showEditor ? (
        <DatabaseEditComponent
          database={databases.find(db => db.ref == showEditor)}
          setDatabases={setDatabases}
          onClose={() => setShowEditor(null)}
        />
      ) : undefined}

      {showExport ? (
        <DatabaseExportComponent
          database={showExport}
          onClose={() => setShowExport(null)}
        />
      ) : undefined}
    </PageWithHeader>
  );
}
