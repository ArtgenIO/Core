import { TableOutlined } from '@ant-design/icons';
import Form from '@rjsf/antd';
import { Button, message, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { ContentAction } from '../interface/content-action.enum';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import {
  routeCrudUI,
  toODataRoute,
  toRestRecordRoute,
} from '../util/schema-url';

interface RouteParams {
  database: string;
  reference: string;
  record: string;
}

export default function CrudUpdateComponent() {
  const redirect = useNavigate();
  const location = useLocation();
  const httpClient = useHttpClientOld();

  const route = useParams() as unknown as RouteParams;
  const [formSchema, setFormSchema] = useState({});
  const APIURL = toODataRoute(route) + location.search;

  // Load schema
  const [{ data: schema, loading: iSchemaLoading }] = useHttpClient<ISchema>(
    `/api/rest/main/schema/${route.database}/${route.reference}`,
  );

  // Load content
  const [{ data: content, loading: isContentLoading }] =
    useHttpClient<ISchema>(APIURL);

  useEffect(() => {
    if (schema) {
      setFormSchema(schemaToJsonSchema(schema, ContentAction.UPDATE));
    }
    return () => {
      setFormSchema({});
    };
  }, [schema]);

  const handleSubmit = async (form: any) => {
    const data = form.formData;

    try {
      await httpClient.patch<any>(toRestRecordRoute(schema, data), data);

      message.success(`Record has been updated!`);
      // Go back to the read index
      redirect(routeCrudUI(route));
    } catch (error) {
      message.error(`An error occured while we tried to update the record`);
    }
  };

  return (
    <Skeleton loading={iSchemaLoading}>
      <PageWithHeader
        header={
          <PageHeader
            title={`Update ${schema ? schema.title : '~'}`}
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
