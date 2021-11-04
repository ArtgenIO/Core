import { TableOutlined } from '@ant-design/icons';
import Form from '@rjsf/antd';
import { Button, message, Skeleton } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClientOld } from '../../../management/backoffice/library/http-client';
import { useHttpClient } from '../../../management/backoffice/library/use-http-client';
import { ISchema } from '../../schema';
import { CrudAction } from '../interface/crud-action.enum';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { routeCrudAPI, routeCrudUI } from '../util/schema-url';

interface RouteParams {
  database: string;
  reference: string;
  record: string;
}

export default function CrudUpdateComponent() {
  const history = useHistory();
  const location = useLocation();
  const httpClient = useHttpClientOld();

  const route = useParams<RouteParams>();
  const [formSchema, setFormSchema] = useState({});
  const APIURL = routeCrudAPI(route) + location.search;

  // Load schema
  const [{ data: schemas, loading: iSchemaLoading }] = useHttpClient<ISchema[]>(
    routeCrudAPI({ database: 'system', reference: 'Schema' }) +
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
  const [{ data: content, loading: isContentLoading }] =
    useHttpClient<ISchema>(APIURL);

  useEffect(() => {
    if (schemas && schemas.length) {
      setFormSchema(schemaToJsonSchema(schemas[0], CrudAction.UPDATE));
    }
    return () => {
      setFormSchema({});
    };
  }, [schemas]);

  const handleSubmit = async (form: any) => {
    const data = form.formData;

    console.log('Sending', data);

    try {
      await httpClient.patch<any>(APIURL, data);

      message.success(`Record has been updated!`);
      // Go back to the read index
      history.push(routeCrudUI(route));
    } catch (error) {
      message.error(`An error occured while we tried to update the record`);
    }
  };

  return (
    <Skeleton loading={iSchemaLoading}>
      <PageWithHeader
        header={
          <PageHeader
            title={`Update ${schemas ? schemas[0].label : '~'}`}
            avatar={{
              icon: <TableOutlined />,
            }}
          />
        }
      >
        <Skeleton loading={isContentLoading}>
          <div className="content-box px-24 py-12 w-2/3 mx-auto">
            <Form
              schema={formSchema}
              formData={content ? content[0] : {}}
              onSubmit={form => handleSubmit(form)}
            >
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Form>
          </div>
        </Skeleton>
      </PageWithHeader>
    </Skeleton>
  );
}
