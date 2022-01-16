import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, message, Pagination, Popconfirm, Table, Tag } from 'antd';
import Column, { ColumnProps } from 'antd/lib/table/Column';
import { SorterResult } from 'antd/lib/table/interface';
import dayjs from 'dayjs';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { RowLike } from '../../../app/interface/row-like.interface';
import { pageSizeAtom } from '../../admin/admin.atoms';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
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
  const [pageSize, setPageSize] = useRecoilState(pageSizeAtom);
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
        <div className="shrink">
          <Button.Group size="small">
            <Button icon={<FileOutlined />} onClick={() => setShowCreate(true)}>
              New
            </Button>
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Reload
            </Button>
            <Button icon={<SettingOutlined />} type="dashed">
              Configure
            </Button>
            <Button icon={<DeleteOutlined />} disabled danger>
              Delete
            </Button>
          </Button.Group>
        </div>

        <div className="grow text-right">
          <Pagination
            size="small"
            total={total}
            defaultCurrent={pageCurr}
            current={pageCurr}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100, 500, 1000]}
            showSizeChanger
            showQuickJumper
            showTotal={total => (
              <span>
                <span className="text-green-500">{total.toLocaleString()}</span>{' '}
                Record
              </span>
            )}
            onChange={(_pageNth, _pageSize) => {
              setPageCurr(_pageNth);
              setPageSize(_pageSize);
            }}
          />
        </div>
      </div>

      <Table
        className="ag-table"
        dataSource={rows}
        pagination={false}
        loading={isContentLoading}
        scroll={{
          x: true,
        }}
        size="small"
        onChange={(pagination, filters, sorter, extra) => {
          // Multisort
          if (sorter instanceof Array) {
            setSorters(
              sorter.map(
                s => `${s.column.key} ${s.order == 'ascend' ? 'asc' : 'desc'}`,
              ),
            );
          } else {
            // Single sort
            sorter = sorter as SorterResult<RowLike>;

            if (sorter.column) {
              setSorters([
                `${sorter.column.key} ${
                  sorter.order == 'ascend' ? 'asc' : 'desc'
                }`,
              ]);
            } else {
              setSorters([]); // Sort removed
            }
          }
        }}
        bordered
      >
        {schema.fields.map((f, idx) => {
          let align: ColumnProps<RowLike>['align'] = 'left';
          let width: ColumnProps<RowLike>['width'];

          if (FieldTool.isInteger(f)) {
            align = 'right';
          } else if (f.type === FieldType.UUID) {
            align = 'left';
            width = 280;
          } else if (FieldTool.isDate(f)) {
            align = 'right';
            width = 240;
          } else if (FieldTool.isJson(f)) {
            align = 'center';
            width = 100;
          }

          return (
            <Column
              title={f.title}
              dataIndex={f.reference}
              key={f.reference}
              sortDirections={['ascend', 'descend']}
              filterMode="menu"
              align={align}
              width={width}
              sorter={FieldTool.isJson(f) ? false : { multiple: idx }}
              render={(val, record) => {
                const classes = [];

                if (f.tags.includes(FieldTag.TAGS)) {
                  return val && val.length ? (
                    <>
                      {val.map(t => (
                        <Tag color="magenta">{t}</Tag>
                      ))}
                    </>
                  ) : (
                    <>---</>
                  );
                }

                if (FieldTool.isJson(f)) {
                  val = (
                    <code className="p-0.5 bg-midnight-800 text-midnight-200 rounded-sm underline">
                      Show Code
                    </code>
                  );
                }

                if (FieldTool.isPrimary(f)) {
                  classes.push('text-primary-500');
                } else if (f.tags.includes(FieldTag.UNIQUE)) {
                  classes.push('text-yellow-500');
                } else if (f.type === FieldType.INTEGER) {
                  classes.push('text-green-500');
                } else if (FieldTool.isDate(f)) {
                  if (val) {
                    val = dayjs(val).format('YYYY-MM-DD dddd, HH:mm:ss');
                    classes.push('text-pink-500');
                  }
                }

                return <span className={classes.join(' ')}>{val}</span>;
              }}
            ></Column>
          );
        })}

        <Column
          title="Actions"
          fixed="right"
          align="center"
          width={75}
          render={(v, record) => (
            <div className="text-center inline-block" style={{ width: 50 }}>
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
