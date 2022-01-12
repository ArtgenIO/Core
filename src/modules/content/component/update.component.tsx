import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { useHttpClientOld } from '../../admin/library/http-client';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { ISchema } from '../../schema';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { toRestRecordRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  content: Record<string, unknown> | object;
  onClose: () => void;
};

export default function ContentUpdateComponent({
  content,
  schema,
  onClose,
}: Props) {
  const httpClient = useHttpClientOld();
  const [formSchema, setFormSchema] = useState({});

  useEffect(() => {
    if (schema) {
      setFormSchema(schemaToJsonSchema(schema, CrudAction.UPDATE));
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
      onClose();
    } catch (error) {
      message.error(`An error occured while we tried to update the record`);
    }
  };

  return (
    <Drawer
      width="40%"
      visible={true}
      title={`Edit ${schema.title}`}
      onClose={onClose}
    >
      <Form
        schema={formSchema}
        formData={content}
        onSubmit={form => handleSubmit(form)}
        className="mx-2"
      >
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </Form>
    </Drawer>
  );
}
