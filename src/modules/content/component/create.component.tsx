import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { RowLike } from '../../../app/interface/row-like.interface';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { ISchema } from '../../schema';
import { getUiWidget } from '../util/get-ui-schema';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { toRestRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  onClose: () => void;
};

export default function ContentCreateComponent({ schema, onClose }: Props) {
  const httpClient = useHttpClientSimple();
  const [formSchema, setFormSchema] = useState({});
  const [uiSchema, setUiSchema] = useState<any>({});

  useEffect(() => {
    const formSchema = schemaToJsonSchema(schema, CrudAction.CREATE, true);
    const uiSchema = getUiWidget(schema);

    setFormSchema(formSchema);
    setUiSchema(uiSchema);

    return () => {
      setFormSchema({});
    };
  }, [schema]);

  const doCreate = async (form: { formData: RowLike }) => {
    try {
      await httpClient.post<RowLike>(toRestRoute(schema), form.formData);
      message.success(`New record created!`);

      onClose();
    } catch (error) {
      message.error(`Error while creating the record!`);
      console.error(error);
    }
  };

  return (
    <Drawer
      width="40%"
      visible={true}
      title={`Create New ${schema.title}`}
      onClose={onClose}
    >
      <Form schema={formSchema} onSubmit={doCreate} uiSchema={uiSchema}>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
