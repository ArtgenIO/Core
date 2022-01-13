import {
  DatabaseOutlined,
  FileAddOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { IContentModule } from '../interface/content-module.interface';
import { toODataRoute } from '../util/schema-url';
import ContentCreateComponent from './create.component';
import TableComponent from './table.component';
import TitleComponent from './title.components';
import ContentUpdateComponent from './update.component';

type RouteParams = {
  database: string;
  reference: string;
};

type SchemaWithModule = ISchema & {
  module?: IContentModule;
};

type Row = Record<string, unknown> | object;

export default function ContentListComponent() {
  const route = useParams() as unknown as RouteParams;
  const httpClient = useHttpClientSimple();

  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<Row>(null);
  const [schema, setSchema] = useState<SchemaWithModule>(null);
  const [modules, setModules] = useState([]);

  // Load schema
  const [{ data: schemaResponse, loading: iSchemaLoading }] = useHttpClient<
    SchemaWithModule[]
  >(
    toODataRoute({ database: 'main', reference: 'Schema' }) +
      new QueryBuilder()
        .filter(f =>
          f
            .filterExpression('database', 'eq', route.database)
            .filterExpression('reference', 'eq', route.reference),
        )
        .top(1)
        .select('*,module')
        .toQuery(),
  );

  // Load modules
  const [{ data: modulesResponse, loading: isModulesLoading }] = useHttpClient<
    IContentModule[]
  >(
    toODataRoute({ database: 'main', reference: 'Module' }) +
      new QueryBuilder().top(500).toQuery(),
  );

  useEffect(() => {
    if (schemaResponse && schemaResponse.length) {
      setSchema(schemaResponse[0]);
    }
  }, [schemaResponse]);

  useEffect(() => {
    if (modulesResponse) {
      setModules(modulesResponse);
    }
  }, [modulesResponse]);

  if (isModulesLoading || iSchemaLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <PageWithHeader
        header={
          <PageHeader
            title={
              schema && !isModulesLoading ? (
                <TitleComponent modules={modules} schema={schema} />
              ) : (
                'Loading...'
              )
            }
            avatar={{
              icon: <TableOutlined />,
            }}
            actions={
              schema ? (
                <>
                  <Button
                    key="create"
                    type="primary"
                    onClick={() => setShowCreate(true)}
                    icon={<FileAddOutlined />}
                  >
                    Create New
                  </Button>
                  <Link
                    key="edit"
                    to={`/admin/database/artboard/${route.database}`}
                  >
                    <Button type="ghost" icon={<DatabaseOutlined />}>
                      Edit Schema
                    </Button>
                  </Link>
                </>
              ) : undefined
            }
          />
        }
      >
        {schema ? (
          <TableComponent schema={schema} onEdit={setShowEdit} />
        ) : undefined}
      </PageWithHeader>
      {showCreate ? (
        <ContentCreateComponent
          schema={schema}
          onClose={() => {
            setShowCreate(false);
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
