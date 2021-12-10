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
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { FieldType, ISchema } from '../../schema';
import { isPrimary } from '../../schema/util/field-tools';
import { ContentAction } from '../interface/content-action.enum';
import {
  routeCrudAPI,
  routeCrudRecordAPI,
  routeCrudRecordUI,
} from '../util/schema-url';

interface RouteParams {
  database: string;
  reference: string;
}

export default function CrudReadComponent() {
  const httpClient = useHttpClientOld();
  const route = useParams<RouteParams>();

  // Load schema
  const [{ data: schemas, loading: iSchemaLoading }] = useHttpClient<ISchema[]>(
    routeCrudAPI({ database: 'main', reference: 'Schema' }) +
      new QueryBuilder()
        .filter(f =>
          f
            .filterExpression('database', 'eq', route.database)
            .filterExpression('reference', 'eq', route.reference),
        )
        .top(1)
        .toQuery(),
  );

  // Load content
  const [{ data: content, loading: isContentLoading }, refetch] = useHttpClient<
    object[]
  >(routeCrudAPI(route) + new QueryBuilder().top(10_000).toQuery(), {
    useCache: false,
  });

  // Local state
  const [columns, setColumns] = useState<TableColumnsType>([]);

  const doDelete = async (record: Record<string, unknown>) => {
    try {
      await httpClient.delete<any>(routeCrudRecordAPI(schemas[0], record));

      message.warning(`Record deleted`);
      refetch();
    } catch (error) {
      message.error(`Error while deleting the record!`);
    }
  };

  useEffect(() => {
    if (schemas && schemas.length) {
      const columnDef: TableColumnsType = [];

      for (const field of schemas[0].fields) {
        const fieldDef: ColumnType<any> = {
          key: field.reference,
          title: field.title,
          dataIndex: field.reference,
        };

        // Render UUID with monospace
        if (isPrimary(field) && field.type === FieldType.UUID) {
          fieldDef.render = (value, record, idx) => (
            <span key={`ids-${idx}`} style={{ fontFamily: 'monospace' }}>
              {value}
            </span>
          );
        }

        // Render boolean checkbox
        if (field.type === FieldType.BOOLEAN) {
          fieldDef.render = (value, record, idx) => (
            <Checkbox key={`cbox-${idx}`} checked={value} disabled></Checkbox>
          );
        }

        // Render JSON
        if (field.type === FieldType.JSON) {
          fieldDef.render = (value, record, idx) => (
            <code
              key={`code-${idx}`}
              className="bg-gray-700 p-1 rounded-md"
              style={{ fontSize: 11 }}
            >
              {JSON.stringify(value).substr(0, 32)}
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
              <Link
                to={routeCrudRecordUI(schemas[0], record, ContentAction.UPDATE)}
                key={`editl-${idx}`}
              >
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  className="rounded-md hover:text-yellow-500 hover:border-yellow-500 mr-1"
                ></Button>
              </Link>
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

    return () => {};
  }, [schemas]);

  return (
    <>
      <PageWithHeader
        header={
          <PageHeader
            title={
              schemas ? (
                <>
                  {schemas[0].title}
                  <span className="ml-4">
                    {schemas[0].tags.map(t => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </span>
                </>
              ) : undefined
            }
            avatar={{
              icon: <TableOutlined />,
            }}
            actions={
              schemas ? (
                <Link
                  key="create"
                  to={`/admin/content/${route.database}/${route.reference}/create`}
                >
                  <Button type="primary" icon={<FileAddOutlined />}>
                    Create
                  </Button>
                </Link>
              ) : undefined
            }
            footer={
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Content" key="1" />
                <Tabs.TabPane tab="Workflows" key="2" />
                <Tabs.TabPane tab="Integrations" key="3" />
                <Tabs.TabPane tab="Endpoints" key="4" />
              </Tabs>
            }
          />
        }
      >
        <Skeleton active loading={isContentLoading}>
          <Table dataSource={content} columns={columns} size="small" />
        </Skeleton>
      </PageWithHeader>
    </>
  );
}
