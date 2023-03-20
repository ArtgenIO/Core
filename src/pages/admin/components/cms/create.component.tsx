import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CrudAction } from '../../../../api/types/crud-action.enum.js';
import { RowLike } from '../../../../api/types/row-like.interface.js';
import { ISchema } from '../../../../models/schema.interface.js';
import { schemasAtom } from '../../atoms/admin.atoms.jsx';
import { generateUIConfig } from '../../library/generate-ui-config.jsx';
import { schemaToJsonSchema } from '../../library/schema-to-jsonschema';
import { toRestRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';

type Props = {
  schema: ISchema;
  onClose: (hasChanged: boolean) => void;
};

export default function ContentCreateComponent({ schema, onClose }: Props) {
  const client = useHttpClientSimple();
  const schemas = useRecoilValue(schemasAtom);
  const [formJsonSchema, setFormJsonSchema] = useState({});
  const [UISchema, setUISchema] = useState<any>({});

  useEffect(() => {
    setFormJsonSchema(schemaToJsonSchema(schema, CrudAction.CREATE, true));
    setUISchema(generateUIConfig(schema, schemas));

    return () => {
      setFormJsonSchema({});
    };
  }, [schema]);

  const doCreate = async (form: { formData: RowLike }) => {
    try {
      await client.post<RowLike>(toRestRoute(schema), form.formData);
      message.success(`New record created!`);

      onClose(true);
    } catch (error) {
      message.error(`Error while creating the record!`);
      console.error(error);
    }
  };

  return (
    <Drawer
      width="40%"
      open={true}
      title={`Create New ${schema.title}`}
      onClose={() => onClose(false)}
    >
      <Form schema={formJsonSchema} onSubmit={doCreate} uiSchema={UISchema}>
        <Button className="success" block htmlType="submit">
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
