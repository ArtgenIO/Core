import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { useHttpClientOld } from '../../admin/library/http-client';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { ISchema } from '../../schema';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { toRestRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  onClose: () => void;
};

export default function CrudCreateComponent({ schema, onClose }: Props) {
  const httpClient = useHttpClientOld();
  const [formSchema, setFormSchema] = useState({});

  useEffect(() => {
    setFormSchema(schemaToJsonSchema(schema, CrudAction.CREATE, true));

    return () => {
      setFormSchema({});
    };
  }, [schema]);

  const doCreate = async (form: any) => {
    try {
      await httpClient.post<any>(toRestRoute(schema), form.formData);
      message.success(`New record created!`);

      onClose();
    } catch (error) {
      message.error(`Error while creating the record!`);
      console.error(error);
    }
  };

  return (
    <Drawer
      width="33%"
      visible={true}
      title={`Create New ${schema.title}`}
      onClose={onClose}
    >
      <Form schema={formSchema} onSubmit={form => doCreate(form)}>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
