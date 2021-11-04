import { TableOutlined } from '@ant-design/icons';
import Form from '@rjsf/antd';
import { Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClient } from '../../../management/backoffice/library/http-client';
import { ISchema } from '../../schema';
import { schemasAtom } from '../../schema/schema.atoms';
import { CrudAction } from '../interface/crud-action.enum';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';

export default function CrudUpdateComponent() {
  const history = useHistory();
  const httpClient = useHttpClient();

  const params = useParams<{ schema: string; record: string }>();
  const schemas = useRecoilValue(schemasAtom);

  // Local state
  const [schema, setSchema] = useState<ISchema>(null);

  // Current data
  const [formData, setFormData] = useState<unknown>(null);

  useEffect(() => {
    console.log('Got params', params);

    if (params.schema) {
      const cSchema = schemas.find(s => s.id === params.schema);

      console.log('Schemas', schemas);
      console.log('cSchema', cSchema);

      if (cSchema) {
        setSchema(cSchema);

        httpClient
          .get(
            `/api/$system/content/crud/${params.schema}/read/${params.record}`,
          )
          .then(response => setFormData(response.data));
      }
    }

    return () => {};
  }, [params]);

  const doUpdate = async (form: any) => {
    const data = form.formData;

    console.log('Sending', data);

    try {
      const response = await httpClient.patch<any>(
        `/api/$system/content/crud/${params.schema}/update/${params.record}`,
        data,
      );

      message.success(`Updated [${params.record}]`);

      history.push(`/backoffice/content/crud/${params.schema}`);
    } catch (error) {
      message.error(`Could not update the record @@`);
    }
  };

  if (!schema || !formData) {
    return <h1>Update form loading...</h1>;
  }

  const formSchema = schemaToJsonSchema(schema, CrudAction.CREATE);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={`Update ${schema.label} [${(formData as any).id}]`}
          avatar={{
            icon: <TableOutlined />,
          }}
        />
      }
    >
      <div className="content-box px-24 py-12 w-2/3 mx-auto">
        <Form
          schema={formSchema}
          formData={formData}
          onSubmit={form => doUpdate(form)}
        >
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form>
      </div>
    </PageWithHeader>
  );
}
