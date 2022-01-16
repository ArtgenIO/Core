import { TableOutlined } from '@ant-design/icons';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { ISchema } from '../../schema';
import { IContentModule } from '../interface/content-module.interface';
import { toRestSysRoute } from '../util/schema-url';
import TableComponent from './table.component';
import TitleComponent from './title.components';

type RouteParams = {
  database: string;
  reference: string;
};

type SchemaWithModule = ISchema & {
  module?: IContentModule;
};

export default function ContentListComponent() {
  const route = useParams() as unknown as RouteParams;

  const [schema, setSchema] = useState<SchemaWithModule>(null);
  const [modules, setModules] = useState([]);

  // Load schema
  const [{ data: schemaResponse, loading: iSchemaLoading }] = useHttpClient<
    IFindResponse<SchemaWithModule>
  >(
    toRestSysRoute('schema') +
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
    IFindResponse<IContentModule>
  >(toRestSysRoute('module') + new QueryBuilder().top(500).toQuery());

  useEffect(() => {
    if (schemaResponse && schemaResponse.data.length) {
      setSchema(schemaResponse.data[0]);
    }
  }, [schemaResponse]);

  useEffect(() => {
    if (modulesResponse) {
      setModules(modulesResponse.data);
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
          />
        }
      >
        {schema ? <TableComponent schema={schema} /> : undefined}
      </PageWithHeader>
    </>
  );
}
