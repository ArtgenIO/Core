import {
  AppstoreAddOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  message,
  Modal,
  notification,
  Popconfirm,
  Result,
  Skeleton,
  Tooltip,
} from 'antd';
import Meta from 'antd/lib/card/Meta';
import { useState } from 'react';
import { IFindResponse } from '../../../../api/types/find-reponse.interface';
import { SchemaRef } from '../../../../api/types/system-ref.enum';
import { IBlueprint } from '../../../../models/blueprint.interface';
import { useHttpClient } from '../../library/hook.http-client';
import { toRestSysRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';
import BlueprintEditorComponent from './_editor.component';

export default function ListCloudApps() {
  const client = useHttpClientSimple();

  const [showSourceFor, setShowSourceFor] = useState(null);
  const [editor, setEditor] = useState<IBlueprint>(null);

  const [{ data: blueprints, loading, error }, refetch] = useHttpClient<
    IFindResponse<IBlueprint>
  >(
    toRestSysRoute(SchemaRef.BLUEPRINT, q =>
      q.top(50).orderBy('installedAt desc'),
    ),
  );

  if (error) {
    return (
      <Result status="error" title="Could not load the blueprints!"></Result>
    );
  }

  return (
    <Skeleton loading={loading}>
      {blueprints && (
        <List
          grid={{ gutter: 4, column: 4 }}
          size="large"
          className="bg-transparent"
          dataSource={blueprints.data}
          renderItem={(blueprint, k) => (
            <List.Item key={`blueprint-${k}`}>
              <Card
                cover={
                  <img
                    alt="Blueprint's Cover"
                    title={blueprint.title}
                    src={blueprint.cover}
                  />
                }
                actions={[
                  <Button
                    key="source"
                    icon={<CodeOutlined />}
                    className="rounded-md mr-1 hover:text-green-500 hover:border-green-500"
                    onClick={() => setShowSourceFor(blueprint)}
                  ></Button>,
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={() => setEditor(blueprint)}
                    className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                  ></Button>,
                  <Button
                    key="download"
                    icon={<CloudDownloadOutlined />}
                    className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                  ></Button>,
                  <Popconfirm
                    key="delete"
                    title="Are You sure to delete this blueprint?"
                    okText="Yes, delete it"
                    cancelText="No"
                    placement="left"
                    icon={<QuestionCircleOutlined />}
                    onConfirm={() =>
                      client
                        .delete(
                          `${toRestSysRoute(SchemaRef.BLUEPRINT)}/${
                            blueprint.id
                          }`,
                        )
                        .then(() => message.warning('Blueprint deleted'))
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
              >
                <Meta
                  avatar={
                    <Avatar src="https://secure.gravatar.com/avatar/5d06dd94e6a09ec511f0337677f1979a?size=40" />
                  }
                  title={
                    <>
                      <AppstoreAddOutlined /> {blueprint.title} v
                      {blueprint.version}
                    </>
                  }
                  description={blueprint.description}
                />
              </Card>
            </List.Item>
          )}
        ></List>
      )}

      {editor && (
        <BlueprintEditorComponent
          blueprint={editor}
          onSave={_blueprint => {
            client
              .patch(
                toRestSysRoute(SchemaRef.BLUEPRINT) + '/' + _blueprint.id,
                _blueprint,
              )
              .then(() => {
                notification.success({ message: 'Blueprint updated!' });
                setEditor(null);
              });
          }}
        />
      )}

      <Modal
        open={!!showSourceFor}
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
