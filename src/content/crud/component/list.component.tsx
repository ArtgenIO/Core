import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  message,
  Popconfirm,
  Skeleton,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { pageDrawerAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClient } from '../../../management/backoffice/library/http-client';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { schemasAtom } from '../../schema/schema.atoms';

export default function CrudListComponent() {
  const params = useParams<{ id: string }>();
  const schemas = useRecoilValue(schemasAtom);
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawer = useResetRecoilState(pageDrawerAtom);
  const httpClient = useHttpClient();

  // Local state
  const [rows, setRows] = useState<object[]>([]);
  const [fields, setFields] = useState<TableColumnsType>([]);
  const [schema, setSchema] = useState<ISchema>(null);
  const [isLoading, setIsLoading] = useState(true);

  const doDelete = async (recordId: string) => {
    try {
      await httpClient.delete<any>(
        `/api/$system/content/crud/${params.id}/delete/${recordId}`,
      );

      message.warning(`Deleted [${recordId}]`);

      setRows(rows => rows.filter(r => (r as any).id !== recordId));
    } catch (error) {
      message.error(`Could not delete the record @@`);
    }
  };

  useEffect(() => {
    if (params.id) {
      const cSchema = schemas.find(s => s.id === params.id);

      if (cSchema) {
        httpClient
          .get<object[]>(`/api/$system/content/crud/${params.id}`)
          .then(response => {
            const fRows = response.data.map((r, k) => ({
              key: k,
              ...r,
            }));

            setRows(fRows);
            setIsLoading(false);
          });

        const tFields: TableColumnsType = [];

        for (const fSchema of cSchema.fields) {
          const fDef: ColumnType<any> = {
            title: fSchema.label,
            dataIndex: fSchema.reference,
            key: fSchema.reference,
            ellipsis: fSchema.type == FieldType.JSON,
            sorter: true,
          };

          // Render UUID with monospace
          if (
            fSchema.tags.includes(FieldTag.PRIMARY) &&
            fSchema.type === FieldType.UUID
          ) {
            fDef.render = val => (
              <span style={{ fontFamily: 'monospace' }}>{val}</span>
            );
          }

          // Render boolean checkbox
          if (fSchema.type === FieldType.BOOLEAN) {
            fDef.render = val => <Checkbox checked={val} disabled></Checkbox>;
          }

          // Render JSON
          if (fSchema.type === FieldType.JSON) {
            fDef.render = val => (
              <code
                className="bg-gray-700 p-1 rounded-md"
                style={{ fontSize: 11 }}
              >
                {JSON.stringify(val).substr(0, 32)}
              </code>
            );
          }

          tFields.push(fDef);
        }

        tFields.push({
          title: 'Actions',
          key: '_actions',
          fixed: 'right',
          width: 80,
          align: 'center',
          render: (text, record: any, index) => {
            return (
              <span>
                <Link
                  to={`/backoffice/content/crud/${params.id}/update/${record.id}`}
                >
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    className="rounded-md hover:text-yellow-500 hover:border-yellow-500 mr-1"
                  ></Button>
                </Link>
                <Popconfirm
                  title="Are You sure to delete the row?"
                  okText="Yes, delete"
                  cancelText="No"
                  placement="left"
                  icon={<QuestionCircleOutlined />}
                  onConfirm={() => doDelete(record.id)}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    className="rounded-md hover:text-red-500 hover:border-red-500"
                  ></Button>
                </Popconfirm>
              </span>
            );
          },
        });

        setSchema(cSchema);
        setFields(tFields);
      }
    }

    return () => {
      resetPageDrawer();
    };
  }, [params]);

  if (!schema) {
    return <h1>Loading content....</h1>;
  }

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={
            <>
              {schema.label}
              <span className="ml-4">
                {schema.tags.map(t => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
            </>
          }
          avatar={{
            icon: <TableOutlined />,
          }}
          actions={
            <Link
              key="create"
              to={`/backoffice/content/crud/${schema.id}/create`}
            >
              <Button type="primary" icon={<FileAddOutlined />}>
                Create
              </Button>
            </Link>
          }
          footer={
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="List View" key="1" />
              <Tabs.TabPane tab="Card View" key="2" />
              <Tabs.TabPane tab="Analytics" key="3" />
            </Tabs>
          }
        />
      }
    >
      <Skeleton active loading={isLoading}>
        <Table dataSource={rows} columns={fields} size="small" />
      </Skeleton>
    </PageWithHeader>
  );
}
