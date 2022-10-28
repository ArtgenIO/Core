import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { RowLike } from '../../../app/interface/row-like.interface';
import { schemasAtom } from '../../admin/admin.atoms.jsx';
import { useHttpClientSimple } from '../../admin/library/simple.http-client';
import { ISchema } from '../../database/types/schema.interface';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { generateUIConfig } from '../util/generate-ui-config.jsx';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { toRestRoute } from '../util/schema-url';

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
