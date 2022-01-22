import {
  AppstoreAddOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Result,
  Skeleton,
  Tooltip,
} from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { IFindResponse } from '../../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { IBlueprint } from '../../interface/blueprint.interface';

export default function OfflineExtensions() {
  const base = '/admin/cloud-apps';
  const client = useHttpClientSimple();

  const [showSourceFor, setShowSourceFor] = useState(null);

  const [{ data: extensions, loading, error }, refetch] = useHttpClient<
    IFindResponse<IBlueprint>
  >(
    toRestSysRoute(SchemaRef.BLUEPRINT) + new QueryBuilder().top(100).toQuery(),
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
      {extensions && (
        <List
          grid={{ gutter: 4, column: 4 }}
          size="large"
          className="bg-transparent"
          dataSource={extensions.data}
          renderItem={(ext, k) => (
            <List.Item key={`ext-${k}`}>
              <Card
                title={
                  <>
                    <AppstoreAddOutlined /> {ext.title} v{ext.version}
                  </>
                }
                cover={
                  <img
                    alt="example"
                    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                  />
                }
                actions={[
                  <Button
                    key="source"
                    icon={<CodeOutlined />}
                    className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                    onClick={() => setShowSourceFor(ext)}
                  ></Button>,
                  <Link to={base + `/${ext.id}`}>
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                    ></Button>
                  </Link>,
                  <Button
                    key="download"
                    icon={<CloudDownloadOutlined />}
                    className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                  ></Button>,
                  <Popconfirm
                    key="delete"
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
                  </Popconfirm>,
                ]}
              ></Card>
            </List.Item>
          )}
        ></List>
      )}

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
