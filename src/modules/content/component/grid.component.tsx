import {
  FileOutlined,
  FilterOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { ColumnApi } from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';
import { AgGridColumnProps, AgGridReact } from 'ag-grid-react';
import { Button, message } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { RowLike } from '../../../app/interface/row-like.interface';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { FieldType, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import { toRestRecordRoute, toRestRoute } from '../util/schema-url';
import ContentCreateComponent from './create.component';
import './grid.component.less';
import ContentUpdateComponent from './update.component';

type Props = {
  schema: ISchema;
};

export default function GridComponent({ schema }: Props) {
  const httpClient = useHttpClientSimple();

  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<RowLike>(null);
  const [perPage, setPerPage] = useState(25);

  // Load content
  const [{ data: content, loading: isContentLoading }, reload] = useHttpClient<
    object[]
  >(toRestRoute(schema) + new QueryBuilder().top(perPage).toQuery());

  const buildRequest = (columnApi: ColumnApi) => {
    const qb = new QueryBuilder();

    qb.top(perPage);

    for (const col of columnApi.getAllColumns()) {
      if (col.isSorting()) {
        qb.orderBy(`${col.getId()} ${col.getSort()}`);
      }
    }

    const url = toRestRoute(schema) + qb.toQuery();
    setRows(null);

    reload({
      url,
    });
  };

  // Local state
  const [columns, setColumns] = useState<AgGridColumnProps[]>([]);
  const [rows, setRows] = useState<object[]>(null);

  const doDelete = async (record: RowLike) => {
    try {
      await httpClient.delete<any>(toRestRecordRoute(schema, record));

      message.warning(`Record deleted`);
      reload();
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
      const columnDef: AgGridColumnProps[] = [];

      for (const field of schema.fields) {
        let sortable = true;
        let cellRenderer: AgGridColumnProps['cellRenderer'];
        let initialWidth: AgGridColumnProps['initialWidth'];
        let minWidth: AgGridColumnProps['minWidth'];
        let maxWidth: AgGridColumnProps['maxWidth'];
        const cellClass: AgGridColumnProps['cellClass'] = [];

        // UUID rendering
        if (field.type === FieldType.UUID) {
          cellRenderer = p => {
            return p.value.substring(0, 8);
          };

          initialWidth = 100;
          minWidth = 100;
          maxWidth = 100;
          cellClass.push('!text-primary-500');
        }

        if (FieldTool.isPrimary(field)) {
          cellClass.push('!text-yellow-500');
        }

        // Unsortable types.
        if (field.type === FieldType.JSON || field.type === FieldType.JSONB) {
          sortable = false;

          // JSON has to be stringified
          cellRenderer = params => {
            return `<code class="bg-midnight-600 p-0.5 rounded-md"
            >${JSON.stringify(params.value).substring(0, 8)}</code>`;
          };
        }

        const fieldDef: AgGridColumnProps = {
          field: field.reference,
          headerName: field.title,
          resizable: true,
          initialWidth,
          minWidth,
          maxWidth,
          cellRenderer,
          sortable,
          cellClass,
        };

        columnDef.push(fieldDef);
      }

      // Pinned colum
      columnDef.push({
        headerName: 'Actions',
        field: null,
        width: 90,
        maxWidth: 90,
        sortable: false,
        suppressMovable: true,
        filter: false,
        cellClass: ['text-center'],
        cellRenderer: () => {
          return '[D]';
        },
      });

      setColumns(columnDef);
    }
  }, [schema]);

  return (
    <>
      <div className="flex flex-row-reverse">
        <Button.Group className="mb-2">
          <Button icon={<FileOutlined />} onClick={() => setShowCreate(true)}>
            New
          </Button>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button icon={<ReloadOutlined />} onClick={() => reload()}>
            Reload
          </Button>
          <Button icon={<RollbackOutlined />}>Reset</Button>
        </Button.Group>
      </div>

      <div className="ag-theme-balham-dark w-full" style={{ height: 600 }}>
        <AgGridReact
          reactUi={true}
          columnDefs={columns}
          rowData={rows}
          rowSelection="multiple"
          onGridReady={e => {
            e.api.sizeColumnsToFit();
          }}
          onSortChanged={e => {
            buildRequest(e.columnApi);
          }}
          onRowDoubleClicked={e => {
            setShowEdit(e.data);
          }}
        />
      </div>
      {showCreate ? (
        <ContentCreateComponent
          schema={schema}
          onClose={() => {
            setShowCreate(false);
            reload();
          }}
        />
      ) : undefined}
      {showEdit ? (
        <ContentUpdateComponent
          content={showEdit}
          schema={schema}
          onClose={() => {
            setShowEdit(null);
          }}
        />
      ) : undefined}
    </>
  );
}
