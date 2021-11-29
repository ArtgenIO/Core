import { AppstoreAddOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  List,
  Result,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useHttpClient } from '../../admin/library/use-http-client';
import { IExtension } from '../interface/extension.interface';

export default function ExtensionStoreComponent() {
  const baseURL = '/admin/extension';

  const [{ data: extensions, loading, error }] = useHttpClient<IExtension[]>(
    '/api/extension-store/proxy',
  );

  if (error) {
    return (
      <Result status="error" title="Error while loading extensions!"></Result>
    );
  }

  return (
    <Skeleton loading={loading}>
      <Typography.Title className="text-right">
        Available Extensions
      </Typography.Title>
      <List
        className="mb-12"
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
                  className="bg-dark text-blue-400"
                  icon={<AppstoreAddOutlined />}
                />
              }
              title={<span className="text-xl font-thin">{ext.label}</span>}
            />

            <Link to={baseURL + `/${ext.id}/install`}>
              <Tooltip title="Online Extensions" placement="leftBottom">
                <Button
                  icon={<CloudDownloadOutlined />}
                  className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                >
                  Install
                </Button>
              </Tooltip>
            </Link>
          </List.Item>
        )}
      ></List>
    </Skeleton>
  );
}
