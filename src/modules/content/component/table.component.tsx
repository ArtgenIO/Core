import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, message, Pagination, Popconfirm, Table, Tag } from 'antd';
import Column from 'antd/lib/table/Column';
import { SorterResult } from 'antd/lib/table/interface';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
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
  const [rows, setRows] = useState<RowLike[]>([]);
  const [sorters, setSorters] = useState<string[]>([]);

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

    if (sorters) {
      qb.orderBy(sorters.join(', '));
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
  }, [pageCurr, pageSize, sorters]);

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

      <Table
        className="ag-table"
        dataSource={rows}
        pagination={false}
        size="small"
        onChange={(pagination, filters, sorter, extra) => {
          if (sorter instanceof Array) {
            setSorters(
              sorter.map(
                s => `${s.column.key} ${s.order == 'ascend' ? 'asc' : 'desc'}`,
              ),
            );
          } else {
            sorter = sorter as SorterResult<RowLike>;

            if (sorter.column) {
              setSorters([
                `${sorter.column.key} ${
                  sorter.order == 'ascend' ? 'asc' : 'desc'
                }`,
              ]);
            } else {
              setSorters([]);
            }
          }
        }}
        bordered
      >
        {schema.fields.map((f, idx) => {
          return (
            <Column
              title={f.title}
              dataIndex={f.reference}
              key={f.reference}
              sortDirections={['ascend', 'descend']}
              filterMode="menu"
              sorter={f.type == FieldType.JSON ? false : { multiple: idx }}
              render={(val, record) => {
                const classes = [];

                if (f.tags.includes(FieldTag.TAGS)) {
                  return val && val.length ? (
                    <>
                      {val.map(t => (
                        <Tag>{t}</Tag>
                      ))}
                    </>
                  ) : (
                    <>---</>
                  );
                }

                if (f.type === FieldType.JSON || f.type === FieldType.JSONB) {
                  val = JSON.stringify(val);
                }

                if (f.tags.includes(FieldTag.PRIMARY)) {
                  classes.push('text-primary-500');
                } else if (f.tags.includes(FieldTag.UNIQUE)) {
                  classes.push('text-yellow-500');
                } else if (f.type === FieldType.INTEGER) {
                  classes.push('text-green-500');
                }

                return <span className={classes.join(' ')}>{val}</span>;
              }}
            ></Column>
          );
        })}

        <Column
          title={<div className="text-center">Actions</div>}
          fixed="right"
          width={90}
          render={(v, record) => (
            <div className="text-center">
              <Button
                size="small"
                key="edit"
                className="hover:text-yellow-500 hover:border-yellow-500 mr-0.5"
                icon={<EditOutlined />}
                onClick={() => setShowEdit(record as RowLike)}
              ></Button>
              <Popconfirm
                title="Are You sure to delete the record?"
                okText="Yes, delete"
                cancelText="No"
                placement="left"
                icon={<QuestionCircleOutlined />}
                onConfirm={() => doDelete(record as RowLike)}
                key="delete"
              >
                <Button
                  size="small"
                  className="hover:text-red-500 hover:border-red-500"
                  icon={<DeleteOutlined />}
                ></Button>
              </Popconfirm>
            </div>
          )}
        ></Column>
      </Table>

      <div className="flex my-2 bg-midnight-800 rounded-sm px-2 py-1">
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
