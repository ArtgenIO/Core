import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  notification,
  Popconfirm,
  Tabs,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ICollection } from '..';
import { breadcrumbsAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { collectionsAtom } from '../collection.atoms';

export default function CollectionEditorComponent() {
  const params = useParams<{ reference: string }>();
  const [collections, setCollections] = useRecoilState(collectionsAtom);
  const [collection, setCollection] = useState<ICollection>(null);
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const [generalForm] = useForm();

  useEffect(() => {
    if (collections.length) {
      const current = collections.find(c => c.reference == params.reference);

      setCollection(current);
      setBreadcrumb(routes =>
        routes.concat({
          breadcrumbName: current.label,
          path: `${current.reference}/edit`,
        }),
      );
    }

    return () => {
      if (collections.length) {
        setBreadcrumb(routes => routes.slice(0, routes.length - 1));
      }
    };
  }, [collections]);

  const onGeneralFormChange = () => {
    setCollections(collections => {
      const newCollections: ICollection[] = [];

      for (const collection of collections) {
        if (collection.reference === params.reference) {
          const newCollection: ICollection = {
            reference: collection.reference,
            tableName: generalForm.getFieldValue('dbName'),
            schema: generalForm.getFieldValue('dbSchemaName'),
            label: generalForm.getFieldValue('label'),
            tags: collection.tags,
            fields: Array.from(collection.fields),
          };

          newCollections.push(newCollection);

          axios
            .patch(`/api/$system/content/collection/${collection.reference}`, {
              collection: newCollection,
            })
            .then(response => {
              if (response.data.success) {
                notification.success({
                  key: 'collection-save',
                  message: 'Changes saved',
                  placement: 'bottomRight',
                });
              } else {
                notification.warning({
                  key: 'collection-save',
                  message: 'Could not save the changes',
                  placement: 'bottomRight',
                });
              }
            })
            .catch(() => {
              notification.success({
                key: 'collection-save',
                message: 'Errr, internal error!',
                placement: 'bottomRight',
              });
            });
        } else {
          newCollections.push(collection);
        }
      }

      return newCollections;
    });
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={collection ? `Change [${collection.label}] Schema` : 'Loading'}
          avatar={{
            icon: <EditOutlined />,
          }}
          actions={
            <Link key="create" to="/backoffice/management/workflow/create">
              <Button danger ghost icon={<FileAddOutlined />}>
                Save
              </Button>
            </Link>
          }
        />
      }
    >
      {!!collection ? (
        <div className="content=box">
          <Tabs tabPosition="left" size="large" style={{ minHeight: 320 }}>
            <Tabs.TabPane tab="General" key="table">
              <div className="content-box pt-6">
                <Form
                  form={generalForm}
                  name="general"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 12 }}
                  initialValues={{
                    reference: collection.reference,
                    label: collection.label,
                    dbName: collection.tableName,
                    dbSchemaName: collection.schema,
                  }}
                  onBlur={event => onGeneralFormChange()}
                >
                  <Form.Item label="Reference" name="reference">
                    <Input readOnly disabled />
                  </Form.Item>

                  <Form.Item
                    label="Label"
                    name="label"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Table Name"
                    name="dbName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Schema Name (PG)"
                    name="dbSchemaName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Form>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Columns" key="columns">
              <List
                size="large"
                bordered
                dataSource={collection.fields}
                renderItem={(column, k) => (
                  <List.Item key={`${column.reference}.${k}`}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape="square"
                          size="large"
                          icon={<RightOutlined />}
                        />
                      }
                      description={
                        <>
                          <b>Database name:</b> <span>{column.columnName}</span>
                        </>
                      }
                      title={column.label}
                    />

                    <Popconfirm
                      title="Are You sure to delete this column?"
                      okText="Yes, delete"
                      cancelText="No"
                      placement="left"
                      icon={<QuestionCircleOutlined />}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        className="rounded-md hover:text-red-500 hover:border-red-500"
                      ></Button>
                    </Popconfirm>
                  </List.Item>
                )}
              >
                <List.Item key="add-column">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size="large"
                        icon={<PlusOutlined />}
                      />
                    }
                    title="Add Column"
                  />
                </List.Item>
              </List>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Workflows" key="workflows">
              Workflows
            </Tabs.TabPane>
          </Tabs>
        </div>
      ) : (
        <Empty />
      )}
    </PageWithHeader>
  );
}
