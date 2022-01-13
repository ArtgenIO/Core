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
  Tag,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { RowLike } from '../../../app/interface/row-like.interface';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { FieldTool, isPrimary } from '../../schema/util/field-tools';
import { toRestRecordRoute, toRestRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  onEdit: (row: RowLike) => void;
};

export default function TableComponent({ schema, onEdit }: Props) {
  const httpClient = useHttpClientSimple();

  // Load content
  const [{ data: content, loading: isContentLoading }, refetch] = useHttpClient<
    object[]
  >(toRestRoute(schema) + new QueryBuilder().top(1_000).toQuery());

  // Local state
  const [columns, setColumns] = useState<TableColumnsType>([]);
  const [rows, setRows] = useState<object[]>(null);

  const doDelete = async (record: RowLike) => {
    try {
      await httpClient.delete<any>(toRestRecordRoute(schema, record));

      message.warning(`Record deleted`);
      refetch();
    } catch (error) {
      message.error(`Error while deleting the record!`);
    }
  };

  useEffect(() => {
    if (!isContentLoading) {
      const pks = schema.fields
        .filter(FieldTool.isPrimary)
        .map(f => f.reference);

      for (const row of content) {
        row['__row_key__'] = pks.map(k => row[k]).join('|');
      }

      setRows(content);
    } else {
      setRows(null);
    }
  }, [isContentLoading]);

  useEffect(() => {
    if (schema) {
      const columnDef: TableColumnsType = [];

      for (const field of schema.fields) {
        const fieldDef: ColumnType<any> = {
          title: field.title,
          dataIndex: field.reference,
        };

        // Render UUID with monospace
        if (isPrimary(field) && field.type == FieldType.UUID) {
          fieldDef.render = (value, record, idx) => (
            <span style={{ fontFamily: 'monospace' }}>{value}</span>
          );
        }

        // Render boolean checkbox
        else if (field.type == FieldType.BOOLEAN) {
          fieldDef.render = (value, record, idx) => (
            <Checkbox checked={value} disabled></Checkbox>
          );
        }

        // Render tags
        else if (field.tags.includes(FieldTag.TAGS)) {
          fieldDef.render = (value, record, idx) =>
            value.length ? value.map(v => <Tag>{v}</Tag>) : '---';
        }

        // Render JSON
        else if (field.type == FieldType.JSON) {
          fieldDef.render = (value, record, idx) => (
            <code
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
        render: (text, row: RowLike, idx) => {
          return (
            <>
              <Button
                icon={<EditOutlined />}
                key="edit"
                size="small"
                className="rounded-md hover:text-yellow-500 hover:border-yellow-500 mr-1"
                onClick={() => onEdit(row)}
              ></Button>
              <Popconfirm
                title="Are You sure to delete the record?"
                okText="Yes, delete"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() => doDelete(row)}
                key={`delcon-${idx}`}
              >
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  className="rounded-md hover:text-red-500 hover:border-red-500"
                ></Button>
              </Popconfirm>
            </>
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
          dataSource={rows}
          columns={columns}
          size="small"
          showHeader
          bordered
          rowKey="__row_key__"
        />
      </Skeleton>
    </>
  );
}
