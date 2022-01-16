import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, message, Pagination, Popconfirm, Tag } from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import DataGrid, { Column } from 'react-data-grid';
import { RowLike } from '../../../app/interface/row-like.interface';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { toRestRecordRoute, toRestRoute } from '../util/schema-url';
import ContentCreateComponent from './create.component';
import './table.component.less';
import ContentUpdateComponent from './update.component';

type Props = {
  schema: ISchema;
};

export default function TableComponent({ schema }: Props) {
  const httpClient = useHttpClientSimple();

  // Extended views in drawer
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<RowLike>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [pageCurr, setPageCurr] = useState(1);
  const [total, setTotal] = useState(0);

  // Grid content state
  const [columns, setColumns] = useState<Column<RowLike>[]>([]);
  const [rows, setRows] = useState<RowLike[]>([]);

  // Load initial content
  const [{ data: findResponse, loading: isContentLoading }, __do_fetch] =
    useHttpClient<IFindResponse>(
      toRestRoute(schema) + new QueryBuilder().top(pageSize).toQuery(),
    );

  // Rebuild the request and fetch the new data
  const refetch = () => {
    const qb = new QueryBuilder();

    // Pagination limit
    qb.top(pageSize);

    if (pageCurr > 1) {
      qb.skip(pageCurr * pageSize - pageSize);
    }

    // Start the HTTP request
    __do_fetch({
      url: toRestRoute(schema) + qb.toQuery(),
    });
  };

  useEffect(() => {
    if (!isContentLoading) {
      refetch();
    }
  }, [pageCurr, pageSize]);

  const rebuildMeta = () => {};

  const doDelete = async (record: RowLike) => {
    try {
      await httpClient.delete<any>(toRestRecordRoute(schema, record));

      message.warning(`Record deleted`);
      refetch();
    } catch (error) {
      message.error(`Error while deleting the record!`);
    }
  };

  // Unlock the loading screen when the content arrvies
  useEffect(() => {
    if (findResponse) {
      setRows(findResponse.data);
      setTotal(findResponse.meta.total);
    }
  }, [findResponse]);

  useEffect(() => {
    const columnDef: Column<RowLike>[] = [];

    for (const field of schema.fields) {
      let sortable = true;
      let resizable = true;
      let maxWidth: number = undefined;
      let minWidth: number = undefined;
      let width: number = undefined;
      let cellClass: string;
      let formatter: Column<RowLike>['formatter'];

      // UUID rendering
      if (field.type === FieldType.UUID) {
        width = minWidth = maxWidth = 280;
      }

      // JSON need special handling to not to crash the renderer
      if (field.type === FieldType.JSON || field.type === FieldType.JSONB) {
        // Some engine can't sort JSON
        sortable = false;
        resizable = false;

        formatter = props => {
          return <>{JSON.stringify(props.row[field.reference])}</>;
        };
      }

      if (field.tags.includes(FieldTag.PRIMARY)) {
        cellClass = 'text-primary-500';
      } else if (field.tags.includes(FieldTag.UNIQUE)) {
        cellClass = 'text-yellow-500';
      } else if (field.type == FieldType.INTEGER) {
        cellClass = 'text-green-500 text-right';

        formatter = props => {
          return (
            <>
              {props.row[field.reference]
                ? (props.row[field.reference] as number).toLocaleString()
                : '0'}
            </>
          );
        };
      }

      if (field.type == FieldType.DATETIME) {
        width = minWidth = 200;

        cellClass = 'text-right';

        formatter = props => {
          return (
            <>
              {props.row[field.reference]
                ? dayjs(props.row[field.reference]).toDate().toLocaleString()
                : ''}
            </>
          );
        };
      }

      if (field.tags.includes(FieldTag.TAGS)) {
        formatter = props => {
          return (
            <>
              {props.row[field.reference]
                ? props.row[field.reference].map(t => <Tag>{t}</Tag>)
                : ''}
            </>
          );
        };
      }

      const fieldDef: Column<RowLike> = {
        name: field.title,
        key: field.reference,
        resizable,
        sortable,
        minWidth: minWidth ?? 150,
        width,
        headerCellClass: 'ag-header',
        cellClass,
        formatter,
      };

      columnDef.push(fieldDef);
    }

    // Has grid configuration
    if (schema.meta?.grid) {
      if (schema.meta.grid?.fieldOrder) {
        console.log('FieldOrder', schema.meta.grid?.fieldOrder);

        columnDef.sort((a, b) => {
          // Field has no ref?
          if (!a.key) {
            return 0;
          }

          const aIdx = schema.meta.grid.fieldOrder.findIndex(i => i == a.key);
          const bIdx = schema.meta.grid.fieldOrder.findIndex(i => i == b.key);

          return aIdx > bIdx ? 1 : -1;
        });
      }
    }

    // // Pinned column at the end
    columnDef.push({
      name: 'Actions',
      key: null,
      width: 80,
      sortable: false,
      headerCellClass: 'ag-header',
      formatter: p => {
        return (
          <div className="text-center">
            <Button
              size="small"
              key="edit"
              className="hover:text-yellow-500 hover:border-yellow-500 mr-0.5"
              icon={<EditOutlined />}
              onClick={() => setShowEdit(p.row)}
            ></Button>
            <Popconfirm
              title="Are You sure to delete the record?"
              okText="Yes, delete"
              cancelText="No"
              placement="left"
              icon={<QuestionCircleOutlined />}
              onConfirm={() => doDelete(p.row)}
              key="delete"
            >
              <Button
                size="small"
                className="hover:text-red-500 hover:border-red-500"
                icon={<DeleteOutlined />}
              ></Button>
            </Popconfirm>
          </div>
        );
      },
    });

    setColumns(columnDef);
  }, [schema]);

  const bouncedMeta = debounce(() => {
    rebuildMeta();
  }, 1_000);

  return (
    <>
      <div className="flex my-2">
        <div className="grow">
          <Button.Group>
            <Button icon={<FileOutlined />} onClick={() => setShowCreate(true)}>
              New
            </Button>
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Reload
            </Button>
            <Button icon={<DeleteOutlined />} disabled>
              Delete
            </Button>
          </Button.Group>
        </div>
      </div>

      <DataGrid
        className="ag-table"
        columns={columns}
        rows={rows}
        rowHeight={30}
        headerRowHeight={32}
        style={{ height: Math.max(320, 54 + rows.length * 30) }}
      />

      <div className="flex my-2">
        <div className="grow text-right">
          <Pagination
            total={total}
            defaultCurrent={pageCurr}
            current={pageCurr}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100, 500, 1000]}
            showSizeChanger
            showQuickJumper
            showTotal={total => (
              <span>
                Total{' '}
                <span className="text-green-500">{total.toLocaleString()}</span>{' '}
                record
              </span>
            )}
            onChange={(_pageNth, _pageSize) => {
              setPageCurr(_pageNth);
              setPageSize(_pageSize);
            }}
          />
        </div>
      </div>

      {showCreate ? (
        <ContentCreateComponent
          schema={schema}
          onClose={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      ) : undefined}
      {showEdit ? (
        <ContentUpdateComponent
          content={showEdit}
          schema={schema}
          onClose={() => {
            setShowEdit(null);
            refetch();
          }}
        />
      ) : undefined}
    </>
  );
}
