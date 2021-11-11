import {
  CloudDownloadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  NodeIndexOutlined,
  QuestionCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Input,
  List,
  Modal,
  Popconfirm,
  Skeleton,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { pageDrawerAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { schemasAtom } from '../schema.atoms';
import SchemaDetailsComponent from './details.component';

export default function SchemaListComponent() {
  const schemas = useRecoilValue(schemasAtom);
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawer = useResetRecoilState(pageDrawerAtom);

  const [showSerialized, setShowSerialized] = useState<string>('');

  useEffect(() => {
    return () => {
      resetPageDrawer();
    };
  }, []);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Schemas"
          avatar={{
            icon: <TableOutlined />,
          }}
          actions={
            <>
              <Link key="new" to="/backoffice/content/schema/new">
                <Button type="primary" ghost icon={<FileAddOutlined />}>
                  New Schema
                </Button>
              </Link>
              <Link key="create" to="/backoffice/content/schema/create">
                <Button type="primary" icon={<FileAddOutlined />}>
                  Create Schema
                </Button>
              </Link>
              <Link
                key="drawboard"
                to="/backoffice/content/schema/board/system"
              >
                <Button type="primary" icon={<NodeIndexOutlined />}>
                  Schema Board
                </Button>
              </Link>
            </>
          }
          footer={
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Custom Schemas" key="1" />
              <Tabs.TabPane tab="System Schemas" key="2" />
              <Tabs.TabPane tab="Telemetry" key="3" />
            </Tabs>
          }
        />
      }
    >
      <Skeleton active loading={!schemas.length}>
        <List
          bordered
          size="small"
          dataSource={schemas}
          renderItem={(r, k) => (
            <List.Item
              key={`schema-${k}`}
              onClick={() =>
                setPageDrawer(
                  <SchemaDetailsComponent
                    database={r.database}
                    reference={r.reference}
                  />,
                )
              }
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
                title={<span className="text-xl font-thin">{r.label}</span>}
              />
              {r.tags.map(t => (
                <Tag key={r.database + r.reference + t}>{t}</Tag>
              ))}
              <Tooltip title="Serialize" placement="left">
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    setShowSerialized(JSON.stringify(r, null, 2));
                  }}
                  icon={<CloudDownloadOutlined />}
                  className="rounded-md mr-1 "
                ></Button>
              </Tooltip>
              <Link
                to={`/backoffice/content/crud/${r.database}/${r.reference}`}
              >
                <Button
                  onClick={e => e.stopPropagation()}
                  icon={<EyeOutlined />}
                  className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                ></Button>
              </Link>
              <Link
                to={`/backoffice/content/schema/${r.database}/${r.reference}`}
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
        <Modal
          visible={!!showSerialized.length}
          centered
          width={960}
          maskClosable
          footer={null}
          onCancel={() => setShowSerialized('')}
        >
          <Input.TextArea
            rows={32}
            className="w-full"
            value={showSerialized}
          ></Input.TextArea>
        </Modal>
      </Skeleton>
    </PageWithHeader>
  );
}
