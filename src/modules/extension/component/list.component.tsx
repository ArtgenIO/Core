import {
  AppstoreOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Result,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { routeCrudAPI } from '../../content/util/schema-url';
import { IExtension } from '../interface/extension.interface';
import ExtensionStoreComponent from './store.component';

export default function ListExtensionComponent() {
  const baseURL = '/admin/extension';
  const client = useHttpClientOld();

  const [showSourceFor, setShowSourceFor] = useState(null);

  const [{ data: extensions, loading, error }, refetch] = useHttpClient<
    IExtension[]
  >(
    routeCrudAPI({ database: 'system', reference: 'Extension' }) +
      new QueryBuilder().top(100).toQuery(),
  );

  if (error) {
    return (
      <Result
        status="error"
        title="Could not load the extension list!"
      ></Result>
    );
  }

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Extension Store"
          actions={
            <>
              <Link key="import" to={baseURL + '/import'}>
                <Button ghost icon={<DownloadOutlined />}>
                  Import Source
                </Button>
              </Link>
              <Link key="create" to={baseURL + '/create'}>
                <Button type="primary" ghost icon={<FileAddOutlined />}>
                  Create Extension
                </Button>
              </Link>
            </>
          }
        />
      }
    >
      <ExtensionStoreComponent />
      <Skeleton loading={loading}>
        <Typography.Title className="text-right">
          Installed Extensions
        </Typography.Title>
        <List
          bordered
          size="large"
          dataSource={extensions}
          renderItem={(ext, k) => (
            <List.Item key={`ext-${k}`}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    className="bg-dark text-green-400"
                    icon={<AppstoreOutlined />}
                  />
                }
                title={<span className="text-xl font-thin">{ext.label}</span>}
              />

              <Tooltip title="Show Extension Source" placement="leftBottom">
                <Button
                  icon={<CodeOutlined />}
                  className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                  onClick={() => setShowSourceFor(ext)}
                >
                  Source
                </Button>
              </Tooltip>

              {ext.source === 'offline' ? (
                <Link to={baseURL + `/${ext.id}`}>
                  <Tooltip title="Edit" placement="leftBottom">
                    <Button
                      icon={<EditOutlined />}
                      className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                    ></Button>
                  </Tooltip>
                </Link>
              ) : (
                <Link to={baseURL + `/${ext.id}/update`}>
                  <Tooltip title="Update" placement="leftBottom">
                    <Button
                      icon={<CloudDownloadOutlined />}
                      className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                    ></Button>
                  </Tooltip>
                </Link>
              )}
              <Popconfirm
                title="Are You sure to delete this extension?"
                okText="Yes, delete it"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() =>
                  client
                    .delete(`/api/rest/system/extension/${ext.id}`)
                    .then(() => message.warn('Extension deleted'))
                    .then(() => refetch())
                }
              >
                <Tooltip title="Delete" placement="leftBottom">
                  <Button
                    icon={<DeleteOutlined />}
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                  ></Button>
                </Tooltip>
              </Popconfirm>
            </List.Item>
          )}
        ></List>
        <Modal
          visible={!!showSourceFor}
          centered
          width="50%"
          title={
            <>
              <CodeOutlined /> Serialized Extension
            </>
          }
          closable
          maskClosable
          onCancel={() => setShowSourceFor(null)}
          footer={null}
          destroyOnClose
        >
          <Input.TextArea
            showCount
            readOnly
            defaultValue={JSON.stringify(showSourceFor, null, 2)}
            rows={25}
          ></Input.TextArea>
        </Modal>
      </Skeleton>
    </PageWithHeader>
  );
}
