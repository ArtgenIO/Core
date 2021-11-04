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

export default function CrudCreateComponent() {
  const history = useHistory();
  const httpClient = useHttpClient();

  const params = useParams<{ id: string }>();
  const schemas = useRecoilValue(schemasAtom);

  // Local state
  const [schema, setSchema] = useState<ISchema>(null);

  useEffect(() => {
    if (params.id) {
      const cSchema = schemas.find(s => s.id === params.id);

      if (cSchema) {
        setSchema(cSchema);
      }
    }

    return () => {};
  }, [params]);

  const doCreate = async (form: any) => {
    const data = form.formData;

    console.log('Sending', data);

    try {
      const response = await httpClient.post<any>(
        `/api/$system/content/crud/${params.id}`,
        data,
      );

      message.success(`New record created [${response.data.id}]`);

      history.push(`/backoffice/content/crud/${params.id}`);
    } catch (error) {
      message.error(`Could not create the record @@`);
    }
  };

  if (!schema) {
    return <h1>Loading...</h1>;
  }

  const formSchema = schemaToJsonSchema(schema, CrudAction.CREATE);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={`Create New ${schema.label}`}
          avatar={{
            icon: <TableOutlined />,
          }}
        />
      }
    >
      <div className="content-box px-24 py-12 w-2/3 mx-auto">
        <Form schema={formSchema} onSubmit={form => doCreate(form)}>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form>
      </div>
    </PageWithHeader>
  );
}
