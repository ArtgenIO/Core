import {
  CalendarOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  FilterOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  message,
  notification,
  Pagination,
  Popconfirm,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import Column, { ColumnProps } from 'antd/lib/table/Column';
import { SorterResult } from 'antd/lib/table/interface';
import dayjs from 'dayjs';
import cloneDeep from 'lodash.clonedeep';
import React, { useEffect, useState } from 'react';
import { ResizableBox } from 'react-resizable';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { RowLike } from '../../../app/interface/row-like.interface';
import { pageSizeAtom } from '../../admin/admin.atoms';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { FieldTag, FieldType, IField, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import { GridTools } from '../util/grid.tools';
import { toRestRecordRoute, toRestRoute } from '../util/schema-url';
import ContentCreateComponent from './create.component';
import ContentGridConfigComponent from './grid-config.component';
import GridFilterComponent from './grid-filter.component';
import './grid.component.less';
import ContentUpdateComponent from './update.component';

type Props = {
  schema: ISchema;
};

export default function TableComponent({ schema }: Props) {
  const httpClient = useHttpClientSimple();
  const [browserParams, setBrowserParams] = useSearchParams();

  const [apiUrl, setApiUrl] = useState(null);

  // Extended views in drawer
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<RowLike>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Pagination
  const [pageSize, setPageSize] = useRecoilState(pageSizeAtom);
  const [pageCurr, setPageCurr] = useState(1);
  const [total, setTotal] = useState(0);

  // Grid content state
  const [rows, setRows] = useState<RowLike[]>([]);
  const [sorters, setSorters] = useState<[string, 'asc' | 'desc'][]>([]);
  const [loading, setLoading] = useState(true);
  const [refetch, doRefetch] = useState<number>(() => Date.now());
  const [fields, setFields] = useState<IField[]>([]);
  const [selected, setSelected] = useState<RowLike[]>([]);
  const [selectedKey, setSelectedKey] = useState<React.Key[]>([]);
  const [filter, setFilter] = useState<string>(null);

  // Visuals
  const [fieldWidth, setFieldWidth] = useState<[string, number][]>([]);

  useEffect(() => {
    if (browserParams.has('page')) {
      setPageCurr(parseInt(browserParams.get('page'), 10));
    }
  }, [browserParams]);

  // Reset states
  useEffect(() => {
    setFilter(null);
    setShowFilter(false);
    setSorters([]);
    setSelected([]);

    setFieldWidth(schema.fields.map(f => [f.reference, 280]));

    return () => {
      setFilter(null);
      setShowFilter(false);
      setSorters([]);
      setSelected([]);
    };
  }, [schema]);

  useEffect(() => {
    const fields = cloneDeep(schema).fields.map(FieldTool.withMeta);

    let apiUrl = toRestRoute(schema, qb => {
      // Pagination limit
      qb.top(pageSize);

      if (pageCurr > 1) {
        qb.skip(pageCurr * pageSize - pageSize);

        // Sync with the pagination param
        browserParams.set('page', pageCurr.toString());
      }

      if (sorters) {
        const orderBy = sorters
          // Remove the hidden fields from sorting
          .filter(
            s => !fields.find(FieldTool.fReference(s[0])).meta.grid.hidden,
          )
          .map(s => s.join(' '))
          .join(', ');

        if (orderBy.length) {
          qb.orderBy(orderBy);
        }
      }

      qb.select(
        fields
          .filter(f => FieldTool.isPrimary(f) || !f.meta.grid.hidden)
          .map(f => f.reference)
          .join(','),
      );

      return qb;
    });

    if (filter && filter != '?$filter=()') {
      apiUrl += `&${filter.substring(1)}`;
    }

    setBrowserParams(browserParams);

    setFields(fields.sort(GridTools.sortFields));
    setApiUrl(apiUrl + `&--artgen-no-cache=${refetch}`);
  }, [pageCurr, pageSize, sorters, schema, refetch, filter]);

  useEffect(() => {
    if (apiUrl) {
      setLoading(true);

      const pks = schema.fields
        .filter(FieldTool.isPrimary)
        .map(f => f.reference);

      httpClient
        .get<IFindResponse>(apiUrl)
        .then(reply => {
          setRows(
            reply.data.data.map((row, idx) => {
              row['__ag_rowkey'] = pks.map(pk => row[pk]).join('///');
              return row;
            }),
          );

          setTotal(reply.data.meta.total);
        })
        .catch(e => {
          message.error('Invalid request!');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [apiUrl]);

  const doUpdate = record => {
    setLoading(true);

    httpClient
      .patch<RowLike>(toRestRecordRoute(schema, record), record)
      .then(() => {
        doRefetch(Date.now());
        message.success('Record updated');
      });
  };

  return (
    <>
      <div className="flex my-2">
        <div className="shrink">
          <Button.Group size="small">
            <Button icon={<FileOutlined />} onClick={() => setShowCreate(true)}>
              New
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilter(v => !v)}
            >
              Filter
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => doRefetch(Date.now())}
              loading={loading}
              disabled={loading}
            >
              Reload
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => setShowConfig(true)}>
              Appearance
            </Button>

            <Popconfirm
              disabled={!selected.length}
              title="Are You sure to delete this extension?"
              okText="Yes, delete it"
              cancelText="No"
              okType="danger"
              placement="left"
              icon={<QuestionCircleOutlined />}
              onConfirm={() => {
                // Lock the interactions
                setLoading(true);

                // Concurrent delete
                Promise.all(
                  selected.map(r =>
                    httpClient.delete(toRestRecordRoute(schema, r)),
                  ),
                ).then(() => {
                  notification.warn({
                    message: `Success, deleted [${selected.length}] record!`,
                    duration: 3,
                  });

                  doRefetch(Date.now());
                  setSelected([]);
                  setSelectedKey([]);
                });
              }}
            >
              <Button
                icon={<DeleteOutlined />}
                disabled={!selected.length}
                danger
              >
                Delete {selected.length ? `x${selected.length}` : ''}
              </Button>
            </Popconfirm>
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
                <span className="text-green-500">
                  {total ? total.toLocaleString() : 0}
                </span>{' '}
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

      {showFilter ? (
        <GridFilterComponent schema={schema} setFilter={setFilter} />
      ) : undefined}

      <Table
        className="ag-table"
        rowKey="__ag_rowkey"
        dataSource={rows}
        pagination={false}
        loading={loading}
        onRow={(record, idx) => {
          return {
            onDoubleClick: () => setShowEdit(record),
          };
        }}
        rowSelection={{
          type: 'checkbox',
          fixed: 'left',
          selectedRowKeys: selectedKey,
          onChange: (keys, selectedRows) => {
            setSelected(selectedRows);
            setSelectedKey(keys);
          },
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        }}
        scroll={{
          x: '100%',
        }}
        tableLayout="fixed"
        size="small"
        onChange={(pagination, filters, sorter, extra) => {
          // Multisort
          if (sorter instanceof Array) {
            setSorters(
              sorter.map(s => [
                s.column.key.toString(),
                s.order == 'ascend' ? 'asc' : 'desc',
              ]),
            );
          } else {
            // Single sort
            sorter = sorter as SorterResult<RowLike>;

            if (sorter.column) {
              setSorters([
                [
                  sorter.column.key.toString(),
                  sorter.order == 'ascend' ? 'asc' : 'desc',
                ],
              ]);
            } else {
              setSorters([]); // Sort removed
            }
          }
        }}
        bordered
      >
        {fields
          .filter(f => !f.meta.grid.hidden)
          .map((f, idx) => {
            let icon: React.ReactNode = <FileOutlined />;
            let align: ColumnProps<RowLike>['align'] = 'left';
            let sortable = true;

            if (FieldTool.isInteger(f)) {
              align = 'right';
            } else if (f.type === FieldType.UUID) {
              align = 'left';
            } else if (FieldTool.isDate(f)) {
              align = 'right';
              icon = <CalendarOutlined />;
            } else if (FieldTool.isJson(f)) {
              align = 'center';
              icon = <CodeOutlined />;
              sortable = false;
            }

            if (f.type === FieldType.BOOLEAN) {
              align = 'center';
            }

            if (FieldTool.isPrimary(f)) {
              icon = <KeyOutlined />;
            }

            const width = fieldWidth.find(r => r[0] === f.reference)[1];

            return (
              <Column
                title={
                  <ResizableBox
                    key={f.reference}
                    width={width - (sortable ? 36 : 12)}
                    height={24}
                    axis="x"
                    minConstraints={[100, 24]}
                    maxConstraints={[4000, 24]}
                    onResize={(e, data) =>
                      setFieldWidth(state => {
                        const newState = cloneDeep(state);

                        newState.find(r => r[0] === f.reference)[1] =
                          data.size.width + (sortable ? 36 : 12);

                        return newState;
                      })
                    }
                    resizeHandles={['w']}
                    onClick={e => {
                      e.stopPropagation(); // Capture the event from the sorter
                    }}
                  >
                    <div className="flex w-full">
                      <div className="shrink mr-1 ml-3">{icon}</div>
                      <div className="grow">{f.title}</div>
                    </div>
                  </ResizableBox>
                }
                dataIndex={f.reference}
                key={f.reference}
                sortDirections={sortable ? ['ascend', 'descend'] : undefined}
                filterMode="menu"
                ellipsis={{
                  showTitle: false,
                }}
                onCell={(record, idx) => {
                  return {
                    onClick: () => {
                      console.log('Cell clicked', record);
                    },
                  };
                }}
                align={align}
                width={width}
                sorter={sortable ? { multiple: idx } : false}
                render={(val, record: RowLike) => {
                  const classes = [];
                  const oVal = val;

                  if (oVal === null) {
                    val = (
                      <code className="p-0.5 bg-midnight-800 text-purple-500 rounded-sm underline">
                        &lt;NULL&gt;
                      </code>
                    );
                  }

                  if (f.tags.includes(FieldTag.TAGS)) {
                    return oVal && oVal.length ? (
                      <>
                        {oVal.map((t, i) => (
                          <Tag key={t + i.toString()} color="magenta">
                            {t}
                          </Tag>
                        ))}
                      </>
                    ) : (
                      <>---</>
                    );
                  }

                  if (FieldTool.isJson(f)) {
                    val = (
                      <code className="p-0.5 bg-midnight-800 text-midnight-200 rounded-sm underline">
                        &lt;JSON&gt;
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

                  if (f.type === FieldType.BOOLEAN) {
                    val = (
                      <Switch
                        checked={oVal}
                        size="small"
                        checkedChildren="✓"
                        unCheckedChildren={oVal === null ? '∅' : '!'}
                        onChange={newValue => {
                          record[f.reference] = newValue;
                          doUpdate(record);
                        }}
                      />
                    );

                    // Display the null value
                    if (oVal === null) {
                      val = (
                        <Tooltip title="null" placement="left">
                          {val}
                        </Tooltip>
                      );
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
          width={80}
          render={(v, record) => (
            <div className="text-center inline-block" style={{ width: 50 }}>
              <Button.Group size="small">
                <Button
                  key="edit"
                  className="hover:text-green-500 hover:border-green-500"
                  icon={<EditOutlined />}
                  onClick={() => setShowEdit(record as RowLike)}
                ></Button>
              </Button.Group>
            </div>
          )}
        ></Column>
      </Table>

      {showCreate ? (
        <ContentCreateComponent
          schema={schema}
          onClose={() => {
            setShowCreate(false);
            doRefetch(Date.now());
          }}
        />
      ) : undefined}
      {showConfig ? (
        <ContentGridConfigComponent
          schema={schema}
          onClose={() => {
            setShowConfig(false);
          }}
        />
      ) : undefined}
      {showEdit ? (
        <ContentUpdateComponent
          content={showEdit}
          schema={schema}
          onClose={() => {
            setShowEdit(null);
            doRefetch(Date.now());
          }}
        />
      ) : undefined}
    </>
  );
}
