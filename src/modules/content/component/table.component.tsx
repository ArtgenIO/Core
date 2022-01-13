import {
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Divider,
  message,
  Popconfirm,
  Skeleton,
  Table,
  TableColumnsType,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { FieldType, ISchema } from '../../schema';
import { isPrimary } from '../../schema/util/field-tools';
import { toRestRecordRoute, toRestRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  onEdit: (row: Row) => void;
};

type Row = Record<string, unknown> | object;

export default function TableComponent({ schema, onEdit }: Props) {
  const httpClient = useHttpClientSimple();

  // Load content
  const [{ data: content, loading: isContentLoading }, refetch] = useHttpClient<
    object[]
  >(toRestRoute(schema) + new QueryBuilder().top(1_000).toQuery(), {
    useCache: false,
  });

  // Local state
  const [columns, setColumns] = useState<TableColumnsType>([]);

  const doDelete = async (record: Record<string, unknown>) => {
    try {
      await httpClient.delete<any>(toRestRecordRoute(schema, record));

      message.warning(`Record deleted`);
      refetch();
    } catch (error) {
      message.error(`Error while deleting the record!`);
    }
  };

  useEffect(() => {
    if (schema) {
      const columnDef: TableColumnsType = [];

      for (const field of schema.fields) {
        const fieldDef: ColumnType<any> = {
          key: field.reference,
          title: field.title,
          dataIndex: field.reference,
        };

        // Render UUID with monospace
        if (isPrimary(field) && field.type == FieldType.UUID) {
          fieldDef.render = (value, record, idx) => (
            <span key={`ids-${idx}`} style={{ fontFamily: 'monospace' }}>
              {value}
            </span>
          );
        }

        // Render boolean checkbox
        if (field.type == FieldType.BOOLEAN) {
          fieldDef.render = (value, record, idx) => (
            <Checkbox key={`cbox-${idx}`} checked={value} disabled></Checkbox>
          );
        }

        // Render JSON
        if (field.type == FieldType.JSON) {
          fieldDef.render = (value, record, idx) => (
            <code
              key={`code-${idx}`}
              className="bg-gray-700 p-1 rounded-md"
              style={{ fontSize: 11 }}
            >
              {JSON.stringify(value).substring(0, 16)}
            </code>
          );
        }

        columnDef.push(fieldDef);
      }

      columnDef.push({
        title: 'Actions',
        key: '_actions',
        fixed: 'right',
        width: 80,
        align: 'center',
        render: (text, record: Record<string, unknown>, idx) => {
          return (
            <span key={`actions-${idx}`}>
              <Button
                icon={<EditOutlined />}
                key="edit"
                size="small"
                className="rounded-md hover:text-yellow-500 hover:border-yellow-500 mr-1"
                onClick={() => onEdit(record)}
              ></Button>
              <Popconfirm
                title="Are You sure to delete the record?"
                okText="Yes, delete"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() => doDelete(record)}
                key={`delcon-${idx}`}
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

      setColumns(columnDef);
    }
  }, [schema]);

  return (
    <>
      <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
        Reload
      </Button>
      <Skeleton active loading={isContentLoading}>
        <Divider className="my-2" />
        <Table
          dataSource={content}
          columns={columns}
          size="small"
          showHeader
          bordered
        />
      </Skeleton>
    </>
  );
}
