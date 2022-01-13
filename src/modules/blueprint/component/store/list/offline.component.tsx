import {
  AppstoreOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
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
import { useHttpClientSimple } from '../../../../admin/library/http-client';
import { useHttpClient } from '../../../../admin/library/use-http-client';
import { toRestRoute } from '../../../../content/util/schema-url';
import { IBlueprint } from '../../../interface/blueprint.interface';

export default function OfflineExtensions() {
  const base = '/admin/ext/store';
  const client = useHttpClientSimple();

  const [showSourceFor, setShowSourceFor] = useState(null);

  const [{ data: extensions, loading, error }, refetch] = useHttpClient<
    IBlueprint[]
  >(
    toRestRoute({ database: 'main', reference: 'Extension' }) +
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
                  className="bg-midnight-800 text-green-400"
                  icon={<AppstoreOutlined />}
                />
              }
              title={<span className="text-xl font-thin">{ext.title}</span>}
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
              <Link to={base + `/${ext.id}`}>
                <Tooltip title="Edit" placement="leftBottom">
                  <Button
                    icon={<EditOutlined />}
                    className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                  ></Button>
                </Tooltip>
              </Link>
            ) : (
              <Link to={base + `/${ext.id}/update`}>
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
                  .delete(`/api/rest/main/extension/${ext.id}`)
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
            <CodeOutlined /> Extension's Source
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
  );
}
